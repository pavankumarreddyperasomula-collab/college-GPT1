import os
import sys
import time
import json
import hashlib
import trafilatura

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.rag import chunk_text, embed_text, collection, delete_chunks_for_source
from app.website_ingest import hashes_store, content_hash

PAGES = [
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/171/content.md",
        "url": "https://www.srkrec.ac.in/departments/cse/faculty/",
        "title": "CSE Allied Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/194/content.md",
        "url": "https://www.srkrec.ac.in/departments/cse/faculty-csd/",
        "title": "CSD Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/196/content.md",
        "url": "https://www.srkrec.ac.in/departments/ece/faculty/",
        "title": "ECE Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/198/content.md",
        "url": "https://www.srkrec.ac.in/departments/eee/faculty/",
        "title": "EEE Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/200/content.md",
        "url": "https://www.srkrec.ac.in/departments/it/faculty/",
        "title": "IT Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/202/content.md",
        "url": "https://www.srkrec.ac.in/departments/it/faculty-csit/",
        "title": "CSIT Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/204/content.md",
        "url": "https://www.srkrec.ac.in/departments/civil/faculty/",
        "title": "Civil Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/206/content.md",
        "url": "https://www.srkrec.ac.in/departments/mechanical/faculty/",
        "title": "Mechanical Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/208/content.md",
        "url": "https://www.srkrec.ac.in/departments/ms/faculty/",
        "title": "MS Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/210/content.md",
        "url": "https://www.srkrec.ac.in/departments/ash/faculty-physics/",
        "title": "Physics Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/212/content.md",
        "url": "https://www.srkrec.ac.in/departments/ash/faculty-maths/",
        "title": "Maths Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/214/content.md",
        "url": "https://www.srkrec.ac.in/departments/ash/faculty-chemistry/",
        "title": "Chemistry Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/216/content.md",
        "url": "https://www.srkrec.ac.in/departments/ash/faculty-english/",
        "title": "English Faculty",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/218/content.md",
        "url": "https://www.srkrec.ac.in/code-of-conduct/",
        "title": "Code of Conduct",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/220/content.md",
        "url": "https://www.srkrec.ac.in/procedure/",
        "title": "Admissions & Joining Procedure",
        "category": "college"
    },
    {
        "file": "C:/Users/pavan kumar reddy/.gemini/antigravity-ide/brain/bbdfb2ff-18f6-46de-9895-98728bd4e3af/.system_generated/steps/222/content.md",
        "url": "https://www.srkrec.ac.in/fee/",
        "title": "Fee Structure",
        "category": "college"
    }
]

def main():
    print(f"=== Starting Ingestion of {len(PAGES)} Extracted Pages ===")
    for idx, p in enumerate(PAGES):
        print(f"\n[{idx+1}/{len(PAGES)}] Ingesting: {p['title']} ({p['url']})")
        if not os.path.exists(p["file"]):
            print(f"  -> Error: file {p['file']} not found!")
            continue
            
        with open(p["file"], "r", encoding="utf-8") as f:
            html_raw = f.read()
            
        text = trafilatura.extract(html_raw) or ""
        if not text.strip():
            print(f"  -> Error: Trafilatura could not extract text.")
            continue
            
        new_hash = content_hash(text)
        
        # Delete old chunks
        delete_chunks_for_source(p["url"])
        
        # Generate chunks
        chunks = chunk_text(text, p["title"], p["category"])
        print(f"  -> Generated {len(chunks)} chunk(s). Embedding...")
        
        ids = []
        embeddings = []
        docs = []
        metas = []
        
        for c in chunks:
            try:
                emb = embed_text(c["text"])
                ids.append(c["id"])
                embeddings.append(emb)
                docs.append(c["text"])
                metas.append({
                    **c["metadata"],
                    "source": p["url"],
                    "category": p["category"],
                    "file_name": p["url"]
                })
                # Prevent rate limit spikes
                time.sleep(0.1)
            except Exception as e:
                print(f"  -> Error embedding chunk: {e}")
                
        if ids:
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=docs,
                metadatas=metas
            )
            hashes_store.save_hash(p["url"], new_hash)
            print(f"  -> Successfully stored {len(ids)} chunk(s) in batch.")
            
    print("\n=== Ingestion of Extracted Pages Complete ===")

if __name__ == "__main__":
    main()
