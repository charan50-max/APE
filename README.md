# 🛡 AI Anti-Phishing Shield

AI Anti-Phishing Shield is a Chrome extension with a FastAPI backend that detects phishing emails in Gmail in real time using a heuristic risk scoring engine.

---

## 📌 Overview

This project scans Gmail emails, extracts the email text, sender, and links, and sends them to a backend analysis engine.  
The backend evaluates multiple phishing signals and returns a risk score (0–100) along with a verdict.  
If the email is suspicious, a warning banner is displayed directly inside Gmail.

---

## 🚀 Key Features

- Real-time Gmail email scanning  
- Sender reputation detection  
- Brand impersonation detection  
- Urgency & scam language detection  
- Suspicious link analysis  
- Risk scoring with visual warning banner  
- Alert history stored in extension popup  

---

## 🏗 System Architecture

---

## 📂 Project Structure

### Backend
- `server.py` – FastAPI risk analysis engine  
- `requirements.txt` – Python dependencies  

### Frontend (Chrome Extension)
- `manifest.json` – Extension configuration  
- `content.js` – Gmail scanner & AI API calls  
- `background.js` – Logging & storage  
- `popup.html / popup.js` – Alert dashboard  
- `styles.css` – UI styling  

---

## 🧠 Detection Algorithm

### Algorithm Name:
**Rule-Based Heuristic Weighted Risk Scoring Model**

This is a deterministic classifier (not ML) that assigns weights to phishing indicators and computes a final risk score.

Formula:

---

## 🔍 Features Analysed by the Engine

- Sender domain (free email vs professional)
- Generic greetings (e.g., “Dear User”)
- Urgency and pressure language
- Unrealistic claims (e.g., 98% placement)
- Price manipulation / fake discounts
- Suspicious or phishing links
- Social engineering patterns

---

## 🎯 Risk Classification

| Score | Verdict |
|-------|---------|
| 0–44  | Likely Safe |
| 45–74 | Suspicious |
| 75–100 | HIGH PHISHING RISK |

---

## ⚙️ How It Works (Flow)

1. User opens an email in Gmail  
2. `content.js` extracts:
   - Email body text  
   - Links  
   - Sender email  
3. Data is sent to `http://127.0.0.1:8000/analyze`  
4. Backend performs feature extraction and scoring  
5. Risk score and verdict are returned  
6. Extension displays a warning banner if risk is high  

---

## 🛠 Installation

### Backend Setup
```bash
pip install -r requirements.txt
uvicorn server:app --reload
http://127.0.0.1:8000
```
Chrome Extension Setup

Open chrome://extensions

Enable Developer Mode

Click Load Unpacked

Select the frontend folder

📊 Technology Stack

Frontend: JavaScript, Chrome Extension (Manifest V3)

Backend: Python, FastAPI

Analysis: Regex + Heuristic Risk Scoring

Storage: Chrome Local Storage

⚠ Limitations

Rule-based (no machine learning)

Can be bypassed by highly sophisticated phishing emails

No live domain reputation or WHOIS checks yet

🔮 Future Improvements

ML classifier (TF-IDF + Logistic Regression)

BERT-based phishing detection

Domain reputation API integration

Email header (SPF/DKIM) analysis

URL similarity detection (typosquatting)
