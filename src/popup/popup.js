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

        this.initializeEventListeners();
        this.updateStatus();
        this.initializeVisualizations();
    }

    initializeEventListeners() {
        this.reportBtn.addEventListener('click', () => this.reportWebsite());
        this.settingsBtn.addEventListener('click', () => this.openSettings());

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

    updateOverallStatus(risk) {
        this.statusCircle.className = 'status-circle';
        
        if (risk < 30) {
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
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
}); 