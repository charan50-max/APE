console.log("🛡 AI Phishing Shield v6 Loaded (Stable + Auto Banner Cleanup)");

let lastSignature = "";
let lastUrl = location.href;
let isScanning = false;
let scanCooldown = 4000; // prevent spam AI calls
let lastScanTime = 0;

/* ===============================
   BANNER CONTROL (FIXES STUCK RED POPUP)
================================= */
function removeBanner() {
    const old = document.getElementById("ai-warning-banner");
    if (old) {
        old.remove();
        console.log("🧹 Banner removed (navigation/content change)");
    }
}

function showBanner(score, verdict) {
    removeBanner(); // always clear old banner first

    // Only show for real risk
    if (score < 50) return;

    const banner = document.createElement("div");
    banner.id = "ai-warning-banner";
    banner.innerText = `⚠️ ${verdict} (Score: ${score}/100)`;

    banner.style.position = "fixed";
    banner.style.top = "20px";
    banner.style.right = "20px";
    banner.style.background = score >= 75 ? "#b00020" : "#d93025";
    banner.style.color = "white";
    banner.style.padding = "14px 18px";
    banner.style.borderRadius = "10px";
    banner.style.fontWeight = "bold";
    banner.style.fontSize = "14px";
    banner.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    banner.style.zIndex = "999999";

    document.body.appendChild(banner);

    console.log("🚨 Banner displayed:", score, verdict);
}

/* ===============================
   GMAIL EMAIL EXTRACTION
================================= */
function getEmailText() {
    const containers = document.querySelectorAll(".a3s, .ii.gt, div[dir='ltr']");
    let fullText = "";

    containers.forEach(el => {
        if (el.innerText && el.innerText.length > 40) {
            fullText += el.innerText + " ";
        }
    });

    return fullText.trim().toLowerCase();
}

function getEmailLinks() {
    const containers = document.querySelectorAll(".a3s, .ii.gt");
    let links = [];

    containers.forEach(body => {
        const anchors = body.querySelectorAll("a[href]");
        anchors.forEach(a => {
            if (a.href) {
                links.push(a.href.toLowerCase());
            }
        });
    });

    return links;
}

function createSignature(text) {
    return text.slice(0, 300); // prevents duplicate scans
}

/* ===============================
   STORAGE LOGGING (FOR POPUP)
================================= */
function saveAlert(score, verdict) {
    chrome.storage.local.get(["alerts"], (data) => {
        let alerts = data.alerts || [];

        alerts.unshift({
            score: score,
            verdict: verdict,
            url: location.href,
            time: new Date().toLocaleString()
        });

        chrome.storage.local.set({ alerts: alerts.slice(0, 50) });
        console.log("📌 Alert logged:", score, verdict);
    });
}

/* ===============================
   AI BACKEND CALL
================================= */
async function analyzeWithAI(text, links) {
    try {
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, links })
        });

        if (!response.ok) {
            console.error("❌ AI API error:", response.status);
            return { ai_score: 0, verdict: "API Error" };
        }

        const data = await response.json();
        console.log("🧠 AI Result:", data);
        return data;

    } catch (err) {
        console.error("❌ AI Fetch Failed:", err);
        return { ai_score: 0, verdict: "Connection Failed" };
    }
}

/* ===============================
   MAIN SCANNER (SMART + STABLE)
================================= */
async function scanEmail() {
    if (!location.hostname.includes("mail.google.com")) return;

    const now = Date.now();
    if (isScanning || (now - lastScanTime < scanCooldown)) return;

    const text = getEmailText();

    // 🚨 CRITICAL: Remove banner if no email content
    if (!text || text.length < 50) {
        removeBanner();
        return;
    }

    const signature = createSignature(text);

    // Avoid scanning same email repeatedly
    if (signature === lastSignature) return;

    lastSignature = signature;
    lastScanTime = now;
    isScanning = true;

    const links = getEmailLinks();

    console.log("📨 New Email Detected → AI Scan");
    console.log("🔗 Links:", links);

    const result = await analyzeWithAI(text, links);

    const score = result.ai_score || 0;
    const verdict = result.verdict || "Unknown";

    showBanner(score, verdict);
    saveAlert(score, verdict);

    isScanning = false;
}

/* ===============================
   GMAIL SPA NAVIGATION DETECTOR
   (FIXES STUCK BANNER WHEN SWITCHING EMAILS)
================================= */
setInterval(() => {
    if (location.href !== lastUrl) {
        console.log("🔄 Gmail navigation detected");
        lastUrl = location.href;
        lastSignature = "";
        removeBanner();
    }
}, 1000);

/* ===============================
   DOM OBSERVER (REAL-TIME EMAIL DETECTION)
================================= */
const observer = new MutationObserver(() => {
    scanEmail();
});

setTimeout(() => {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log("🚀 AI Gmail Scanner Active (Stable Mode)");
}, 4000);