// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "blockSite") {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; background: #f44336; color: white;">
                <h1>⚠️ Site Blocked</h1>
                <p>This site has been blocked for your security.</p>
            </div>
        `;
    }
});

// Send page data to backend for analysis
document.addEventListener('DOMContentLoaded', () => {
    const pageData = {
        url: window.location.href,
        content: document.documentElement.outerHTML,
        timestamp: Date.now()
    };

    fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
    });
}); 