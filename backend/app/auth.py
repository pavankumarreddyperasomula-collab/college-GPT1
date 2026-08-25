import os
import json
import re
import random
import string
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.config import CHROMA_DB_DIR

USERS_FILE = os.path.join(CHROMA_DB_DIR, "campus_users.json")
HOSTEL_STUDENTS_FILE = os.path.join(CHROMA_DB_DIR, "campus_hostel_students.json")

class SendOtpRequest(BaseModel):
    mobile: str

class LoginRequest(BaseModel):
    role: str  # "student", "faculty", "hod", "hostel_admin", "super_admin", "hostel_super_admin", "college_super_admin"
    username: Optional[str] = None
    password: Optional[str] = None
    mobile: Optional[str] = None
    otp: Optional[str] = None
    # Student specific
    is_new_user: Optional[bool] = False
    is_hostel_resident: Optional[bool] = False
    department: Optional[str] = None
    branch: Optional[str] = None
    hod_key: Optional[str] = None
    super_admin_key: Optional[str] = None
    # Admin Onboarding details
    name: Optional[str] = None
    hod_code: Optional[str] = None
    employee_id: Optional[str] = None
    college_name: Optional[str] = None
    designation: Optional[str] = None
    super_admin_type: Optional[str] = None # "college" or "hostel"

class LoginResponse(BaseModel):
    status: str
    message: str
    username: str
    role: str
    designation: Optional[str] = None
    category: Optional[str] = None
    hod_code: Optional[str] = None
    super_admin_key: Optional[str] = None
    is_hostel_resident: Optional[bool] = False
    college_name: Optional[str] = None
    department: Optional[str] = None
    branch: Optional[str] = None
    mobile: Optional[str] = None
    employee_id: Optional[str] = None
    generated_mock_otp: Optional[str] = None
    super_admin_type: Optional[str] = None

class ChangeCredentialsRequest(BaseModel):
    current_username: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class CreateHostelAdminRequest(BaseModel):
    created_by: str
    username: str
    password: str
    designation: Optional[str] = "Hostel Admin / Warden"
    mobile: Optional[str] = "9876543210"

class CreateStaffAccountRequest(BaseModel):
    created_by: str
    role: str  # "hod", "faculty", "hostel_admin"
    username: str
    password: str
    department: Optional[str] = "CSE"
    designation: Optional[str] = None
    employee_id: Optional[str] = None
    mobile: Optional[str] = "9876543210"
    hod_code: Optional[str] = None

class UploadHostelStudentsRequest(BaseModel):
    uploaded_by: str
    file_name: Optional[str] = "hostel_students_list.txt"
    raw_content: str

DEFAULT_REGISTERED_USERS = {
    "25b91a54j0": {
        "username": "25b91a54j0",
        "password": "student123",
        "role": "student",
        "designation": "Student",
        "category": "hostel",
        "hod_code": "HOD-CSE-4892",
        "super_admin_key": "SUPER-ADMIN",
        "is_hostel_resident": True,
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "branch": "CSE"
    },
    "student_ananya": {
        "username": "student_ananya",
        "password": "student123",
        "role": "student",
        "designation": "Student",
        "category": "hostel",
        "hod_code": "HOD-CSE-4892",
        "super_admin_key": "SUPER-ADMIN",
        "is_hostel_resident": True,
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "branch": "CSE"
    },
    "hod_cse": {
        "username": "hod_cse",
        "password": "admin123",
        "role": "hod",
        "designation": "HOD - CSE",
        "category": "college",
        "hod_code": "HOD-CSE-4892",
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "employee_id": "EMP_HOD_CSE"
    },
    "fac_cse": {
        "username": "fac_cse",
        "password": "admin123",
        "role": "faculty",
        "designation": "Faculty - CSE",
        "category": "college",
        "hod_code": "HOD-CSE-4892",
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "employee_id": "EMP_FAC_CSE"
    },
    "hosteladmin_arjun": {
        "username": "hosteladmin_arjun",
        "password": "admin123",
        "role": "hod",
        "designation": "HOD Hostel Affairs",
        "category": "hostel",
        "hod_code": "HOD-HOSTEL-4892",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Affairs"
    },
    "warden_rajesh": {
        "username": "warden_rajesh",
        "password": "123456",
        "role": "hostel_admin",
        "designation": "Warden Block A",
        "category": "hostel",
        "hod_code": "HOSTEL-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Affairs",
        "mobile": "9876543210"
    },
    "superadmin_main": {
        "username": "superadmin_main",
        "password": "admin123",
        "role": "super_admin",
        "super_admin_type": "college",
        "designation": "College Super Admin",
        "category": "all",
        "hod_code": "SUPER-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "College Administration"
    },
    "hostel admin 1": {
        "username": "hostel admin 1",
        "password": "123456",
        "role": "super_admin",
        "super_admin_type": "hostel",
        "designation": "Hostel Super Admin 1",
        "category": "hostel",
        "hod_code": "HOSTEL-SUPER-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Administration"
    },
    "hostel admin 2": {
        "username": "hostel admin 2",
        "password": "12345",
        "role": "super_admin",
        "super_admin_type": "hostel",
        "designation": "Hostel Super Admin 2",
        "category": "hostel",
        "hod_code": "HOSTEL-SUPER-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Administration"
    }
}

DEFAULT_HOSTEL_STUDENTS = [
    "25b91a54j0",
    "student_ananya"
]

def load_users() -> Dict[str, dict]:
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data and isinstance(data, dict):
                    return data
        except Exception as e:
            print(f"Error loading users store: {e}")
    save_users(DEFAULT_REGISTERED_USERS)
    return DEFAULT_REGISTERED_USERS

def save_users(users: Dict[str, dict]):
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

def load_hostel_students() -> List[str]:
    if os.path.exists(HOSTEL_STUDENTS_FILE):
        try:
            with open(HOSTEL_STUDENTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"Error loading hostel students store: {e}")
    save_hostel_students(DEFAULT_HOSTEL_STUDENTS)
    return DEFAULT_HOSTEL_STUDENTS

def save_hostel_students(students: List[str]):
    os.makedirs(os.path.dirname(HOSTEL_STUDENTS_FILE), exist_ok=True)
    with open(HOSTEL_STUDENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(students, f, indent=2)

def normalize_key(u: str) -> str:
    if not u:
        return ""
    return u.strip().lower().replace("  ", " ")

def find_user(username: str) -> Optional[dict]:
    users = load_users()
    clean_target = normalize_key(username)
    clean_target_no_spaces = clean_target.replace(" ", "")

    for key, val in users.items():
        ckey = normalize_key(key)
        ckey_no_spaces = ckey.replace(" ", "")
        if ckey == clean_target or ckey_no_spaces == clean_target_no_spaces:
            return val
    return None

def is_student_hostel_resident(username_or_reg: str) -> bool:
    students = load_hostel_students()
    clean_target = username_or_reg.strip().lower().replace(" ", "")
    if not clean_target:
        return False
    for item in students:
        clean_item = item.strip().lower().replace(" ", "")
        if clean_target == clean_item or clean_target in clean_item or clean_item in clean_target:
            return True
    return False

def generate_hod_code(identifier: str) -> str:
    clean_name = "".join(c for c in identifier if c.isalnum()) or "Dept"
    rand_digits = "".join(random.choices(string.digits, k=4))
    return f"HOD-{clean_name.upper()}-{rand_digits}"

def generate_mock_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def process_send_otp(mobile: str) -> dict:
    clean_mobile = mobile.strip()
    if len(clean_mobile) < 10:
        return {"status": "error", "message": "Please enter a valid 10-digit mobile number."}
    
    mock_code = generate_mock_otp()
    return {
        "status": "success",
        "message": f"Mock OTP generated for UI simulation: {mock_code}",
        "mock_otp": mock_code
    }

def authenticate_user(req: LoginRequest) -> LoginResponse:
    role = req.role.lower().strip()
    users = load_users()

    # 1. Student Login / Registration
    if role == "student":
        uname = (req.username or req.name or "").strip().lower()
        pwd = (req.password or "").strip()
        dept = (req.department or "CSE").upper().strip()
        brch = (req.branch or dept).upper().strip()

        if not uname:
            return LoginResponse(status="error", message="Username / Registration Number is required.", username="", role="student")

        is_hostel = is_student_hostel_resident(uname) or bool(req.is_hostel_resident)

        existing_user = find_user(uname)
        if existing_user:
            if existing_user.get("password") == pwd or not pwd:
                student_dept = (existing_user.get("department") or dept).upper().strip()
                return LoginResponse(
                    status="success",
                    message=f"Welcome back, {uname}!",
                    username=uname,
                    role="student",
                    designation="Student",
                    category="hostel" if is_hostel else "college",
                    hod_code=student_dept,
                    super_admin_key="SUPER-ADMIN",
                    is_hostel_resident=is_hostel,
                    college_name="SRKR Engineering College",
                    department=student_dept,
                    branch=existing_user.get("branch", brch)
                )
            else:
                return LoginResponse(status="error", message="Incorrect password for student account.", username="", role="student")

        if not pwd:
            return LoginResponse(status="error", message="Password is required to set up student account.", username="", role="student")

        new_student = {
            "username": uname,
            "password": pwd,
            "role": "student",
            "designation": "Student",
            "category": "hostel" if is_hostel else "college",
            "hod_code": dept,
            "super_admin_key": "SUPER-ADMIN",
            "is_hostel_resident": is_hostel,
            "college_name": "SRKR Engineering College",
            "department": dept,
            "branch": brch
        }
        users[uname] = new_student
        save_users(users)

        return LoginResponse(
            status="success",
            message=f"Student account created for '{uname}'! Identified as {'Hostel Resident' if is_hostel else 'Day Scholar'}.",
            username=uname,
            role="student",
            designation="Student",
            category="hostel" if is_hostel else "college",
            hod_code=dept,
            super_admin_key="SUPER-ADMIN",
            is_hostel_resident=is_hostel,
            college_name="SRKR Engineering College",
            department=dept,
            branch=brch
        )

    # 2. Staff Account Login (HOD, Faculty, Hostel Admin) - Strict Invite-Only Provisioned Access
    if role in ["hod", "faculty", "hostel_admin", "admin_hod", "admin_faculty", "admin_hostel", "admin", "staff"]:
        emp_id = (req.employee_id or req.username or req.name or "").strip()
        pwd = (req.password or "").strip()

        if not emp_id or not pwd:
            return LoginResponse(status="error", message="Username/Employee ID and Password are required for staff login.", username="", role=role)

        existing_user = find_user(emp_id)
        if existing_user and existing_user.get("role") in ["hod", "faculty", "hostel_admin", "admin_hod", "admin_faculty", "admin_hostel", "super_admin"]:
            if existing_user.get("password") == pwd:
                user_role = existing_user.get("role")
                user_dept = existing_user.get("department", "CSE")
                return LoginResponse(
                    status="success",
                    message=f"Welcome {existing_user.get('designation', 'Staff Member')} '{existing_user.get('username')}'!",
                    username=existing_user.get("username"),
                    role=user_role,
                    designation=existing_user.get("designation", "Staff Member"),
                    category=existing_user.get("category", "college"),
                    hod_code=existing_user.get("hod_code"),
                    college_name=existing_user.get("college_name", "SRKR Engineering College"),
                    department=user_dept,
                    mobile=existing_user.get("mobile", "9876543210"),
                    employee_id=existing_user.get("employee_id", emp_id),
                    super_admin_type=existing_user.get("super_admin_type")
                )
            else:
                return LoginResponse(status="error", message="Incorrect password for staff account.", username="", role=role)

        return LoginResponse(
            status="error",
            message="Account not provisioned. Staff accounts are invite-only and created by Super Admin. Please contact Super Admin to get your account created.",
            username="",
            role=role
        )

    # 5. Super Admin (College Super Admin or Hostel Super Admin)
    if role in ["super_admin", "superadmin", "hostel_super_admin", "college_super_admin"]:
        uname = (req.username or req.employee_id or "superadmin_main").strip()
        pwd = (req.password or "admin123").strip()
        super_type = (req.super_admin_type or "college").lower().strip()

        existing_user = find_user(uname)
        if existing_user:
            if existing_user.get("password") == pwd:
                stype = existing_user.get("super_admin_type", super_type)
                return LoginResponse(
                    status="success",
                    message=f"Welcome {'Hostel' if stype == 'hostel' else 'College'} Super Admin!",
                    username=existing_user.get("username"),
                    role="super_admin",
                    designation=existing_user.get("designation", "Super Admin"),
                    category="hostel" if stype == "hostel" else "all",
                    hod_code="HOSTEL-SUPER-ADMIN" if stype == "hostel" else "ALL-SUPER-ADMIN",
                    college_name="SRKR Engineering College",
                    department="Hostel Administration" if stype == "hostel" else "College Administration",
                    super_admin_type=stype
                )
            else:
                return LoginResponse(status="error", message="Incorrect password for Super Admin.", username="", role="super_admin")

        if normalize_key(uname) in ["hostel admin 1", "hosteladmin1"] and pwd == "123456":
            return LoginResponse(
                status="success",
                message="Welcome Hostel Super Admin 1!",
                username="hostel admin 1",
                role="super_admin",
                designation="Hostel Super Admin 1",
                category="hostel",
                hod_code="HOSTEL-SUPER-ADMIN",
                college_name="SRKR Engineering College",
                department="Hostel Administration",
                super_admin_type="hostel"
            )
        elif normalize_key(uname) in ["hostel admin 2", "hosteladmin2"] and pwd == "12345":
            return LoginResponse(
                status="success",
                message="Welcome Hostel Super Admin 2!",
                username="hostel admin 2",
                role="super_admin",
                designation="Hostel Super Admin 2",
                category="hostel",
                hod_code="HOSTEL-SUPER-ADMIN",
                college_name="SRKR Engineering College",
                department="Hostel Administration",
                super_admin_type="hostel"
            )

        return LoginResponse(status="error", message="Super Admin credentials invalid.", username="", role="super_admin")

    return LoginResponse(
        status="error",
        message="Invalid role specified.",
        username="",
        role="unknown"
    )

def change_credentials(req: ChangeCredentialsRequest) -> dict:
    users = load_users()
    cur_uname = req.current_username.strip()
    new_uname = (req.new_username or "").strip()
    new_pwd = (req.new_password or "").strip()

    if not cur_uname:
        return {"status": "error", "message": "Current username is required."}

    user_obj = find_user(cur_uname)
    if not user_obj:
        return {"status": "error", "message": f"User '{cur_uname}' not found."}

    old_key = user_obj["username"]
    
    if new_uname and new_uname != old_key:
        if find_user(new_uname) and normalize_key(new_uname) != normalize_key(old_key):
            return {"status": "error", "message": f"Username '{new_uname}' is already taken."}
        if old_key in users:
            del users[old_key]
        user_obj["username"] = new_uname
        key_to_save = new_uname
    else:
        key_to_save = old_key

    if new_pwd:
        user_obj["password"] = new_pwd

    users[key_to_save] = user_obj
    save_users(users)

    return {
        "status": "success",
        "message": "Credentials updated successfully!",
        "user": user_obj
    }

def create_hostel_admin(req: CreateHostelAdminRequest) -> dict:
    users = load_users()
    uname = req.username.strip()
    pwd = req.password.strip()

    if not uname or not pwd:
        return {"status": "error", "message": "Username and Password are required to create a Hostel Admin."}

    if find_user(uname):
        return {"status": "error", "message": f"Hostel Admin username '{uname}' already exists."}

    new_admin = {
        "username": uname,
        "password": pwd,
        "role": "hostel_admin",
        "designation": req.designation or "Hostel Warden",
        "category": "hostel",
        "hod_code": "HOSTEL-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Block",
        "mobile": req.mobile or "9876543210"
    }

    users[uname] = new_admin
    save_users(users)

    return {
        "status": "success",
        "message": f"Hostel Admin '{uname}' created successfully!",
        "user": new_admin
    }

def create_staff_account(req: CreateStaffAccountRequest) -> dict:
    users = load_users()
    uname = req.username.strip()
    pwd = req.password.strip()
    target_role = req.role.lower().strip()
    dept = (req.department or "CSE").upper().strip()

    if not uname or not pwd:
        return {"status": "error", "message": "Username and Password are required to provision a staff account."}

    if target_role not in ["hod", "faculty", "hostel_admin"]:
        return {"status": "error", "message": "Invalid staff role specified. Must be 'hod', 'faculty', or 'hostel_admin'."}

    if find_user(uname):
        return {"status": "error", "message": f"Staff username '{uname}' already exists in system."}

    assigned_hod_code = req.hod_code
    if target_role == "hod" and not assigned_hod_code:
        assigned_hod_code = generate_hod_code(dept)
    elif not assigned_hod_code:
        assigned_hod_code = f"HOD-{dept}-4892"

    desig = req.designation or (
        f"Head of Department (HOD - {dept})" if target_role == "hod"
        else f"Faculty Member ({dept})" if target_role == "faculty"
        else "Hostel Warden"
    )

    new_staff = {
        "username": uname,
        "password": pwd,
        "role": target_role,
        "designation": desig,
        "category": "hostel" if target_role == "hostel_admin" else "college",
        "hod_code": assigned_hod_code,
        "college_name": "SRKR Engineering College",
        "department": dept,
        "employee_id": req.employee_id or f"EMP_{uname.upper()}",
        "mobile": req.mobile or "9876543210"
    }

    users[uname] = new_staff
    save_users(users)

    return {
        "status": "success",
        "message": f"Staff account ({target_role.upper()}) provisioned for '{uname}' with HOD Code '{assigned_hod_code}'!",
        "user": new_staff
    }

def upload_hostel_students_data(req: UploadHostelStudentsRequest) -> dict:
    current_list = load_hostel_students()
    content = req.raw_content.strip()

    if not content:
        return {"status": "error", "message": "Uploaded content cannot be empty."}

    found_ids = set()
    lines = content.replace(",", "\n").replace(";", "\n").split("\n")
    for line in lines:
        clean = line.strip().lower()
        if clean:
            matches = re.findall(r'[a-z0-9]{8,12}', clean)
            if matches:
                for m in matches:
                    found_ids.add(m)
            else:
                found_ids.add(clean)

    added_count = 0
    for fid in found_ids:
        if fid not in current_list:
            current_list.append(fid)
            added_count += 1

    save_hostel_students(current_list)

    return {
        "status": "success",
        "message": f"Successfully parsed and indexed {len(found_ids)} student ID(s). {added_count} new student(s) added to Hostel Resident Roster.",
        "total_hostel_students": len(current_list),
        "added_count": added_count
    }

def get_hostel_students() -> dict:
    students = load_hostel_students()
    return {
        "status": "success",
        "count": len(students),
        "students": students
    }

def delete_hostel_student(reg_no: str) -> dict:
    students = load_hostel_students()
    clean = reg_no.strip().lower()
    initial_len = len(students)
    students = [s for s in students if s.strip().lower() != clean]
    if len(students) < initial_len:
        save_hostel_students(students)
        return {"status": "success", "message": f"Student '{reg_no}' removed from hostel resident roster."}
    return {"status": "error", "message": f"Student '{reg_no}' not found in roster."}
