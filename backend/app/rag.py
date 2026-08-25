import os
import json
import re
import io
import hashlib
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.config import CHROMA_DB_DIR, GROQ_API_KEY

VECTOR_STORE_FILE = os.path.join(CHROMA_DB_DIR, "campus_knowledge_vectors.json")
NOTIFICATIONS_FILE = os.path.join(CHROMA_DB_DIR, "campus_notifications.json")
DOCUMENTS_FILE = os.path.join(CHROMA_DB_DIR, "campus_documents.json")

class LocalVectorStore:
    def __init__(self, storage_file: str):
        self.storage_file = storage_file
        self.documents: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                print(f"Vector store load error: {e}")
                self.documents = []

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        with open(self.storage_file, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2)

    def add(self, ids: List[str], documents: List[str], metadatas: List[dict]):
        for doc_id, text, meta in zip(ids, documents, metadatas):
            existing = next((d for d in self.documents if d["id"] == doc_id), None)
            if existing:
                existing["text"] = text
                existing["metadata"] = meta
            else:
                self.documents.append({
                    "id": doc_id,
                    "text": text,
                    "metadata": meta
                })
        self._save()

    def delete(self, doc_id: str) -> bool:
        initial_len = len(self.documents)
        self.documents = [d for d in self.documents if d["id"] != doc_id and d["metadata"].get("title") != doc_id]
        changed = len(self.documents) < initial_len
        if changed:
            self._save()
        return changed

    def get_all(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if category:
            return [d for d in self.documents if d["metadata"].get("category") == category]
        return self.documents

    def _tokenize(self, text: str) -> List[str]:
        return [w for w in re.findall(r'\w+', text.lower()) if len(w) > 2]

    def query(self, query_text: str, n_results: int = 4, where: Optional[dict] = None) -> Dict[str, Any]:
        filtered_docs = self.documents
        if where and "category" in where:
            filtered_docs = [d for d in self.documents if d["metadata"].get("category") == where["category"]]

        if not filtered_docs:
            filtered_docs = self.documents

        if not filtered_docs:
            return {"documents": [[]], "metadatas": [[]]}

        q_words = set(self._tokenize(query_text))

        scored = []
        for doc in filtered_docs:
            doc_text_lower = doc["text"].lower()
            doc_words = set(self._tokenize(doc["text"]))
            
            overlap = len(q_words.intersection(doc_words))
            
            phrase_boost = 0.0
            for w in q_words:
                if w in doc_text_lower:
                    phrase_boost += 1.5
                if w in doc["metadata"].get("title", "").lower():
                    phrase_boost += 3.0

            total_score = overlap * 2.0 + phrase_boost

            scored.append((total_score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        # Require meaningful score threshold (>= 2.5) to avoid matching common stop-words
        scored_relevant = [item for item in scored if item[0] >= 2.5]

        if not scored_relevant:
            return {
                "documents": [[]],
                "metadatas": [[]]
            }

        top_docs = [item[1]["text"] for item in scored_relevant[:n_results]]
        top_metas = [item[1]["metadata"] for item in scored_relevant[:n_results]]

        return {
            "documents": [top_docs],
            "metadatas": [top_metas]
        }

collection = LocalVectorStore(VECTOR_STORE_FILE)

# Persistent Notification Store with Server-Side Audience Enforcement & Strict Filtering
class NotificationsStore:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.notifications: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.notifications = json.load(f)
            except Exception as e:
                print(f"Notification load error: {e}")
                self.notifications = []
        else:
            # Seed default notifications
            self.notifications = [
                {
                    "id": "notif_001",
                    "theme": "Hostel Gate Pass & Night Out Restrictions",
                    "title": "Hostel Gate Pass & Night Out Restrictions",
                    "category": "hostel",
                    "body": "All hostel students must submit weekend night-out pass requests on the portal before Friday 5:00 PM. Verification calls will be placed to parents.",
                    "start_date": "2026-08-20",
                    "end_date": "2026-09-01",
                    "audience": ["hostel"],
                    "sender_role": "hostel_admin",
                    "sender_scope": "HOSTEL-BLOCK-A",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "notif_002",
                    "theme": "Mid-Semester Examination Schedule Announcement",
                    "title": "Mid-Semester Examination Schedule Announcement",
                    "category": "college",
                    "body": "Mid-Semester exams will take place from October 15th to October 22nd. Faculty members are requested to upload question paper drafts by October 5th.",
                    "start_date": "2026-10-15",
                    "end_date": "2026-10-22",
                    "audience": ["students", "faculty", "hods"],
                    "sender_role": "super_admin",
                    "sender_scope": "ALL-SUPER-ADMIN",
                    "created_at": datetime.now().isoformat()
                }
            ]
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.notifications, f, indent=2)

    def add_notice(self, notice_data: dict):
        # SERVER-SIDE AUDIENCE OVERRIDE ENFORCEMENT
        sender_role = notice_data.get("sender_role", "").lower().strip()
        client_audience = [a.lower().strip() for a in notice_data.get("audience", [])]

        if sender_role == "hostel_admin":
            # Force audience to hostel-resident students ONLY server-side
            notice_data["audience"] = ["hostel"]
        elif sender_role == "hod":
            # Allow students, faculty, or super_admin within HOD department scope
            allowed = [a for a in client_audience if a in ["students", "faculty", "super_admin", "superadmin"]]
            notice_data["audience"] = allowed if allowed else ["students"]
        elif sender_role == "super_admin":
            if "all" in client_audience:
                notice_data["audience"] = ["hods", "faculty", "students", "hostel", "super_admin"]
            else:
                notice_data["audience"] = client_audience

        self.notifications.insert(0, notice_data)
        self._save()

    def delete_notice(self, notice_id: str) -> bool:
        initial_len = len(self.notifications)
        self.notifications = [n for n in self.notifications if n.get("id") != notice_id]
        changed = len(self.notifications) < initial_len
        if changed:
            self._save()
        return changed

    def get_user_notifications(self, role: str, hod_code: Optional[str] = None, is_hostel_resident: bool = False) -> List[dict]:
        role_clean = role.lower().strip()
        dept_clean = (hod_code or "").upper().strip()
        filtered = []

        for n in self.notifications:
            aud = [a.lower().strip() for a in n.get("audience", [])]
            sender_role = n.get("sender_role", "").lower().strip()
            sender_scope = (n.get("sender_scope", "")).upper().strip()

            # 1. Student Filtering
            if role_clean == "student":
                # From HOD matching student's department or HOD code
                is_from_dept_hod = bool(
                    sender_role == "hod"
                    and ("students" in aud or "all" in aud)
                    and (
                        not sender_scope
                        or sender_scope == "ALL"
                        or not dept_clean
                        or sender_scope == dept_clean
                        or dept_clean in sender_scope
                        or sender_scope in dept_clean
                    )
                )
                # Super Admin student broadcast
                is_student_broadcast = bool(
                    sender_role == "super_admin"
                    and ("students" in aud or "all" in aud)
                )
                # Hostel notice (from Hostel Admin or Super Admin with "hostel") ONLY IF is_hostel_resident == True
                is_hostel_notice = bool(
                    is_hostel_resident
                    and ("hostel" in aud or sender_role == "hostel_admin")
                )

                if is_from_dept_hod or is_student_broadcast or is_hostel_notice:
                    filtered.append(n)

            # 2. Faculty Filtering
            elif role_clean == "faculty":
                if "faculty" in aud or "all" in aud:
                    filtered.append(n)

            # 3. HOD Filtering
            elif role_clean in ["hod", "admin_hod"]:
                if "hods" in aud or "all" in aud:
                    filtered.append(n)

            # 4. Hostel Admin Filtering
            elif role_clean == "hostel_admin":
                if "hostel" in aud or "all" in aud:
                    filtered.append(n)

            # 5. Super Admin Filtering
            elif role_clean == "super_admin":
                filtered.append(n)

        return filtered

EVENTS_FILE = os.path.join(CHROMA_DB_DIR, "campus_events.json")

# Persistent Event Store with Server-Side HOD Scope Filtering
class EventsStore:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.events: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.events = json.load(f)
            except Exception as e:
                print(f"Events load error: {e}")
                self.events = []
        else:
            # Seed default campus landmark events
            self.events = [
                {
                    "id": "evt_001",
                    "title": "Hack 'N' Clash 2026 (24-Hour Hackathon)",
                    "category": "Technical Hackathon",
                    "date": "15-08-2026",
                    "location": "SRKR Central Computer Center",
                    "description": "National level 24-hour inter-college hackathon hosted by CSE & IT departments with over 500+ student teams participating.",
                    "link": "https://srkr.ac.in/hacknclash2026",
                    "status": "Active Registration",
                    "sender_role": "super_admin",
                    "sender_scope": "ALL",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "evt_002",
                    "title": "Korean Kanaka Raju Movie Pre-Release Event",
                    "category": "Cultural & Celebrations",
                    "date": "10-08-2026",
                    "location": "SRKR Open Air Auditorium",
                    "description": "Star-studded grand pre-release promotional event held live on campus featuring movie cast, director interactions, and cultural dance performances.",
                    "link": "https://srkr.ac.in/events/kanakaraju",
                    "status": "Completed Landmark Event",
                    "sender_role": "super_admin",
                    "sender_scope": "ALL",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "evt_003",
                    "title": "Irumudi Movie Trailer Launch Event",
                    "category": "Cultural & Celebrations",
                    "date": "02-08-2026",
                    "location": "SRKR Main Indoor Auditorium",
                    "description": "Official movie trailer launch ceremony with student interactions, celebrity guests, live music concert, and chief guest addresses.",
                    "link": "https://srkr.ac.in/events/irumudi",
                    "status": "Completed Landmark Event",
                    "sender_role": "super_admin",
                    "sender_scope": "ALL",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "evt_004",
                    "title": "SPOURTHI Annual Tech Fest & Cultural Extravaganza",
                    "category": "Annual College Fest",
                    "date": "28-09-2026",
                    "location": "SRKR Main Campus Grounds",
                    "description": "SRKR's flagship annual national tech fest featuring paper presentations, coding contests, robotics wars, and musical night.",
                    "link": "https://srkr.ac.in/spourthi2026",
                    "status": "Active Registration",
                    "sender_role": "super_admin",
                    "sender_scope": "ALL",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "evt_005",
                    "title": "National Robotics & AI Championship",
                    "category": "Technical Fest",
                    "date": "25-09-2026",
                    "location": "Mechanical & ECE Block Complex",
                    "description": "RoboWars, Drone Racing, and AI Autonomous Vehicle showcases. Open registration for all engineering branches.",
                    "link": "https://srkr.ac.in/robotics2026",
                    "status": "Upcoming Event",
                    "sender_role": "super_admin",
                    "sender_scope": "ALL",
                    "created_at": datetime.now().isoformat()
                }
            ]
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.events, f, indent=2)

    def add_event(self, event_data: dict):
        self.events.insert(0, event_data)
        self._save()

    def delete_event(self, event_id: str) -> bool:
        initial_len = len(self.events)
        self.events = [e for e in self.events if e["id"] != event_id]
        changed = len(self.events) < initial_len
        if changed:
            self._save()
        return changed

    def get_user_events(self, role: str, hod_code: Optional[str] = None) -> List[dict]:
        role_clean = role.lower().strip()
        hod_clean = (hod_code or "").upper().strip()
        filtered = []

        for e in self.events:
            sender_role = e.get("sender_role", "").lower().strip()
            sender_scope = (e.get("sender_scope", "")).upper().strip()

            is_general = bool(sender_scope == "ALL" or sender_role == "super_admin" or not sender_scope)

            # 1. Student Filtering:
            # Shows general campus events + events posted by the HOD matching student's entered hod_code
            if role_clean == "student":
                is_from_linked_hod = bool(
                    sender_role == "hod"
                    and sender_scope
                    and hod_clean
                    and sender_scope == hod_clean
                )
                if is_general or is_from_linked_hod:
                    filtered.append(e)

            # 2. Super Admin: sees all events
            elif role_clean == "super_admin":
                filtered.append(e)

            # 3. HOD / Faculty: sees general events + events for their scope
            elif role_clean in ["hod", "faculty", "admin_hod", "admin_faculty"]:
                is_own_scope = bool(
                    sender_scope
                    and hod_clean
                    and sender_scope == hod_clean
                )
                if is_general or is_own_scope or sender_role == role_clean:
                    filtered.append(e)

            # 4. Hostel Admin / others
            else:
                filtered.append(e)

        return filtered

# Persistent Department Documents Store with Sender Name & Designation Metadata
class DocumentsStore:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.documents: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                print(f"Documents load error: {e}")
                self.documents = []
        else:
            # Seed default official department documents
            now_str = datetime.now().strftime("%d-%m-%Y at %I:%M %p")
            self.documents = [
                {
                    "id": "doc_001",
                    "title": "R23 B.Tech CSE Department Curriculum & Regulation Guide",
                    "file_name": "R23_CSE_Curriculum.pdf",
                    "body": "Official R23 Academic Regulation & Curriculum breakdown for Computer Science & Engineering students. Includes detailed CIE/SEE marks allocation, internal exam schedules, laboratory requirements, and attendance guidelines.",
                    "category": "college",
                    "sender_name": "Dr. K. V. Sharma",
                    "sender_designation": "Head of Department (HOD - CSE)",
                    "sender_role": "hod",
                    "sender_scope": "CSE",
                    "created_at": datetime.now().isoformat(),
                    "date_time_str": now_str
                },
                {
                    "id": "doc_002",
                    "title": "SRKR Hostel Code of Conduct & Mess Rules",
                    "file_name": "Hostel_Rules_2026.docx",
                    "body": "Mandatory rules for all resident students staying in SRKR Engineering College Hostels (Blocks A, B & C). Details quiet hours (10 PM to 6 AM), mess timing, visitor policies, and gate pass application procedure.",
                    "category": "hostel",
                    "sender_name": "Warden Rajesh",
                    "sender_designation": "Chief Hostel Administrator",
                    "sender_role": "hostel_admin",
                    "sender_scope": "HOSTEL-BLOCK-A",
                    "created_at": datetime.now().isoformat(),
                    "date_time_str": now_str
                }
            ]
            self._save()

    def _save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2)

    def add_document(self, doc_data: dict):
        self.documents.insert(0, doc_data)
        self._save()

    def delete_document(self, doc_id: str) -> bool:
        initial_len = len(self.documents)
        self.documents = [d for d in self.documents if d.get("id") != doc_id]
        changed = len(self.documents) < initial_len
        if changed:
            self._save()
        return changed

    def get_user_documents(self, role: str, hod_code: Optional[str] = None, is_hostel_resident: bool = False) -> List[dict]:
        role_clean = role.lower().strip()
        dept_clean = (hod_code or "").upper().strip()
        filtered = []

        for d in self.documents:
            sender_role = d.get("sender_role", "").lower().strip()
            sender_scope = (d.get("sender_scope", "")).upper().strip()
            cat = d.get("category", "college").lower().strip()

            if role_clean == "student":
                is_from_dept_hod = bool(
                    sender_role in ["hod", "faculty", "admin_hod", "admin_faculty"]
                    and (
                        not sender_scope
                        or sender_scope == "ALL"
                        or not dept_clean
                        or sender_scope == dept_clean
                        or dept_clean in sender_scope
                        or sender_scope in dept_clean
                    )
                )
                is_super_admin_doc = bool(sender_role == "super_admin" or sender_scope == "ALL")
                is_hostel_doc = bool(is_hostel_resident and (cat == "hostel" or sender_role == "hostel_admin"))

                if is_from_dept_hod or is_super_admin_doc or is_hostel_doc:
                    filtered.append(d)
            elif role_clean == "super_admin":
                filtered.append(d)
            else:
                filtered.append(d)

        return filtered

documents_store = DocumentsStore(DOCUMENTS_FILE)
events_store = EventsStore(EVENTS_FILE)
notif_store = NotificationsStore(NOTIFICATIONS_FILE)

def chunk_text(text: str, title: str, category: str, chunk_size_words: int = 250, overlap_words: int = 40) -> List[Dict[str, Any]]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    idx = 0
    while start < len(words):
        end = min(start + chunk_size_words, len(words))
        chunk_words = words[start:end]
        chunk_content = " ".join(chunk_words)
        chunks.append({
            "id": f"{category}_{title.replace(' ', '_')}_{idx}_{uuid.uuid4().hex[:4]}",
            "text": f"[{title.upper()}] ({category}): {chunk_content}",
            "metadata": {"title": title, "category": category}
        })
        if end >= len(words):
            break
        start += (chunk_size_words - overlap_words)
        idx += 1
    return chunks

def is_document_duplicate(title: str, body: str, file_name: Optional[str] = None) -> bool:
    clean_title = title.lower().strip()
    clean_file = (file_name or "").lower().strip()
    body_hash = hashlib.md5(body.strip().encode("utf-8")).hexdigest()

    # Check collection documents
    for doc in collection.documents:
        meta = doc.get("metadata", {})
        doc_title = (meta.get("title") or "").lower().strip()
        doc_file = (meta.get("file_name") or "").lower().strip()
        doc_hash = meta.get("content_hash")
        
        if doc_hash and doc_hash == body_hash:
            return True
        if clean_file and doc_file and doc_file == clean_file:
            return True
        if clean_title and doc_title and doc_title == clean_title:
            return True

    # Check documents_store
    for doc in documents_store.documents:
        doc_title = (doc.get("title") or "").lower().strip()
        doc_file = (doc.get("file_name") or "").lower().strip()
        doc_hash = doc.get("content_hash")
        
        if doc_hash and doc_hash == body_hash:
            return True
        if clean_file and doc_file and doc_file == clean_file:
            return True
        if clean_title and doc_title and doc_title == clean_title:
            return True

    return False

def add_document_to_rag(
    title: str,
    body: str,
    category: str = "college",
    file_name: Optional[str] = None,
    sender_name: Optional[str] = "Student Upload",
    sender_designation: Optional[str] = "Uploaded Document"
) -> dict:
    if is_document_duplicate(title, body, file_name):
        print(f"Document '{title}' already exists in database. Skipping duplicate insertion.")
        return {
            "status": "already_exists",
            "message": f"Document '{title}' already exists in the campus database.",
            "chunks": 0,
            "title": title
        }

    body_hash = hashlib.md5(body.strip().encode("utf-8")).hexdigest()
    chunks = chunk_text(body, title, category)
    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [{**c["metadata"], "file_name": file_name or title, "content_hash": body_hash} for c in chunks]

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    now_str = datetime.now().strftime("%d-%m-%Y at %I:%M %p")
    doc_entry = {
        "id": f"doc_{uuid.uuid4().hex[:8]}",
        "title": title,
        "file_name": file_name or f"{title}.txt",
        "body": body[:500] + ("..." if len(body) > 500 else ""),
        "category": category,
        "content_hash": body_hash,
        "sender_name": sender_name,
        "sender_designation": sender_designation,
        "sender_role": "user",
        "created_at": datetime.now().isoformat(),
        "date_time_str": now_str
    }
    documents_store.add_document(doc_entry)

    return {
        "status": "success",
        "message": f"Document '{title}' successfully added and indexed into RAG database.",
        "chunks": len(chunks),
        "title": title
    }

def process_uploaded_file(file_name: str, file_bytes: bytes, category: str = "college") -> dict:
    clean_name = file_name.strip()
    text_content = ""

    if clean_name.lower().endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted and len(extracted.strip()) > 10:
                    pages_text.append(extracted.strip())
            text_content = "\n\n".join(pages_text).strip()
        except Exception as pe:
            print(f"Error parsing PDF file {clean_name}: {pe}")
            return {
                "status": "error",
                "message": f"Failed to extract text from PDF '{clean_name}'. The file format may be unreadable or corrupted."
            }

        # Check for scanned PDF (image only without selectable text)
        non_space_chars = re.sub(r'\s+', '', text_content)
        if not text_content or len(non_space_chars) < 25:
            return {
                "status": "error",
                "message": f"Could not extract selectable text from PDF '{clean_name}'. This file appears to be a scanned image or non-searchable document without OCR text. Please upload a PDF with selectable text or a TXT document."
            }
    else:
        try:
            text_content = file_bytes.decode("utf-8", errors="ignore").strip()
        except Exception as te:
            print(f"Error decoding text file {clean_name}: {te}")
            return {
                "status": "error",
                "message": f"Failed to decode text from file '{clean_name}'."
            }

        non_space_chars = re.sub(r'\s+', '', text_content)
        if not text_content or len(non_space_chars) < 10:
            return {
                "status": "error",
                "message": f"File '{clean_name}' is empty or contains no readable text."
            }

    title = os.path.splitext(clean_name)[0].replace("_", " ").replace("-", " ").title()
    return add_document_to_rag(
        title=title,
        body=text_content,
        category=category,
        file_name=clean_name,
        sender_name="User Upload",
        sender_designation="Uploaded Document"
    )

def delete_document_from_rag(identifier: str) -> bool:
    return collection.delete(identifier)

def get_all_documents(category: Optional[str] = None) -> List[Dict[str, Any]]:
    return collection.get_all(category)

def detect_query_category(query: str) -> Optional[str]:
    q = query.lower()
    hostel_keywords = ["hostel", "mess", "curfew", "room", "warden", "guest", "laundry", "gate pass", "maintenance"]
    college_keywords = ["exam", "syllabus", "holiday", "fee", "department", "professor", "class", "semester", "attendance", "course", "subject", "btech", "unit"]

    hostel_score = sum(1 for k in hostel_keywords if k in q)
    college_score = sum(1 for k in college_keywords if k in q)

    if hostel_score > college_score:
        return "hostel"
    elif college_score > hostel_score:
        return "college"
    return None

def is_formal_greeting(query: str) -> bool:
    q = query.lower().strip()
    q_clean = re.sub(r'[^\w\s]', '', q)
    greetings = [
        "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
        "greetings", "how are you", "who are you", "what can you do", "help",
        "namaste", "good day", "how do you do", "hello sir", "hello madam"
    ]
    if q_clean in greetings:
        return True
    words = q_clean.split()
    if len(words) <= 5 and any(g in q_clean for g in ["good morning", "good afternoon", "good evening", "greetings", "hello", "hi", "how can you help"]):
        return True
    return False

def query_rag(query: str, top_k: int = 4) -> Dict[str, Any]:
    try:
        if is_formal_greeting(query):
            context_str = "User query is a formal greeting."
            answer = generate_llm_answer(query, context_str, [], [], is_greeting=True)
            return {
                "answer": answer,
                "sources": []
            }

        category_filter = detect_query_category(query)
        
        where_clause = None
        if category_filter:
            where_clause = {"category": category_filter}

        documents = []
        metadatas = []
        try:
            results = collection.query(
                query_text=query,
                n_results=top_k,
                where=where_clause if where_clause else None
            )
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
        except Exception as ce:
            print(f"ChromaDB query error: {ce}")

        sources = []
        if documents:
            seen_titles = set()
            for meta in metadatas:
                if meta and meta.get("title") and meta.get("title") not in seen_titles:
                    sources.append({
                        "title": meta.get("title", "Notice"),
                        "category": meta.get("category", "general")
                    })
                    seen_titles.add(meta.get("title"))

        context_str = "\n\n".join(documents) if documents else "No relevant campus records found."

        answer = generate_llm_answer(query, context_str, documents, metadatas)

        if not documents:
            sources = []

        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        print(f"query_rag top-level exception: {e}")
        return {
            "answer": "I don't have that information in the provided campus records. Please check the Notifications tab or reach out to the campus administration office.",
            "sources": []
        }

def generate_notice_llm_draft(theme: str, category: str, start_date: str, end_date: str) -> str:
    prompt = (
        f"Generate a formal, professional college/hostel notice for the topic: '{theme}'. "
        f"Category: {category.upper()}. Validity Window: From {start_date} to {end_date}. "
        "IMPORTANT FORMATTING RULE: You MUST format the Notice Theme and the Effective Dates in BOLD markdown (e.g. **THEME: {theme.upper()}** and **DATE / EFFECTIVE WINDOW: {start_date} to {end_date}**) so they stand out prominently as marked highlights. "
        "Keep it clear, concise, and structured with key details, guidelines, and contact instructions for students/faculty."
    )
    if GROQ_API_KEY:
        models_to_try = ["groq/compound-mini", "groq/compound", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        for model_name in models_to_try:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": "You are an official academic administration AI drafting campus circulars and notices for SRKR Engineering College. Always highlight and bold the Notice Theme and Effective Dates."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.4,
                    max_tokens=350
                )
                draft = completion.choices[0].message.content.strip()
                if draft:
                    return clean_llm_text(draft)
            except Exception as e:
                print(f"Notice generation LLM error with {model_name}: {e}")

    return (
        f"OFFICIAL CIRCULAR: **{theme.upper()}**\n"
        f"Category: **{category.capitalize()} Administration**\n"
        f"Effective Window: **{start_date} to {end_date}**\n\n"
        f"This official notice is issued regarding **{theme}**. All concerned students and faculty members are requested to take note of the schedule and guidelines.\n\n"
        f"1. Please ensure strict compliance with campus regulations during this period (**{start_date}** to **{end_date}**).\n"
        f"2. For any queries or assistance, contact the Administration office or Hostel Warden desk.\n\n"
        f"Issued by Order of Campus Administration."
    )

def clean_llm_text(text: str) -> str:
    """Helper to strip reasoning tags like <think> and normalize unicode spaces/hyphens."""
    if not text:
        return ""
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    text = (text.replace('\u202f', ' ')
               .replace('\u00a0', ' ')
               .replace('\u2011', '-')
               .replace('\u2013', '-')
               .replace('\u2014', '-')
               .replace('\u201c', '"')
               .replace('\u201d', '"')
               .replace('\u2018', "'")
               .replace('\u2019', "'"))
    return text

def generate_llm_answer(query: str, context: str, documents: List[str], metadatas: List[dict], is_greeting: bool = False) -> str:
    if is_greeting:
        fallback_greeting = "Hello! Greetings! I am your SRKR Campus AI Assistant (SRKR College GPT). I am here to help you with SRKR Engineering College R23 B.Tech syllabus details, course structures, hostel guidelines, exam schedules, campus notices, and general questions. How may I assist you today?"
        if GROQ_API_KEY:
            try:
                from groq import Groq
                client = Groq(api_key=GROQ_API_KEY)
                models_to_try = ["groq/compound-mini", "groq/compound", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
                system_prompt = (
                    "You are SRKR Campus AI Assistant (SRKR College GPT), an intelligent, helpful, and friendly AI chatbot for SRKR Engineering College. "
                    "Respond warmly, politely, and professionally to greetings. Introduce yourself and explain how you can help with SRKR campus info, hostels, exams, notices, as well as general academic and technical questions."
                )
                for model_name in models_to_try:
                    try:
                        completion = client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": query}
                            ],
                            temperature=0.5,
                            max_tokens=250
                        )
                        answer_text = completion.choices[0].message.content.strip()
                        if answer_text:
                            return clean_llm_text(answer_text)
                    except Exception as e:
                        print(f"Groq API model {model_name} failed on greeting: {e}")
            except Exception as ge:
                print(f"Groq import or init error on greeting: {ge}")
        return fallback_greeting

    if GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            models_to_try = ["groq/compound-mini", "groq/compound", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
            
            system_prompt = (
                "You are SRKR Campus AI Assistant (SRKR College GPT), an intelligent, polite, precise, and articulate AI assistant created for SRKR Engineering College.\n\n"
                "YOUR CORE GOALS & STRICT RULES:\n"
                "1. **Campus & Uploaded Document Queries**: When answering questions about SRKR Engineering College (hostel rules, syllabus, exam schedules, department notices, campus events) or about uploaded files, documents, and guidelines:\n"
                "   - Base your answer STRICTLY on the provided Official Campus Context records below.\n"
                "   - **STRICT ANTI-HALLUCINATION RULE**: If the answer isn't in the provided context, say you don't have that information — NEVER guess or invent details!\n"
                "2. **Handling Scanned, Missing, or Unreadable Documents**: If the context indicates that a PDF or document is unreadable, scanned, empty, or missing requested information, explicitly state that you don't have that information in the provided context and ask the user to provide a searchable text document.\n"
                "3. **General Knowledge & Conversational Questions**: If the user asks general academic or technical questions (e.g. programming syntax, math calculations, science concepts, general study advice, or greetings), answer clearly, accurately, and helpfully using your general AI capabilities.\n"
                "4. **Clear & Structured Formatting**: Format all your answers using clean, structured Markdown (use subheadings ###, bold text **key concepts**, bullet points, numbered lists, or code blocks where appropriate)."
            )
            user_prompt = f"Official SRKR Campus Context & Notices (Use if relevant to campus query):\n{context}\n\nUser Question/Message: {query}"

            for model_name in models_to_try:
                try:
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.3,
                        max_tokens=650
                    )
                    answer_text = completion.choices[0].message.content.strip()
                    if answer_text:
                        cleaned = clean_llm_text(answer_text)
                        if cleaned:
                            return cleaned
                except Exception as e:
                    print(f"Groq API model {model_name} failed: {e}")
        except Exception as ge:
            print(f"Groq import or init error: {ge}")

    # Fallback if API key unavailable, context missing, or model failed
    if documents and context != "No relevant campus records found.":
        primary_doc = documents[0]
        title = metadatas[0].get("title", "Campus Information") if metadatas else "Notice"
        clean_doc = primary_doc.split("]: ", 1)[-1] if "]: " in primary_doc else primary_doc
        return f"### **{title}**\n\n{clean_doc}"

    return (
        f"I don't have that information in the provided campus records for **'{query}'**. "
        "If the answer isn't in the provided context, I am instructed to inform you that I don't have that information rather than guessing. "
        "Please check official college notices or upload a readable text document."
    )



