import os
import json
import hashlib
import re
from urllib.parse import urljoin
from datetime import datetime
import trafilatura
from fastapi import APIRouter

from app.config import CHROMA_DB_DIR
from app.website_sources import TRACKED_PAGES
from app.rag import chunk_text, embed_text, collection, delete_chunks_for_source, process_uploaded_file

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

def fetch_clean_text(url: str) -> tuple:
    clean_url = url.strip()
    html_content = ""
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
    return (text or "", html_content or "")

def extract_pdf_links(html: str, base_url: str) -> list:
    if not html:
        return []
    raw_links = re.findall(r'href=["\'](.*?\.pdf(?:\?.*?)?)["\']', html, re.IGNORECASE)
    pdf_urls = []
    for link in raw_links:
        full_url = urljoin(base_url, link)
        if "srkrec.ac.in" in full_url.lower():
            pdf_urls.append(full_url)
    return list(set(pdf_urls))

def content_hash(text_or_bytes) -> str:
    if isinstance(text_or_bytes, str):
        data = text_or_bytes.encode("utf-8")
    else:
        data = text_or_bytes
    return hashlib.sha256(data).hexdigest()

@router.post("/refresh-website")
async def refresh_website():
    results = []
    print(f"[WEBSITE INGEST] Started manually triggered sync at {datetime.now().isoformat()}")
    
    import cloudscraper
    scraper = cloudscraper.create_scraper()

    for page in TRACKED_PAGES:
        url, category = page["url"], page["category"]
        try:
            text, html_content = fetch_clean_text(url)
            new_hash = content_hash(text)
            old_hash = hashes_store.get_hash(url)

            # Ingest static page text content
            if new_hash == old_hash:
                print(f"[WEBSITE INGEST] Page {url} is unchanged. Skipping re-embedding.")
                results.append({"url": url, "status": "unchanged"})
            else:
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

            # Discover and ingest PDFs linked on this page
            pdf_links = extract_pdf_links(html_content, url)
            if pdf_links:
                print(f"[WEBSITE INGEST] Discovered {len(pdf_links)} PDF(s) on {url}: {pdf_links}")
                for pdf_url in pdf_links:
                    try:
                        # 1. Download PDF bytes
                        print(f"[WEBSITE INGEST] Downloading PDF: {pdf_url}")
                        pdf_resp = scraper.get(pdf_url, timeout=15)
                        if pdf_resp.status_code != 200:
                            print(f"[WEBSITE INGEST] FAILED downloading PDF {pdf_url}: status {pdf_resp.status_code}")
                            continue
                        
                        pdf_bytes = pdf_resp.content
                        pdf_hash = content_hash(pdf_bytes)
                        old_pdf_hash = hashes_store.get_hash(pdf_url)

                        if pdf_hash == old_pdf_hash:
                            print(f"[WEBSITE INGEST] PDF {pdf_url} is unchanged. Skipping.")
                            results.append({"url": pdf_url, "status": "unchanged", "type": "pdf"})
                            continue

                        # Delete previous chunks for this PDF source URL
                        delete_chunks_for_source(pdf_url)

                        filename = pdf_url.split("/")[-1].split("?")[0]
                        if not filename.lower().endswith(".pdf"):
                            filename += ".pdf"

                        # 2. Parse, chunk, embed, and store the PDF
                        print(f"[WEBSITE INGEST] Ingesting PDF content for {filename}...")
                        res = process_uploaded_file(file_name=filename, file_bytes=pdf_bytes, category=category)
                        
                        if res.get("status") == "success":
                            # Re-write the source parameter to be the URL so we can delete/track it properly
                            # Update metadata fields for the newly added chunks of this source
                            for doc in collection.documents:
                                if doc["metadata"].get("file_name") == filename:
                                    doc["metadata"]["source"] = pdf_url
                                    doc["metadata"]["file_name"] = pdf_url

                            hashes_store.save_hash(pdf_url, pdf_hash)
                            print(f"[WEBSITE INGEST] Successfully ingested PDF {pdf_url} ({res.get('chunks')} chunks)")
                            results.append({"url": pdf_url, "status": "updated", "chunks": res.get("chunks"), "type": "pdf"})
                        else:
                            print(f"[WEBSITE INGEST] Failed parsing PDF {pdf_url}: {res.get('message')}")
                            results.append({"url": pdf_url, "status": "failed", "error": res.get("message"), "type": "pdf"})

                    except Exception as pdf_err:
                        print(f"[WEBSITE INGEST] FAILED processing PDF link {pdf_url}: {pdf_err}")
                        results.append({"url": pdf_url, "status": "failed", "error": str(pdf_err), "type": "pdf"})

        except Exception as e:
            print(f"[WEBSITE INGEST] FAILED to ingest {url}: {e}")
            results.append({"url": url, "status": "failed", "error": str(e)})

    return {"results": results}
