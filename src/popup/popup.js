class PopupManager {
    constructor() {
        this.statusCircle = document.getElementById('statusCircle');
        this.statusText = document.getElementById('statusText');
        this.urlRisk = document.getElementById('urlRisk');
        this.visualRisk = document.getElementById('visualRisk');
        this.behaviorRisk = document.getElementById('behaviorRisk');
        this.warningsContainer = document.getElementById('warningsContainer');
        this.reportBtn = document.getElementById('reportBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.blockBtn = document.getElementById('blockBtn');
        this.trustBtn = document.getElementById('trustBtn');

        this.initializeEventListeners();
        this.updateStatus();
        this.initializeVisualizations();
    }

    initializeEventListeners() {
        this.reportBtn.addEventListener('click', () => this.reportWebsite());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.blockBtn.addEventListener('click', () => this.blockSite());
        this.trustBtn.addEventListener('click', () => this.trustSite());

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'analysisUpdate') {
                this.updateAnalysis(message.data);
            }
        });
    }

    async updateStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.runtime.sendMessage({
                type: 'getAnalysis',
                url: tab.url
            });
            
            this.updateAnalysis(response);
        } catch (error) {
            console.error('Error updating status:', error);
            this.showError();
        }
    }

    updateAnalysis(data) {
        // Update risk scores
        this.updateRiskScore('urlRisk', data.urlRisk);
        this.updateRiskScore('visualRisk', data.visualRisk);
        this.updateRiskScore('behaviorRisk', data.behaviorRisk);

        // Update overall status
        const overallRisk = Math.max(data.urlRisk, data.visualRisk, data.behaviorRisk);
        this.updateOverallStatus(overallRisk);

        // Update warnings
        this.updateWarnings(data.warnings);
    }

    updateRiskScore(elementId, score) {
        const element = document.getElementById(elementId);
        element.style.width = `${score}%`;
        
        if (score < 30) {
            element.style.backgroundColor = 'var(--success-color)';
        } else if (score < 70) {
            element.style.backgroundColor = 'var(--warning-color)';
        } else {
            element.style.backgroundColor = 'var(--danger-color)';
        }
    }

    updateOverallStatus(risk, statusText) {
        this.statusCircle.className = 'status-circle';
        
        if (statusText) {
            // If a specific status text is provided, use it
            this.statusText.textContent = statusText;
            if (statusText === 'Trusted Site') {
                this.statusCircle.classList.add('safe');
            }
        } else if (risk < 30) {
            this.statusCircle.classList.add('safe');
            this.statusText.textContent = 'Website is safe';
        } else if (risk < 70) {
            this.statusCircle.classList.add('warning');
            this.statusText.textContent = 'Exercise caution';
        } else {
            this.statusCircle.classList.add('danger');
            this.statusText.textContent = 'Potential threat detected';
        }
    }

    updateWarnings(warnings) {
        this.warningsContainer.innerHTML = '';
        
        warnings.forEach(warning => {
            const warningElement = document.createElement('div');
            warningElement.className = 'warning-item';
            warningElement.textContent = warning;
            this.warningsContainer.appendChild(warningElement);
        });
    }

    async reportWebsite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.runtime.sendMessage({
                type: 'reportWebsite',
                url: tab.url
            });
            alert('Website reported successfully. Thank you for helping make the internet safer!');
        } catch (error) {
            console.error('Error reporting website:', error);
            alert('Failed to report website. Please try again later.');
        }
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    showError() {
        this.statusText.textContent = 'Error analyzing website';
        this.statusCircle.className = 'status-circle danger';
    }

    initializeVisualizations() {
        this.scanCanvas = document.getElementById('scanCanvas');
        this.ctx = this.scanCanvas.getContext('2d');
        this.initializeParticleSystem();
    }

    initializeParticleSystem() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.scanCanvas.width,
                y: Math.random() * this.scanCanvas.height,
                speed: 1 + Math.random() * 2,
                radius: 1 + Math.random() * 2
            });
        }
        this.animateParticles();
    }

    animateParticles() {
        this.ctx.clearRect(0, 0, this.scanCanvas.width, this.scanCanvas.height);
        
        this.particles.forEach(particle => {
            particle.y -= particle.speed;
            if (particle.y < 0) {
                particle.y = this.scanCanvas.height;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(33, 150, 243, ${0.3 + Math.random() * 0.3})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animateParticles());
    }

    showRealTimeAnalysis() {
        const threatMap = document.getElementById('threatMap');
        this.updateThreatMap(threatMap);
    }

    updateThreatMap(canvas) {
        const ctx = canvas.getContext('2d');
        const data = this.getCurrentAnalysisData();
        
        // Create heatmap visualization
        this.drawHeatmap(ctx, data);
    }

    async showAIExplanation() {
        const explanation = await this.getAIExplanation();
        const container = document.getElementById('aiExplanation');
        
        const chart = new Chart(container, {
            type: 'radar',
            data: {
                labels: ['URL Analysis', 'Visual Similarity', 'Behavior Pattern', 'Content Analysis', 'SSL/TLS Check'],
                datasets: [{
                    label: 'Risk Factors',
                    data: explanation.scores,
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    pointBackgroundColor: 'rgba(33, 150, 243, 1)'
                }]
            }
        });
    }

    async blockSite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Add visual feedback for button click
            this.blockBtn.classList.add('clicked');
            setTimeout(() => this.blockBtn.classList.remove('clicked'), 300);
            
            // Store the blocked URL in chrome.storage.sync for persistence across all tabs
            chrome.storage.sync.get(['blockedSites'], (result) => {
                const blockedSites = result.blockedSites || [];
                if (!blockedSites.includes(tab.url)) {
                    blockedSites.push(tab.url);
                    chrome.storage.sync.set({ blockedSites });
                }
            });
            
            // Send message to content script to block the site
            chrome.tabs.sendMessage(tab.id, { action: "blockSite" });
            
            // Update background script to check for blocked sites
            chrome.runtime.sendMessage({
                type: 'updateBlockedSites',
                url: tab.url,
                action: 'add'
            });
            
            console.log('Site blocked:', tab.url);
            
            // Close the popup after action
            setTimeout(() => window.close(), 500);
        } catch (error) {
            console.error('Error blocking site:', error);
        }
    }
    
    async trustSite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Add visual feedback for button click
            this.trustBtn.classList.add('clicked');
            setTimeout(() => this.trustBtn.classList.remove('clicked'), 300);
            
            // Store the trusted URL in chrome.storage.sync for persistence across all tabs
            chrome.storage.sync.get(['trustedSites', 'blockedSites'], (result) => {
                // Add to trusted sites
                const trustedSites = result.trustedSites || [];
                if (!trustedSites.includes(tab.url)) {
                    trustedSites.push(tab.url);
                    chrome.storage.sync.set({ trustedSites });
                }
                
                // Remove from blocked sites if it was previously blocked
                const blockedSites = result.blockedSites || [];
                const updatedBlockedSites = blockedSites.filter(url => url !== tab.url);
                if (blockedSites.length !== updatedBlockedSites.length) {
                    chrome.storage.sync.set({ blockedSites: updatedBlockedSites });
                }
            });
            
            // Send message to content script to trust the site
            chrome.tabs.sendMessage(tab.id, { action: "trustSite" });
            
            // Update background script
            chrome.runtime.sendMessage({
                type: 'updateTrustedSites',
                url: tab.url,
                action: 'add'
            });
            
            // Update UI to show trusted status
            this.updateOverallStatus(0, 'Trusted Site');
            
            console.log('Site trusted:', tab.url);
            
            // Update the status badge
            const statusBadge = document.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Trusted Site';
                statusBadge.style.background = 'linear-gradient(90deg, #00c853, #69f0ae)';
            }
            
            // Don't close the popup immediately to show the trusted status
            setTimeout(() => window.close(), 1500);
        } catch (error) {
            console.error('Error trusting site:', error);
        }
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const detailItems = document.querySelectorAll('.detail-item');
    const statusBadge = document.querySelector('.status-badge');
    
    // Initialize the PopupManager
    const popupManager = new PopupManager();
    
    // Add staggered animation to detail items
    detailItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 100 * (index + 1));
    });

    // Get current tab URL and analyze
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        const hostname = new URL(currentUrl).hostname;
        
        // Check if the site is already blocked or trusted
        chrome.storage.sync.get(['blockedSites', 'trustedSites'], (result) => {
            const blockedSites = result.blockedSites || [];
            const trustedSites = result.trustedSites || [];
            
            if (blockedSites.includes(currentUrl)) {
                statusBadge.textContent = 'Blocked Site';
                statusBadge.style.background = 'linear-gradient(90deg, #f44336, #ff5252)';
                statusBadge.classList.remove('status-scanning');
                return;
            }
            
            if (trustedSites.includes(currentUrl)) {
                statusBadge.textContent = 'Trusted Site';
                statusBadge.style.background = 'linear-gradient(90deg, #00c853, #69f0ae)';
                statusBadge.classList.remove('status-scanning');
                return;
            }
            
            // Update status badge with current site
            statusBadge.textContent = `Analyzing ${hostname}...`;
            
            // Connect to Flask backend
            fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: currentUrl,
                    timestamp: Date.now()
                })
            })
            .then(response => response.json())
            .then(data => {
                // Update UI with analysis results
                updateAnalysisResults(data);
                statusBadge.textContent = getStatusText(data);
                statusBadge.classList.remove('status-scanning');
                
                if (isHighRisk(data)) {
                    statusBadge.style.background = 'linear-gradient(90deg, #f44336, #ff5252)';
                } else if (isMediumRisk(data)) {
                    statusBadge.style.background = 'linear-gradient(90deg, #ffc107, #ffecb3)';
                    statusBadge.style.color = '#5d4037';
                } else {
                    statusBadge.style.background = 'linear-gradient(90deg, #00c853, #69f0ae)';
                }
            })
            .catch(error => {
                console.error('Error analyzing website:', error);
                statusBadge.textContent = 'Analysis Failed';
                statusBadge.classList.remove('status-scanning');
                statusBadge.style.background = 'linear-gradient(90deg, #f44336, #ff5252)';
                
                // Show error in detail items
                updateDetailStatuses('error');
            });
        });
    });
    
    // Helper functions
    function updateAnalysisResults(data) {
        try {
            // Get risk scores from data
            const urlRisk = data.advanced_analysis?.kavach_ai?.phishing_risk?.url_risk_score || 0.1;
            const visualRisk = data.advanced_analysis?.visual_safety?.risk_score || 0.1;
            const behaviorRisk = data.advanced_analysis?.kavach_ai?.phishing_risk?.behavior_risk || 0.3;
            const sslRisk = data.advanced_analysis?.ssl_check?.risk_score || 0.1;
            
            // Update detail statuses
            updateDetailStatus('URL Analysis', urlRisk);
            updateDetailStatus('Visual Check', visualRisk);
            updateDetailStatus('Behavior Analysis', behaviorRisk);
            updateDetailStatus('SSL/TLS Check', sslRisk);
        } catch (error) {
            console.error('Error updating analysis results:', error);
        }
    }
    
    function updateDetailStatus(title, riskScore) {
        const detailItems = document.querySelectorAll('.detail-item');
        
        for (const item of detailItems) {
            const itemTitle = item.querySelector('.detail-title').textContent;
            if (itemTitle === title) {
                const statusElement = item.querySelector('.detail-status');
                
                // Remove all existing classes except 'detail-status'
                statusElement.className = 'detail-status';
                
                // Add appropriate class based on risk score
                if (riskScore < 0.3) {
                    statusElement.classList.add('success');
                    statusElement.textContent = 'Safe';
                } else if (riskScore < 0.7) {
                    statusElement.classList.add('warning');
                    statusElement.textContent = 'Caution';
                } else {
                    statusElement.classList.add('danger');
                    statusElement.textContent = 'Risk';
                }
                
                break;
            }
        }
    }
    
    function updateDetailStatuses(status) {
        const statusElements = document.querySelectorAll('.detail-status');
        
        statusElements.forEach(element => {
            // Remove all existing classes except 'detail-status'
            element.className = 'detail-status';
            
            if (status === 'error') {
                element.classList.add('danger');
                element.textContent = 'Error';
            }
        });
    }
    
    function getStatusText(data) {
        try {
            const overallRisk = data.advanced_analysis?.kavach_ai?.phishing_risk?.overall_risk || 0;
            
            if (overallRisk > 0.7) {
                return 'High Risk';
            } else if (overallRisk > 0.4) {
                return 'Exercise Caution';
            } else {
                return 'Safe';
            }
        } catch (error) {
            return 'Unknown';
        }
    }
    
    function isHighRisk(data) {
        try {
            const overallRisk = data.advanced_analysis?.kavach_ai?.phishing_risk?.overall_risk || 0;
            return overallRisk > 0.7;
        } catch (error) {
            return false;
        }
    }
    
    function isMediumRisk(data) {
        try {
            const overallRisk = data.advanced_analysis?.kavach_ai?.phishing_risk?.overall_risk || 0;
            return overallRisk > 0.4 && overallRisk <= 0.7;
        } catch (error) {
            return false;
        }
    }
}); 