// Update the content script to handle block/trust actions
let userActions = [];
let isBlocked = false;

// Listen for user interactions
document.addEventListener('click', (e) => {
    if (!isBlocked) {
        userActions.push({
            type: 'click',
            element: e.target.tagName,
            timestamp: Date.now()
        });
    }
});

document.addEventListener('input', (e) => {
    if (!isBlocked) {
        userActions.push({
            type: 'input',
            element: e.target.tagName,
            timestamp: Date.now()
        });
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'blockSite':
            handleBlockSite();
            break;
        case 'trustSite':
            handleTrustSite();
            break;
        case 'analyze':
            handleAnalyze(sendResponse);
            return true;
    }
});

function handleBlockSite() {
    isBlocked = true;
    // Create blocking overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(231, 76, 60, 0.95);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
        font-family: sans-serif;
    `;
    overlay.innerHTML = `
        <h1>⚠️ Site Blocked</h1>
        <p>This site has been blocked for your security.</p>
    `;
    document.body.appendChild(overlay);
}

function handleTrustSite() {
    isBlocked = false;
    // Remove any existing blocking overlay
    const overlay = document.querySelector('div[style*="z-index: 999999"]');
    if (overlay) {
        overlay.remove();
    }
}

function handleAnalyze(sendResponse) {
    const analyzer = window.URLAnalyzer;
    analyzer.analyzeURL(window.location.href)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
} 