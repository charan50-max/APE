// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Student Anti-Phishing Shield Installed");
});

// Listen for phishing alerts from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PHISHING_DETECTED") {
        const logEntry = {
            url: sender.tab ? sender.tab.url : "gmail",
            riskScore: message.score,
            timestamp: new Date().toISOString(),
            detectedLinks: message.links || []
        };

        chrome.storage.local.get(["phishingLogs"], (result) => {
            const logs = result.phishingLogs || [];
            logs.push(logEntry);

            chrome.storage.local.set({ phishingLogs: logs }, () => {
                console.log("Phishing log saved:", logEntry);
            });
        });
    }
});