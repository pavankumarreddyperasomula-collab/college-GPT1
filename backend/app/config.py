import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
DEFAULT_OTP = "123456"

ADMIN_ACCOUNTS = {
    "collegeadmin_priya": {"password": "admin123", "role": "admin", "category": "college", "name": "Priya (College Admin)"},
    "hosteladmin_arjun": {"password": "admin123", "role": "admin", "category": "hostel", "name": "Arjun (Hostel Admin)"}
}
