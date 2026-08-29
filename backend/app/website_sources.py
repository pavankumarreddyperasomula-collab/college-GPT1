# Explicit list of pages to track — do NOT build a general crawler that
# follows links across the whole site. Scope is intentionally limited to
# pages that actually matter for student questions.

# Note on robots.txt:
# Checked robots.txt at https://www.srkrec.ac.in/robots.txt.
# We confirm that standard paths:
# / college-profile, calender, hostels, code-of-conduct, fee, and cse department
# are public student-facing pages and accessible for crawling.

TRACKED_PAGES = [
    {"url": "https://www.srkrec.ac.in/", "category": "college"},
    {"url": "https://www.srkrec.ac.in/college-profile/", "category": "college"},
    {"url": "https://www.srkrec.ac.in/calender/", "category": "college"},
    {"url": "https://www.srkrec.ac.in/hostels/", "category": "hostels"},
    {"url": "https://www.srkrec.ac.in/code-of-conduct/", "category": "college"},
    {"url": "https://www.srkrec.ac.in/departments/cse/", "category": "college"},
    {"url": "https://www.srkrec.ac.in/fee/", "category": "college"},
]
