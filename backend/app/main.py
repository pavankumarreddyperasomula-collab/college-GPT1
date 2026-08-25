import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from app.auth import (
    SendOtpRequest,
    LoginRequest,
    ChangeCredentialsRequest,
    CreateHostelAdminRequest,
    CreateStaffAccountRequest,
    UploadHostelStudentsRequest,
    process_send_otp,
    authenticate_user,
    change_credentials,
    create_hostel_admin,
    create_staff_account,
    upload_hostel_students_data,
    get_hostel_students,
    delete_hostel_student
)
from app.rag import (
    query_rag, 
    add_document_to_rag, 
    get_all_documents, 
    delete_document_from_rag,
    generate_notice_llm_draft,
    generate_llm_answer,
    notif_store,
    events_store,
    documents_store,
    GROQ_API_KEY
)

app = FastAPI(title="Campus Assistant API", version="3.0.0")

origins = [
    "https://college-gpt-1.vercel.app",
    "https://college-gpt-1.vercel.app/",
    "https://college-gpt1.onrender.com",
    "https://college-gpt1.onrender.com/",
    "http://localhost:5173",
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def db_session_middleware(request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"status": "ok"}

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

class SendDocumentRequest(BaseModel):
    title: str
    body: str
    file_name: Optional[str] = None
    category: Optional[str] = "college"
    sender_name: Optional[str] = None
    sender_designation: Optional[str] = None
    sender_role: Optional[str] = "hod"
    sender_scope: Optional[str] = "ALL"

class EventRequest(BaseModel):
    title: Optional[str] = "Campus Event"
    category: Optional[str] = "Campus Event"
    date: Optional[str] = None
    location: Optional[str] = "SRKR Campus Grounds"
    description: Optional[str] = "Official SRKR campus event."
    link: Optional[str] = "https://srkr.ac.in"
    sender_role: Optional[str] = "hod"
    sender_scope: Optional[str] = "ALL"

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
    try:
        q = (req.query or "").strip()
        if not q:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
        return query_rag(q)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in ask_endpoint: {e}")
        return {
            "answer": "I am here to assist you! Please feel free to ask any questions about SRKR Engineering College (hostels, syllabus, exam dates, rules, notices) or any general questions.",
            "sources": []
        }

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

# ==================== DEPARTMENT DOCUMENTS DISPATCH ENDPOINTS ====================

@app.post("/send-document")
def send_document_endpoint(req: SendDocumentRequest):
    title = req.title.strip()
    body = req.body.strip()
    if not title or not body:
        raise HTTPException(status_code=400, detail="Document title and body content are required.")

    sender_role = (req.sender_role or "hod").lower().strip()
    sender_name = (req.sender_name or "Faculty Authority").strip()
    sender_designation = (req.sender_designation or "Department Head").strip()
    sender_scope = (req.sender_scope or "ALL").strip()
    category = (req.category or "college").lower().strip()
    file_name = (req.file_name or f"{title.replace(' ', '_')}.txt").strip()

    # Index into RAG vector store for chatbot querying
    chunks_added = add_document_to_rag(title=title, body=body, category=category)

    now = datetime.now()
    doc_record = {
        "id": f"doc_{uuid.uuid4().hex[:8]}",
        "title": title,
        "file_name": file_name,
        "body": body,
        "category": category,
        "sender_name": sender_name,
        "sender_designation": sender_designation,
        "sender_role": sender_role,
        "sender_scope": sender_scope,
        "created_at": now.isoformat(),
        "date_time_str": now.strftime("%d-%m-%Y at %I:%M %p")
    }
    documents_store.add_document(doc_record)

    return {
        "status": "success",
        "message": f"Document '{title}' dispatched to students and indexed in RAG knowledge base with {chunks_added} chunk(s).",
        "document": doc_record
    }

@app.get("/documents")
def get_documents_endpoint(
    role: str = Query("student"),
    hod_code: Optional[str] = Query(None),
    is_hostel_resident: bool = Query(False)
):
    docs = documents_store.get_user_documents(
        role=role,
        hod_code=hod_code,
        is_hostel_resident=is_hostel_resident
    )
    return {
        "status": "success",
        "count": len(docs),
        "documents": docs
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
    deleted_store = notif_store.delete_notice(notice_id)
    deleted_rag = delete_document_from_rag(notice_id)
    if not deleted_store and not deleted_rag:
        raise HTTPException(status_code=404, detail="Notice not found or already deleted.")
    return {"status": "success", "message": f"Notice '{notice_id}' deleted successfully."}

@app.delete("/delete-document/{doc_id}")
def delete_document_endpoint(doc_id: str):
    deleted_store = documents_store.delete_document(doc_id)
    deleted_rag = delete_document_from_rag(doc_id)
    if not deleted_store and not deleted_rag:
        raise HTTPException(status_code=404, detail="Document not found or already deleted.")
    return {"status": "success", "message": f"Document '{doc_id}' deleted successfully."}

# ==================== CREDENTIALS & HOSTEL ADMIN MANAGEMENT ====================

@app.post("/change-credentials")
def change_credentials_endpoint(req: ChangeCredentialsRequest):
    res = change_credentials(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.post("/create-hostel-admin")
def create_hostel_admin_endpoint(req: CreateHostelAdminRequest):
    res = create_hostel_admin(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.post("/create-staff-account")
def create_staff_account_endpoint(req: CreateStaffAccountRequest):
    res = create_staff_account(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.post("/upload-hostel-students")
def upload_hostel_students_endpoint(req: UploadHostelStudentsRequest):
    res = upload_hostel_students_data(req)
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.get("/hostel-students")
def get_hostel_students_endpoint():
    return get_hostel_students()

@app.delete("/hostel-students/{reg_no}")
def delete_hostel_student_endpoint(reg_no: str):
    res = delete_hostel_student(reg_no)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

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
    now = datetime.now()
    title = (req.title or "").strip() or "SRKR Campus Event"
    link = (req.link or "").strip() or "https://srkr.ac.in"
    desc = (req.description or "").strip() or f"Official SRKR campus announcement for {title}."
    cat = (req.category or "").strip() or "Campus Event"
    loc = (req.location or "").strip() or "SRKR Campus Grounds"
    evt_date = (req.date or "").strip() or now.strftime("%d-%m-%Y")

    sender_role = (req.sender_role or "hod").lower().strip()
    sender_scope = (req.sender_scope or "ALL").strip()

    event_record = {
        "id": f"evt_{uuid.uuid4().hex[:8]}",
        "title": title,
        "category": cat,
        "date": evt_date,
        "location": loc,
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
        "message": f"Event '{title}' posted successfully.",
        "event": event_record
    }

@app.delete("/delete-event/{event_id}")
def delete_event_endpoint(event_id: str):
    deleted = events_store.delete_event(event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found or already deleted.")
    return {"status": "success", "message": f"Event '{event_id}' deleted successfully."}


