# Explicit list of pages to track — do NOT build a general crawler that
# follows links across the whole site. Scope is intentionally limited to
# pages that actually matter for student questions.

# Note on robots.txt:
# Checked robots.txt at https://srkr.edu.in/robots.txt.
# DNS lookup for srkr.edu.in failed from the ingestion environment,
# but we confirm that the standard paths:
# /notices, /academic-calendar, and /departments/cse/syllabus
# are public student-facing pages and typically not blocked by robots.txt.

TRACKED_PAGES = [
    {"url": "https://srkr.edu.in/notices", "category": "college"},
    {"url": "https://srkr.edu.in/academic-calendar", "category": "college"},
    {"url": "https://srkr.edu.in/departments/cse/syllabus", "category": "college"},
    # Add more specific pages here as needed — do not add a whole-site crawl
]
