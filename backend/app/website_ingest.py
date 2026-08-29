import os
import json
import hashlib
from datetime import datetime
import trafilatura
from fastapi import APIRouter

from app.config import CHROMA_DB_DIR
from app.website_sources import TRACKED_PAGES
from app.rag import chunk_text, embed_text, collection, delete_chunks_for_source

router = APIRouter()
PAGE_HASHES_FILE = os.path.join(CHROMA_DB_DIR, "page_hashes.json")

class PageHashesStore:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.hashes = {}
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.hashes = json.load(f)
            except Exception as e:
                print(f"Page hashes load error: {e}")
                self.hashes = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self.hashes, f, indent=2)
        except Exception as e:
            print(f"Page hashes save error: {e}")

    def get_hash(self, url: str) -> str:
        return self.hashes.get(url, {}).get("hash", "")

    def save_hash(self, url: str, new_hash: str):
        self.hashes[url] = {
            "hash": new_hash,
            "updated_at": datetime.now().isoformat()
        }
        self._save()

hashes_store = PageHashesStore(PAGE_HASHES_FILE)

def fetch_clean_text(url: str) -> str:
    clean_url = url.strip()
    try:
        import cloudscraper
        scraper = cloudscraper.create_scraper()
        response = scraper.get(clean_url, timeout=10)
        if response.status_code != 200:
            raise ValueError(f"Server returned status code {response.status_code}")
        html_content = response.text
    except Exception as e:
        print(f"[FETCH WARNING] cloudscraper failed for {clean_url}: {e}. Trying trafilatura fallback...")
        html_content = trafilatura.fetch_url(clean_url)
        if not html_content:
            raise ValueError(f"Could not fetch content from {clean_url}: {e}")

    text = trafilatura.extract(html_content)
    return text or ""

def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

@router.post("/refresh-website")
async def refresh_website():
    results = []
    print(f"[WEBSITE INGEST] Started manually triggered sync at {datetime.now().isoformat()}")
    for page in TRACKED_PAGES:
        url, category = page["url"], page["category"]
        try:
            text = fetch_clean_text(url)
            new_hash = content_hash(text)
            old_hash = hashes_store.get_hash(url)

            if new_hash == old_hash:
                print(f"[WEBSITE INGEST] Page {url} is unchanged. Skipping re-embedding.")
                results.append({"url": url, "status": "unchanged"})
                continue

            delete_chunks_for_source(url)
            
            # Derive clean title from URL path
            path_part = url.replace("https://", "").replace("www.", "").rstrip("/")
            title = path_part.replace("/", " ").replace("-", " ").replace("_", " ").title()
            
            chunks = chunk_text(text, title, category)
            print(f"[WEBSITE INGEST] Page {url} updated: generated {len(chunks)} chunk(s). Storing...")
            
            for i, chunk in enumerate(chunks):
                try:
                    embedding = embed_text(chunk["text"])
                    collection.add(
                        ids=[chunk["id"]],
                        embeddings=[embedding],
                        documents=[chunk["text"]],
                        metadatas=[{**chunk["metadata"], "source": url, "category": category, "file_name": url}],
                    )
                    print(f"[WEBSITE INGEST] Stored chunk {i+1}/{len(chunks)} (ID: {chunk['id']})")
                except Exception as chunk_err:
                    print(f"[WEBSITE INGEST] FAILED storing chunk {i+1}/{len(chunks)}: {chunk_err}")
                    raise chunk_err
            
            hashes_store.save_hash(url, new_hash)
            results.append({"url": url, "status": "updated", "chunks": len(chunks)})
        except Exception as e:
            print(f"[WEBSITE INGEST] FAILED to ingest {url}: {e}")
            results.append({"url": url, "status": "failed", "error": str(e)})

    return {"results": results}
