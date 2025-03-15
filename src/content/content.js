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

    // Send data to background script for analysis
    chrome.runtime.sendMessage({
        type: 'analyzePageContent',
        data: pageData
    });

    // Try to connect to backend if available
    fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Send analysis results to background script
        chrome.runtime.sendMessage({
            type: 'backendAnalysisResult',
            data: data
        });
    })
    .catch(error => {
        console.warn('Backend connection error:', error);
        // Continue with local analysis only
    });
}); 