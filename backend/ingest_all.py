import os
import sys
import time
import json
import hashlib
import io
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.rag import chunk_text, embed_text, collection, delete_chunks_for_source
from app.website_sources import TRACKED_PAGES
from app.website_ingest import fetch_clean_text, content_hash, hashes_store

import cloudscraper
scraper = cloudscraper.create_scraper()

NORMALIZED_LINKS_FILE = "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/scratch/normalized_links.json"

def extract_pdf_text(pdf_bytes: bytes, filename: str) -> str:
    text_content = ""
    if pdf_bytes.startswith(b"%PDF") or b"%PDF" in pdf_bytes[:1024]:
        try:
            import pypdf
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = pypdf.PdfReader(pdf_stream)
            print(f"  [PDF] Total pages detected: {len(reader.pages)}")
            pages_text = []
            for i, page in enumerate(reader.pages):
                try:
                    extracted = page.extract_text()
                    if extracted and len(extracted.strip()) > 3:
                        pages_text.append(extracted.strip())
                    else:
                        pages_text.append("")
                except Exception as pe_elem:
                    print(f"  [PDF] Page {i+1} extraction failed: {pe_elem}")
                    pages_text.append("")
            
            total_chars = sum(len(p) for p in pages_text)
            if total_chars < 100:
                print("  [PDF] pypdf extracted very little text. Attempting pdfplumber fallback...")
                try:
                    import pdfplumber
                    pdf_stream.seek(0)
                    with pdfplumber.open(pdf_stream) as pdf:
                        for idx, pl_page in enumerate(pdf.pages):
                            pl_text = pl_page.extract_text()
                            if pl_text and len(pl_text.strip()) > len(pages_text[idx]):
                                pages_text[idx] = pl_text.strip()
                except Exception as ple:
                    print(f"  [PDF] pdfplumber fallback failed: {ple}")
            
            final_pages = []
            for idx, text in enumerate(pages_text):
                if text:
                    final_pages.append(f"--- Page {idx+1} ---\n{text}")
            text_content = "\n\n".join(final_pages).strip()
            print(f"  [PDF] Extracted {len(text_content)} characters.")
        except Exception as pe:
            print(f"  [PDF] Error processing {filename}: {pe}")
    return text_content

def main():
    print(f"=== SRKREC Batch Ingestion Script started at {datetime.now().isoformat()} ===")
    
    # 1. Load normalized links
    if not os.path.exists(NORMALIZED_LINKS_FILE):
        print(f"Error: Normalized links file not found at {NORMALIZED_LINKS_FILE}")
        return
        
    with open(NORMALIZED_LINKS_FILE, "r", encoding="utf-8") as f:
        links_data = json.load(f)
        
    pdf_urls = links_data.get("pdf_urls", [])
    
    print(f"Loaded {len(TRACKED_PAGES)} tracked HTML pages and {len(pdf_urls)} high-value PDF URLs.")
    
    # 2. Ingest HTML Pages
    print("\n--- INGESTING HTML PAGES ---")
    for idx, page in enumerate(TRACKED_PAGES):
        url = page["url"]
        category = page["category"]
        print(f"\n[{idx+1}/{len(TRACKED_PAGES)}] Processing HTML: {url} ({category})")
        
        try:
            # Fetch content
            text, _ = fetch_clean_text(url)
            if not text.strip():
                print(f"  -> Warning: empty content fetched for {url}. Skipping.")
                continue
                
            new_hash = content_hash(text)
            old_hash = hashes_store.get_hash(url)
            
            # De-duplicate check
            if new_hash == old_hash:
                print("  -> Page content unchanged. Skipping.")
                continue
                
            # Title from URL
            path_part = url.replace("https://", "").replace("www.", "").rstrip("/")
            title = path_part.replace("/", " ").replace("-", " ").replace("_", " ").title()
            if not title:
                title = "SRKREC Home Page"
                
            chunks = chunk_text(text, title, category)
            print(f"  -> Generated {len(chunks)} chunk(s). Computing embeddings...")
            
            # Delete old chunks
            delete_chunks_for_source(url)
            
            # Embed and batch store
            ids = []
            embeddings = []
            docs = []
            metas = []
            
            for chunk in chunks:
                try:
                    emb = embed_text(chunk["text"])
                    ids.append(chunk["id"])
                    embeddings.append(emb)
                    docs.append(chunk["text"])
                    metas.append({
                        **chunk["metadata"],
                        "source": url,
                        "category": category,
                        "file_name": url
                    })
                    # Cooldown to prevent Gemini rate limit issues
                    time.sleep(0.1)
                except Exception as chunk_err:
                    print(f"  -> Error embedding chunk: {chunk_err}")
                    
            if ids:
                collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    documents=docs,
                    metadatas=metas
                )
                hashes_store.save_hash(url, new_hash)
                print(f"  -> Successfully stored {len(ids)} chunk(s) in batch.")
                
        except Exception as e:
            print(f"  -> Error ingesting HTML {url}: {e}")
            
        time.sleep(0.5)

    # 3. Ingest High-Value PDFs
    print("\n--- INGESTING HIGH-VALUE PDFs ---")
    for idx, pdf_url in enumerate(pdf_urls):
        category = "hostels" if "hostel" in pdf_url.lower() else "college"
        print(f"\n[{idx+1}/{len(pdf_urls)}] Processing PDF: {pdf_url} ({category})")
        
        try:
            # Download PDF bytes
            pdf_resp = scraper.get(pdf_url, timeout=20)
            if pdf_resp.status_code != 200:
                print(f"  -> Failed download (Status {pdf_resp.status_code})")
                continue
                
            pdf_bytes = pdf_resp.content
            new_hash = content_hash(pdf_bytes)
            old_hash = hashes_store.get_hash(pdf_url)
            
            if new_hash == old_hash:
                print("  -> PDF content unchanged. Skipping.")
                continue
                
            filename = pdf_url.split("/")[-1].split("?")[0]
            if not filename.lower().endswith(".pdf"):
                filename += ".pdf"
                
            text = extract_pdf_text(pdf_bytes, filename)
            if not text.strip():
                print("  -> Warning: No text extracted. Skipping.")
                continue
                
            title = filename.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
            chunks = chunk_text(text, title, category)
            print(f"  -> Generated {len(chunks)} chunk(s) from PDF. Computing embeddings...")
            
            # Delete old chunks
            delete_chunks_for_source(pdf_url)
            
            # Embed and batch store
            ids = []
            embeddings = []
            docs = []
            metas = []
            
            for chunk in chunks:
                try:
                    emb = embed_text(chunk["text"])
                    ids.append(chunk["id"])
                    embeddings.append(emb)
                    docs.append(chunk["text"])
                    metas.append({
                        **chunk["metadata"],
                        "source": pdf_url,
                        "category": category,
                        "file_name": pdf_url
                    })
                    # Cooldown to prevent Gemini rate limit issues
                    time.sleep(0.1)
                except Exception as chunk_err:
                    print(f"  -> Error embedding chunk: {chunk_err}")
                    
            if ids:
                collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    documents=docs,
                    metadatas=metas
                )
                hashes_store.save_hash(pdf_url, new_hash)
                print(f"  -> Successfully stored {len(ids)} chunk(s) in batch.")
                
        except Exception as e:
            print(f"  -> Error ingesting PDF {pdf_url}: {e}")
            
        time.sleep(0.5)
        
    print("\n=== Ingestion Complete! ===")

if __name__ == "__main__":
    main()
