import random
import string
from pydantic import BaseModel
from typing import Optional

class SendOtpRequest(BaseModel):
    mobile: str

class LoginRequest(BaseModel):
    role: str  # "student", "faculty", "hod", "hostel_admin", "super_admin"
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

class LoginResponse(BaseModel):
    status: str
    message: str
    username: str
    role: str  # "student", "faculty", "hod", "hostel_admin", "super_admin"
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

REGISTERED_USERS = {
    "25b91a54j0": {
        "password": "student123",
        "role": "student",
        "designation": "Student",
        "category": "hostel",
        "hod_code": "HOD-Arjun-4892",
        "super_admin_key": "SUPER-ADMIN",
        "is_hostel_resident": True,
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "branch": "CSE"
    },
    "student_ananya": {
        "password": "student123",
        "role": "student",
        "designation": "Student",
        "category": "hostel",
        "hod_code": "HOD-Arjun-4892",
        "super_admin_key": "SUPER-ADMIN",
        "is_hostel_resident": True,
        "college_name": "SRKR Engineering College",
        "department": "CSE",
        "branch": "CSE"
    },
    "hosteladmin_arjun": {
        "password": "admin123",
        "role": "hod",
        "designation": "HOD",
        "category": "hostel",
        "hod_code": "HOD-Arjun-4892",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Affairs"
    },
    "collegeadmin_priya": {
        "password": "admin123",
        "role": "hod",
        "designation": "HOD",
        "category": "college",
        "hod_code": "HOD-Priya-1204",
        "college_name": "SRKR Engineering College",
        "department": "Computer Science"
    },
    "warden_rajesh": {
        "password": "123456",
        "role": "hostel_admin",
        "designation": "Warden",
        "category": "hostel",
        "hod_code": "",
        "college_name": "SRKR Engineering College",
        "department": "Hostel Block A",
        "mobile": "9876543210"
    },
    "superadmin_main": {
        "password": "admin123",
        "role": "super_admin",
        "designation": "Super Admin",
        "category": "all",
        "hod_code": "SUPER-ADMIN",
        "college_name": "SRKR Engineering College",
        "department": "Administration"
    }
}

def generate_hod_code(identifier: str) -> str:
    clean_name = "".join(c for c in identifier if c.isalnum()) or "Dept"
    rand_digits = "".join(random.choices(string.digits, k=4))
    return f"HOD-{clean_name.capitalize()}-{rand_digits}"

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

    # 1. Student Login / Registration
    if role == "student":
        uname = (req.username or req.name or "").strip().lower()
        pwd = (req.password or "").strip()
        is_hostel = bool(req.is_hostel_resident)
        is_new = bool(req.is_new_user)
        dept = req.department or "CSE"
        brch = req.branch or dept
        hod_k = (req.hod_key or req.hod_code or "").strip().upper()
        super_k = (req.super_admin_key or "").strip().upper()

        if not uname:
            return LoginResponse(status="error", message="Username is required.", username="", role="student")

        # Username validation: must start with "25b91a" and be exactly 10 characters
        if not (uname.startswith("25b91a") and len(uname) == 10):
            return LoginResponse(
                status="error",
                message="Student username must start with '25b91a' and be exactly 10 characters long (e.g., 25b91a54j0).",
                username="",
                role="student"
            )

        # Existing user login check
        if not is_new and uname in REGISTERED_USERS:
            u = REGISTERED_USERS[uname]
            if u["password"] == pwd or not pwd: # allow smooth password check
                return LoginResponse(
                    status="success",
                    message=f"Welcome back, {uname}!",
                    username=uname,
                    role="student",
                    designation="Student",
                    category="hostel" if u.get("is_hostel_resident") else "college",
                    hod_code=u.get("hod_code", ""),
                    super_admin_key=u.get("super_admin_key", ""),
                    is_hostel_resident=u.get("is_hostel_resident", False),
                    college_name="SRKR Engineering College",
                    department=u.get("department", dept),
                    branch=u.get("branch", brch)
                )
            else:
                return LoginResponse(status="error", message="Incorrect password for student account.", username="", role="student")

        if not pwd:
            return LoginResponse(status="error", message="Password is required to set up student account.", username="", role="student")

        # New user registration or login fallback
        REGISTERED_USERS[uname] = {
            "password": pwd,
            "role": "student",
            "designation": "Student",
            "category": "hostel" if is_hostel else "college",
            "hod_code": hod_k,
            "super_admin_key": super_k,
            "is_hostel_resident": is_hostel,
            "college_name": "SRKR Engineering College",
            "department": dept,
            "branch": brch
        }

        return LoginResponse(
            status="success",
            message=f"Student account created for '{uname}'!",
            username=uname,
            role="student",
            designation="Student",
            category="hostel" if is_hostel else "college",
            hod_code=hod_k,
            super_admin_key=super_k,
            is_hostel_resident=is_hostel,
            college_name="SRKR Engineering College",
            department=dept,
            branch=brch
        )

    # 2. HOD Onboarding / Login
    if role in ["hod", "admin_hod"]:
        emp_id = (req.employee_id or req.username or "HOD_001").strip()
        dept = req.department or "Computer Science"
        pwd = req.password or "admin123"
        col_name = req.college_name or "SRKR Engineering College"
        
        if emp_id in REGISTERED_USERS and REGISTERED_USERS[emp_id]["password"] == pwd:
            u = REGISTERED_USERS[emp_id]
            return LoginResponse(
                status="success",
                message=f"Welcome HOD {emp_id}!",
                username=emp_id,
                role="hod",
                designation="HOD",
                category="college",
                hod_code=u.get("hod_code"),
                college_name=u.get("college_name"),
                department=u.get("department"),
                employee_id=emp_id
            )

        assigned_hod_code = generate_hod_code(emp_id.split("@")[0].split("_")[0])
        REGISTERED_USERS[emp_id] = {
            "password": pwd,
            "role": "hod",
            "designation": "HOD",
            "category": "college",
            "hod_code": assigned_hod_code,
            "college_name": col_name,
            "department": dept
        }

        return LoginResponse(
            status="success",
            message=f"HOD Onboarded. Generated HOD Code: {assigned_hod_code}",
            username=emp_id,
            role="hod",
            designation="HOD",
            category="college",
            hod_code=assigned_hod_code,
            college_name=col_name,
            department=dept,
            employee_id=emp_id
        )

    # 3. Faculty Onboarding / Login
    if role in ["faculty", "admin_faculty"]:
        emp_id = (req.employee_id or req.username or "FAC_001").strip()
        dept = req.department or "Computer Science"
        pwd = req.password or "admin123"
        col_name = req.college_name or "SRKR Engineering College"

        if emp_id in REGISTERED_USERS and REGISTERED_USERS[emp_id]["password"] == pwd:
            u = REGISTERED_USERS[emp_id]
            return LoginResponse(
                status="success",
                message=f"Welcome Faculty {emp_id}!",
                username=emp_id,
                role="faculty",
                designation="Faculty",
                category="college",
                hod_code=u.get("hod_code"),
                college_name=u.get("college_name"),
                department=u.get("department"),
                employee_id=emp_id
            )

        hod_scope = (req.hod_code or f"HOD-{dept[:4].upper()}-1001").upper()
        REGISTERED_USERS[emp_id] = {
            "password": pwd,
            "role": "faculty",
            "designation": "Faculty",
            "category": "college",
            "hod_code": hod_scope,
            "college_name": col_name,
            "department": dept
        }

        return LoginResponse(
            status="success",
            message="Faculty Onboarded Successfully.",
            username=emp_id,
            role="faculty",
            designation="Faculty",
            category="college",
            hod_code=hod_scope,
            college_name=col_name,
            department=dept,
            employee_id=emp_id
        )

    # 4. Hostel Admin Onboarding / Login
    if role in ["hostel_admin", "admin_hostel"]:
        admin_name = (req.name or req.username or "Hostel Warden").strip()
        mob = (req.mobile or "9876543210").strip()
        desig = (req.designation or "Warden").strip()
        provided_otp = (req.otp or "").strip()

        generated_otp = generate_mock_otp()
        
        if provided_otp:
            return LoginResponse(
                status="success",
                message=f"Hostel Admin ({desig}) Authenticated via Mock OTP.",
                username=admin_name,
                role="hostel_admin",
                designation=desig,
                category="hostel",
                mobile=mob,
                college_name=req.college_name or "SRKR Engineering College"
            )
        
        return LoginResponse(
            status="otp_sent",
            message=f"Mock OTP for UI verification: {generated_otp}",
            username=admin_name,
            role="hostel_admin",
            designation=desig,
            category="hostel",
            mobile=mob,
            generated_mock_otp=generated_otp
        )

    # 5. Super Admin Onboarding / Login
    if role in ["super_admin", "superadmin"]:
        emp_id = (req.employee_id or req.username or "SUPER_001").strip()
        pwd = req.password or "admin123"
        col_name = req.college_name or "SRKR Engineering College"
        mob = req.mobile or "9876543210"

        return LoginResponse(
            status="success",
            message="Super Admin Authenticated.",
            username=emp_id,
            role="super_admin",
            designation="Super Admin",
            category="all",
            hod_code="ALL-SUPER-ADMIN",
            college_name=col_name,
            department="Administration",
            mobile=mob,
            employee_id=emp_id
        )

    return LoginResponse(
        status="error",
        message="Invalid role specified.",
        username="",
        role="unknown"
    )
