import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from app.auth import SendOtpRequest, LoginRequest, process_send_otp, authenticate_user
from app.rag import (
    query_rag, 
    add_document_to_rag, 
    get_all_documents, 
    delete_document_from_rag,
    generate_notice_llm_draft,
    generate_llm_answer,
    notif_store,
    events_store,
    GROQ_API_KEY
)

app = FastAPI(title="Campus Assistant API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class FormatDocRequest(BaseModel):
    title: str
    raw_text: str

class NoticeRequest(BaseModel):
    title: str
    body: str
    admin_username: str

class GenerateNoticeRequest(BaseModel):
    theme: str
    category: str  # "college" or "hostel"
    start_date: str
    end_date: str

class SendNoticeRequest(BaseModel):
    theme: str
    title: Optional[str] = None
    body: str
    category: str  # "college" or "hostel"
    start_date: str
    end_date: str
    audience: List[str]  # ["hods", "faculty", "students", "hostel", "all"]
    sender_role: str  # "hod", "hostel_admin", "super_admin"
    sender_scope: Optional[str] = None

class EventRequest(BaseModel):
    title: str
    category: Optional[str] = "Campus Event"
    date: Optional[str] = None
    location: Optional[str] = "SRKR Engineering College"
    description: str
    link: str
    sender_role: str  # "hod", "super_admin", "faculty", etc.
    sender_scope: Optional[str] = None  # e.g., HOD-Arjun-4892

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "COLLEGE GPT Backend API",
        "college": "SRKR Engineering College",
        "version": "3.0.0"
    }

@app.post("/send-otp")
def send_otp_endpoint(req: SendOtpRequest):
    return process_send_otp(req.mobile)

@app.post("/login")
def login_endpoint(req: LoginRequest):
    res = authenticate_user(req)
    if res.status == "error":
        raise HTTPException(status_code=401, detail=res.message)
    return res

@app.post("/ask")
def ask_endpoint(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return query_rag(req.query.strip())

@app.post("/format-document")
def format_document_endpoint(req: FormatDocRequest):
    title = req.title.strip() or "Campus Document"
    raw_text = req.raw_text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Document content cannot be empty.")

    formatted_result = ""
    if GROQ_API_KEY:
        models_to_try = ["openai/gpt-oss-20b", "groq/compound-mini", "openai/gpt-oss-120b", "qwen/qwen3.6-27b"]
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        prompt = (
            f"You are an expert AI Document Editor. Reorganize and clean up the following raw text for topic '{title}'. "
            "Structure it professionally with clear headings, organized sub-sections, bullet points, and neat paragraphs. "
            "Do NOT lose any key details or facts from the original content.\n\n"
            f"Raw Text:\n{raw_text}"
        )
        for model_name in models_to_try:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are a professional academic document formatting assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
                formatted_result = completion.choices[0].message.content.strip()
                if formatted_result:
                    break
            except Exception as e:
                print(f"AI Document Formatting Error with {model_name}: {e}")

    if not formatted_result:
        # Fallback structured formatting
        formatted_result = (
            f"=== {title.upper()} ===\n"
            f"Organized Document by COLLEGE GPT AI\n"
            f"Date: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}\n\n"
            f"1. Executive Summary\n"
            f"-------------------\n"
            f"{raw_text[:200]}...\n\n"
            f"2. Detailed Content\n"
            f"-------------------\n"
            f"{raw_text}\n\n"
            f"=== End of Formatted Document ==="
        )

    return {
        "status": "success",
        "title": title,
        "formatted_text": formatted_result
    }

@app.post("/generate-notice")
def generate_notice_endpoint(req: GenerateNoticeRequest):
    if not req.theme.strip():
        raise HTTPException(status_code=400, detail="Notice theme/topic is required.")
    
    draft = generate_notice_llm_draft(
        theme=req.theme.strip(),
        category=req.category.strip().lower(),
        start_date=req.start_date.strip(),
        end_date=req.end_date.strip()
    )
    return {
        "status": "success",
        "draft_text": draft
    }

@app.post("/send-notice")
def send_notice_endpoint(req: SendNoticeRequest):
    title = (req.title or req.theme).strip()
    body = req.body.strip()
    if not title or not body:
        raise HTTPException(status_code=400, detail="Title and body text are required.")

    sender_role = req.sender_role.lower().strip()
    if sender_role not in ["hod", "hostel_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only HOD, Hostel Admin, or Super Admin can send notices.")

    # 1. Embed notice into ChromaDB RAG vector store
    chunks_added = add_document_to_rag(title=title, body=body, category=req.category)

    # 2. Add notice to Notification Store with timestamp
    now = datetime.now()
    notice_record = {
        "id": f"notif_{uuid.uuid4().hex[:8]}",
        "theme": req.theme.strip(),
        "title": title,
        "category": req.category.strip().lower(),
        "body": body,
        "start_date": req.start_date.strip(),
        "end_date": req.end_date.strip(),
        "audience": req.audience,
        "sender_role": sender_role,
        "sender_scope": req.sender_scope or "ALL",
        "created_at": now.isoformat(),
        "date_time_str": now.strftime("%d-%m-%Y at %I:%M %p")
    }
    notif_store.add_notice(notice_record)

    return {
        "status": "success",
        "message": f"Notice '{title}' published and indexed in RAG knowledge base with {chunks_added} chunk(s).",
        "notice": notice_record
    }

@app.get("/notifications")
def get_notifications_endpoint(
    role: str = Query("student"),
    hod_code: Optional[str] = Query(None),
    is_hostel_resident: bool = Query(False)
):
    notifs = notif_store.get_user_notifications(
        role=role,
        hod_code=hod_code,
        is_hostel_resident=is_hostel_resident
    )
    return {
        "status": "success",
        "count": len(notifs),
        "notifications": notifs
    }

@app.post("/add-notice")
def add_notice_endpoint(req: NoticeRequest):
    title = req.title.strip()
    body = req.body.strip()
    if not title or not body:
        raise HTTPException(status_code=400, detail="Title and body text are required.")

    category = "college"
    if "hostel" in req.admin_username.lower():
        category = "hostel"

    chunks_added = add_document_to_rag(title, body, category)
    return {
        "status": "success",
        "message": f"Notice '{title}' added to {category.capitalize()} vector store with {chunks_added} chunk(s).",
        "category": category
    }

@app.get("/notices")
def list_notices_endpoint(category: Optional[str] = Query(None)):
    docs = get_all_documents(category)
    formatted = []
    seen = set()
    for d in docs:
        t = d["metadata"].get("title", "Notice")
        if t not in seen:
            formatted.append({
                "id": d["id"],
                "title": t,
                "category": d["metadata"].get("category", "general"),
                "snippet": d["text"][:120] + "..."
            })
            seen.add(t)
    return {"status": "success", "count": len(formatted), "notices": formatted}

@app.delete("/delete-notice/{notice_id}")
def delete_notice_endpoint(notice_id: str):
    deleted = delete_document_from_rag(notice_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notice not found or already deleted.")
    return {"status": "success", "message": f"Notice '{notice_id}' deleted successfully from vector store."}

# ==================== CAMPUS EVENTS ENDPOINTS ====================

@app.get("/events")
def get_events_endpoint(
    role: str = Query("student"),
    hod_code: Optional[str] = Query(None)
):
    evts = events_store.get_user_events(role=role, hod_code=hod_code)
    return {
        "status": "success",
        "count": len(evts),
        "events": evts
    }

@app.post("/events")
def create_event_endpoint(req: EventRequest):
    title = req.title.strip()
    link = req.link.strip()
    desc = req.description.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Event title is required.")
    if not link:
        raise HTTPException(status_code=400, detail="Event registration link is required.")

    sender_role = req.sender_role.lower().strip()
    sender_scope = (req.sender_scope or "ALL").strip()

    now = datetime.now()
    event_record = {
        "id": f"evt_{uuid.uuid4().hex[:8]}",
        "title": title,
        "category": req.category.strip() if req.category else "Campus Event",
        "date": req.date.strip() if req.date else now.strftime("%d-%m-%Y"),
        "location": req.location.strip() if req.location else "SRKR Campus Grounds",
        "description": desc,
        "link": link,
        "status": "Active Registration",
        "sender_role": sender_role,
        "sender_scope": sender_scope,
        "created_at": now.isoformat()
    }
    events_store.add_event(event_record)

    return {
        "status": "success",
        "message": f"Event '{title}' posted successfully with registration link.",
        "event": event_record
    }

@app.delete("/delete-event/{event_id}")
def delete_event_endpoint(event_id: str):
    deleted = events_store.delete_event(event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found or already deleted.")
    return {"status": "success", "message": f"Event '{event_id}' deleted successfully."}

