chrome.runtime.onInstalled.addListener(() => {
    console.log('Kavach AI Security Extension installed');
    // Initialize storage
    chrome.storage.local.set({
        blockedSites: [],
        trustedSites: []
    });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if site is blocked
        const hostname = new URL(tab.url).hostname;
        const { blockedSites } = await chrome.storage.local.get(['blockedSites']);
        
        if (blockedSites?.includes(hostname)) {
            chrome.tabs.sendMessage(tabId, { 
                action: 'blockSite',
                url: hostname
            });
        }

        // Inject analyzer script
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/utils/urlAnalyzer.js']
        });
    }
}); 