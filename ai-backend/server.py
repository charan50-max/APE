from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import re
from urllib.parse import urlparse

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# HELPER FUNCTIONS
# ------------------------------

def contains_any(text, keywords):
    return any(k in text for k in keywords)


def suspicious_sender(email):
    """
    Detect brand impersonation and free email domains.
    """
    score = 0

    free_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]

    domain = email.split("@")[-1].lower() if "@" in email else ""

    # Free email used for professional offer
    if domain in free_domains:
        score += 25

    # Fake Microsoft style impersonation
    if "micro" in email and "soft" in email and "microsoft.com" not in email:
        score += 30

    return score


def detect_price_manipulation(text):
    """
    Detect fake discount psychology.
    Example: $4500 -> $499
    """
    prices = re.findall(r"\$?\d{3,5}", text)

    if len(prices) >= 2:
        return 20

    return 0


def detect_unrealistic_claims(text):
    patterns = [
        "98% job",
        "100% placement",
        "guaranteed job",
        "guaranteed placement",
        "no experience required",
        "limited seats",
        "limited time",
        "act now",
        "only today"
    ]

    return 20 if contains_any(text, patterns) else 0


def detect_generic_greeting(text):
    greetings = [
        "dear customer",
        "dear user",
        "dear applicant",
        "dear future",
        "dear student"
    ]

    return 15 if contains_any(text, greetings) else 0


def detect_urgency(text):
    urgency_words = [
        "urgent",
        "immediately",
        "suspension",
        "expire",
        "deadline",
        "final notice"
    ]

    return 15 if contains_any(text, urgency_words) else 0


def suspicious_links(links):
    score = 0

    for link in links:
        parsed = urlparse(link)
        domain = parsed.netloc.lower()

        # Google forms phishing
        if "forms.gle" in domain or "docs.google.com" in domain:
            score += 25

        # IP-based link
        if re.match(r"\d+\.\d+\.\d+\.\d+", domain):
            score += 30

    return score


# ------------------------------
# MAIN ANALYSIS
# ------------------------------

@app.post("/analyze")
def analyze(data: dict):

    text = data.get("text", "").lower()
    links = data.get("links", [])
    sender = data.get("sender", "").lower()

    score = 0

    # 1. Sender Analysis
    score += suspicious_sender(sender)

    # 2. Generic Greeting
    score += detect_generic_greeting(text)

    # 3. Urgency Pressure
    score += detect_urgency(text)

    # 4. Unrealistic Claims
    score += detect_unrealistic_claims(text)

    # 5. Price Manipulation
    score += detect_price_manipulation(text)

    # 6. Suspicious Links
    score += suspicious_links(links)

    # Cap at 100
    score = min(score, 100)

    # Verdict Logic
    if score >= 75:
        verdict = "HIGH PHISHING RISK"
    elif score >= 45:
        verdict = "SUSPICIOUS"
    else:
        verdict = "Likely Safe"

    return {
        "ai_score": score,
        "verdict": verdict
    }