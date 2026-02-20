document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("alertsContainer");

    if (!container) {
        console.error("Alerts container not found in popup.html");
        return;
    }

    chrome.storage.local.get(["alerts"], (data) => {
        const alerts = data.alerts || [];

        if (alerts.length === 0) {
            container.innerHTML = "No phishing alerts yet.";
            return;
        }

        container.innerHTML = "";

        alerts.forEach(alert => {
            const div = document.createElement("div");
            div.className = "alert";

            div.innerHTML = `
                <strong>Risk:</strong> ${alert.score}/100<br>
                <strong>Verdict:</strong> ${alert.verdict}<br>
                <strong>Time:</strong> ${alert.time}
            `;

            container.appendChild(div);
        });
    });

    // Clear logs button
    const clearBtn = document.getElementById("clearLogs");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            chrome.storage.local.set({ alerts: [] }, () => {
                location.reload();
            });
        });
    }
});