document.addEventListener('DOMContentLoaded', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentURL = tabs[0].url;

    // Initialize UI elements
    initializeTabSystem();
    initializeActionButtons();

    try {
        const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: currentURL,
                screenshot: await captureScreenshot(),
                behavior: await collectBehaviorData()
            })
        });

        const result = await response.json();
        updateUI(result);
    } catch (error) {
        showError(error);
    }
});

async function captureScreenshot() {
    // Implementation of screenshot capture
    return '';
}

async function collectBehaviorData() {
    return {
        page_text: document.body.innerText,
        user_actions: window.userActions || [],
        form_data: collectFormData(),
        navigation: collectNavigationData(),
        permissions: await checkPermissions()
    };
}

function initializeTabSystem() {
    const tabs = document.querySelectorAll('.tab');
    const results = document.getElementById('results');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show loading state
            results.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading ${tab.textContent} data...</p>
                </div>
            `;
            
            // Show corresponding content after a brief delay
            setTimeout(() => {
                switch(tab.dataset.tab) {
                    case 'basic':
                        showBasicAnalysis();
                        break;
                    case 'advanced':
                        showAdvancedAnalysis();
                        break;
                    case 'behavior':
                        showBehaviorAnalysis();
                        break;
                }
            }, 300);
        });
    });
}

function initializeActionButtons() {
    const blockButton = document.getElementById('blockSite');
    const trustButton = document.getElementById('trustSite');

    blockButton.addEventListener('click', async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentURL = new URL(tabs[0].url).hostname;
        
        // Show loading state
        blockButton.innerHTML = 'Blocking...';
        blockButton.disabled = true;

        try {
            // Store in chrome storage
            await chrome.storage.local.get(['blockedSites'], function(result) {
                const blockedSites = result.blockedSites || [];
                if (!blockedSites.includes(currentURL)) {
                    blockedSites.push(currentURL);
                    chrome.storage.local.set({ blockedSites });
                }
            });

            // Update UI
            blockButton.style.background = '#c0392b';
            blockButton.innerHTML = 'Site Blocked';
            
            // Send message to content script
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'blockSite',
                url: currentURL
            });

            // Update the threat summary
            updateThreatSummary({ status: 'blocked' }, 1);

        } catch (error) {
            console.error('Error blocking site:', error);
            blockButton.innerHTML = 'Block Failed';
            blockButton.style.background = '#95a5a6';
        }
    });

    trustButton.addEventListener('click', async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentURL = new URL(tabs[0].url).hostname;
        
        // Show loading state
        trustButton.innerHTML = 'Trusting...';
        trustButton.disabled = true;

        try {
            // Store in chrome storage
            await chrome.storage.local.get(['trustedSites'], function(result) {
                const trustedSites = result.trustedSites || [];
                if (!trustedSites.includes(currentURL)) {
                    trustedSites.push(currentURL);
                    chrome.storage.local.set({ trustedSites });
                }
            });

            // Update UI
            trustButton.style.background = '#27ae60';
            trustButton.innerHTML = 'Site Trusted';
            
            // Send message to content script
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'trustSite',
                url: currentURL
            });

            // Update the threat summary
            updateThreatSummary({ status: 'trusted' }, 0);

        } catch (error) {
            console.error('Error trusting site:', error);
            trustButton.innerHTML = 'Trust Failed';
            trustButton.style.background = '#95a5a6';
        }
    });
}

function showError(error) {
    document.getElementById('results').innerHTML = `
        <div class="error">
            <strong>Analysis Error</strong><br>
            ${error.message || 'Failed to analyze URL'}
        </div>
    `;
    console.error('Error:', error);
}

function showBasicAnalysis() {
    // Show basic security metrics
    const results = document.getElementById('results');
    results.innerHTML = generateResultsHTML(window.currentAnalysis || {});
}

function showAdvancedAnalysis() {
    const results = document.getElementById('results');
    if (window.currentAnalysis?.kavach_analysis) {
        const analysis = window.currentAnalysis.kavach_analysis;
        results.innerHTML = `
            <div class="ai-analysis">
                <h4>Advanced AI Analysis</h4>
                <div class="risk-item">
                    <span class="label">
                        <span class="icon">🎯</span>
                        Zero-Day Detection
                        <div class="risk-details">Analyzing unknown threats</div>
                    </span>
                    <span class="value ${getRiskClass(analysis.zero_day_detection?.risk_level || 0)}">
                        ${((analysis.zero_day_detection?.risk_level || 0) * 100).toFixed(1)}%
                    </span>
                </div>
                <div class="risk-item">
                    <span class="label">
                        <span class="icon">🔍</span>
                        Content Analysis
                        <div class="risk-details">Examining page content</div>
                    </span>
                    <span class="value ${getRiskClass(analysis.content_risk || 0)}">
                        ${((analysis.content_risk || 0) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
        `;
    }
}

function showBehaviorAnalysis() {
    const results = document.getElementById('results');
    if (window.currentAnalysis?.kavach_analysis?.behavior_analysis) {
        const behavior = window.currentAnalysis.kavach_analysis.behavior_analysis;
        results.innerHTML = `
            <div class="behavior-analysis">
                <h4>Behavior Monitoring</h4>
                <div class="risk-item">
                    <span class="label">
                        <span class="icon">📝</span>
                        Form Analysis
                        <div class="risk-details">Monitoring data collection</div>
                    </span>
                    <span class="value ${getRiskClass(behavior.form_risk || 0)}">
                        ${((behavior.form_risk || 0) * 100).toFixed(1)}%
                    </span>
                </div>
                <div class="risk-item">
                    <span class="label">
                        <span class="icon">🔄</span>
                        Navigation Analysis
                        <div class="risk-details">Analyzing redirects</div>
                    </span>
                    <span class="value ${getRiskClass(behavior.navigation_risk || 0)}">
                        ${((behavior.navigation_risk || 0) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
        `;
    }
}

function updateUI(result) {
    // Store the analysis for tab switching
    window.currentAnalysis = result;
    
    const riskLevel = document.getElementById('riskLevel');
    const results = document.getElementById('results');
    const threatSummary = document.getElementById('threatSummary');
    
    const urlRisk = isNaN(result.url_risk) ? 0 : result.url_risk;
    const visualRisk = isNaN(result.visual_risk) ? 0 : result.visual_risk;
    const behaviorRisk = isNaN(result.behavior_risk) ? 0 : result.behavior_risk;
    const overallRisk = Math.max(urlRisk, visualRisk, behaviorRisk);

    updateThreatSummary(result, overallRisk);
    riskLevel.style.width = `${overallRisk * 100}%`;
    showBasicAnalysis(); // Show basic analysis by default
}

function updateThreatSummary(result, overallRisk) {
    const summary = document.getElementById('threatSummary');
    let status, message;

    if (overallRisk < 0.3) {
        status = 'Safe';
        message = 'No significant threats detected';
    } else if (overallRisk < 0.7) {
        status = 'Caution';
        message = 'Potential security concerns detected';
    } else {
        status = 'Warning';
        message = 'High-risk threats identified';
    }

    summary.innerHTML = `
        <h3>${status}</h3>
        <p>${message}</p>
    `;
}

function generateResultsHTML(result) {
    if (!result || typeof result !== 'object') {
        return `
            <div class="error">
                Invalid analysis data received
            </div>
        `;
    }

    return `
        <div class="risk-item">
            <span class="label">
                <span class="icon">🔍</span>
                Deep URL Analysis
                <div class="risk-details">Checking for phishing patterns</div>
            </span>
            <span class="value ${getRiskClass(result.url_risk || 0)}">
                ${((result.url_risk || 0) * 100).toFixed(1)}%
            </span>
        </div>
        <div class="risk-item">
            <span class="label">
                <span class="icon">🔍</span>
                Visual Trust Score
                <div class="risk-details">Brand impersonation check</div>
            </span>
            <span class="value ${getRiskClass(result.visual_risk || 0)}">
                ${((result.visual_risk || 0) * 100).toFixed(1)}%
            </span>
        </div>
        <div class="risk-item">
            <span class="label">
                <span class="icon">🔄</span>
                Behavior Analysis
                <div class="risk-details">Monitoring suspicious activities</div>
            </span>
            <span class="value ${getRiskClass(result.behavior_risk || 0)}">
                ${((result.behavior_risk || 0) * 100).toFixed(1)}%
            </span>
        </div>
    `;
}

function generateAIInsights(result) {
    // Generate AI-powered security insights
    const insights = [];
    if (result.kavach_analysis) {
        const analysis = result.kavach_analysis;
        if (analysis.zero_day_detection?.is_zero_day) {
            insights.push("⚠️ Potential zero-day threat detected");
        }
        if (analysis.phishing_risk?.risk_level > 0.7) {
            insights.push("🎣 High phishing risk identified");
        }
        // Add more insights based on available analysis
    }
    return insights.length ? insights.join('<br>') : 'No significant threats detected';
}

function getRiskClass(risk) {
    if (risk < 0.3) return 'low-risk';
    if (risk < 0.7) return 'medium-risk';
    return 'high-risk';
}

function collectFormData() {
    const forms = document.getElementsByTagName('form');
    const formData = [];
    for (let form of forms) {
        const inputs = form.getElementsByTagName('input');
        formData.push({
            inputs: Array.from(inputs).map(input => ({
                type: input.type,
                name: input.name || input.id,
                isPassword: input.type === 'password'
            }))
        });
    }
    return formData;
}

function collectNavigationData() {
    return {
        currentURL: window.location.href,
        referrer: document.referrer,
        loadTime: performance.now()
    };
}

async function checkPermissions() {
    const permissions = [];
    try {
        if (navigator.permissions) {
            const items = ['camera', 'microphone', 'geolocation'];
            for (let item of items) {
                const status = await navigator.permissions.query({ name: item });
                permissions.push({ name: item, state: status.state });
            }
        }
    } catch (e) {
        console.error('Permission check error:', e);
    }
    return permissions;
} 