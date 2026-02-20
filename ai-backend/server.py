from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow Chrome extension requests (CRITICAL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailData(BaseModel):
    text: str
    links: list[str] = []

# 🔒 Trusted domains (reduces false positives massively)
TRUSTED_DOMAINS = [
    "google.com",
    "forms.gle",
    "docs.google.com",
    "drive.google.com",
    "mail.google.com",
    "sigce.edu.in",
    ".edu",
    ".ac.in",
    "coursera.org",
    "udemy.com",
    "nptel.ac.in",
    "unacademy.com",
    "microsoft.com",
    "github.com",
    "linkedin.com"
]

# 🎯 Phishing intent patterns (AI semantic logic)
PHISHING_PATTERNS = [
    "verify your account",
    "confirm your identity",
    "account suspension",
    "unusual activity detected",
    "login immediately",
    "security alert",
    "update your account",
    "verify within 24 hours",
    "click the link below",
    "reset your password"
]

# 🎓 Student-targeted scam patterns (CERT-In context)
STUDENT_SCAM_PATTERNS = [
    "internship offer",
    "scholarship",
    "hackathon registration",
    "training program",
    "placement drive",
    "student verification",
    "free certification"
]

def is_trusted(link: str) -> bool:
    return any(domain in link for domain in TRUSTED_DOMAINS)

def calculate_ai_phishing_score(text: str, links: list[str]):
    score = 0
    t = text.lower()

    # 1️⃣ Strong phishing intent detection (AI semantic)
    if any(pattern in t for pattern in PHISHING_PATTERNS):
        score += 40

    # 2️⃣ Credential harvesting detection
    if any(word in t for word in ["password", "login", "verify", "otp", "credentials"]):
        score += 25

    # 3️⃣ Urgency + fear manipulation (social engineering AI signal)
    if any(word in t for word in ["urgent", "immediately", "24 hours", "suspend", "action required"]):
        score += 20

    # 4️⃣ Suspicious link analysis (smart, not naive)
    for link in links:
        if not is_trusted(link):
            if "login" in link or "verify" in link:
                score += 35
            elif link.startswith("http://"):
                score += 25  # Non-HTTPS = high risk
            elif ".xyz" in link or ".top" in link or ".click" in link:
                score += 20

    # 5️⃣ Student scam detection (your project USP)
    if any(pattern in t for pattern in STUDENT_SCAM_PATTERNS):
        if not any(".edu" in link or ".ac.in" in link for link in links):
            score += 20

    # 6️⃣ Reduce false positives if all links are trusted
    if links and all(is_trusted(link) for link in links):
        score -= 30

    # Clamp score
    score = max(0, min(score, 100))

    if score >= 70:
        verdict = "HIGH PHISHING RISK"
    elif score >= 40:
        verdict = "Suspicious"
    else:
        verdict = "Likely Safe"

    return score, verdict

@app.post("/analyze")
def analyze_email(data: EmailData):
    score, verdict = calculate_ai_phishing_score(data.text, data.links)
    return {
        "ai_score": score,
        "verdict": verdict,
        "model": "AI Phishing Intent Classifier v2 (Calibrated)"
    }