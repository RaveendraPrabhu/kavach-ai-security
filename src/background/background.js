class SecureNetAI {
    constructor() {
        this.cache = new Map();
        this.ML_ENDPOINT = 'https://api.securenet.ai/analyze';
        this.setupListeners();
        this.initializeModels();
    }

    async initializeModels() {
        try {
            // Load lightweight ML models for local analysis
            this.urlEncoder = await tf.loadLayersModel('chrome-extension://' + chrome.runtime.id + '/models/url_encoder/model.json');
            this.visualModel = await tf.loadLayersModel('chrome-extension://' + chrome.runtime.id + '/models/visual_analyzer/model.json');
            this.behaviorModel = await tf.loadLayersModel('chrome-extension://' + chrome.runtime.id + '/models/behavior_detector/model.json');
            console.log('Models loaded successfully');
        } catch (error) {
            console.warn('Error loading models:', error);
            console.log('Using fallback analysis methods');
            // Create dummy models or use alternative methods
            this.useBackendOnly = true;
        }
    }

    setupListeners() {
        chrome.webNavigation.onBeforeNavigate.addListener(
            (details) => this.preemptiveAnalysis(details)
        );

        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => this.handleMessage(message, sender, sendResponse)
        );

        chrome.webRequest.onBeforeRequest.addListener(
            (details) => this.interceptRequest(details),
            { urls: ["<all_urls>"] },
            ["blocking"]
        );
    }

    async preemptiveAnalysis(details) {
        const analysis = await this.analyzeURL(details.url);
        if (analysis.riskScore > 85) {
            this.showBlockPage(details.tabId, analysis);
        }
    }

    async analyzeURL(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        let analysis;
        
        if (this.useBackendOnly) {
            // If models failed to load, use backend API only
            analysis = await this.fetchAnalysisFromBackend(url);
        } else {
            // Use local models first, then enhance with backend API
            analysis = {
                urlRisk: await this.performURLAnalysis(url),
                visualRisk: 0,
                behaviorRisk: 0,
                warnings: [],
                timestamp: Date.now()
            };
            
            // Enhance with backend data when available
            try {
                const backendAnalysis = await this.fetchAnalysisFromBackend(url);
                if (backendAnalysis) {
                    analysis = { ...analysis, ...backendAnalysis };
                }
            } catch (error) {
                console.warn('Error fetching backend analysis:', error);
            }
        }

        this.cache.set(url, analysis);
        return analysis;
    }

    async performURLAnalysis(url) {
        // Local ML-based analysis
        const urlFeatures = this.extractURLFeatures(url);
        const tensorData = tf.tensor2d([urlFeatures]);
        const prediction = this.urlEncoder.predict(tensorData);
        return prediction.dataSync()[0] * 100;
    }

    extractURLFeatures(url) {
        const urlObj = new URL(url);
        return [
            urlObj.hostname.length,
            this.countSpecialChars(url),
            this.calculateEntropy(url),
            this.checkTLD(urlObj.hostname),
            // Add more sophisticated features...
        ];
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'getAnalysis':
                const analysis = await this.getFullAnalysis(message.url);
                sendResponse(analysis);
                break;
            case 'reportWebsite':
                await this.reportPhishingSite(message.url);
                sendResponse({ success: true });
                break;
            case 'analyzePageContent':
                // Handle page content analysis from content script
                this.analyzePageContent(message.data, sender.tab.id);
                break;
            case 'backendAnalysisResult':
                // Update cache with backend analysis results
                if (message.data && message.data.url) {
                    this.updateCacheWithBackendResults(message.data);
                }
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
        return true; // Keep the message channel open for async responses
    }

    async analyzePageContent(pageData, tabId) {
        try {
            // Extract content for analysis
            const url = pageData.url;
            const content = pageData.content;
            
            // Perform basic analysis
            const analysis = await this.getFullAnalysis(url);
            
            // Check if site should be blocked
            if (analysis.overall_risk > 0.8) {
                chrome.tabs.sendMessage(tabId, { action: "blockSite" });
                
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'assets/icon128.png',
                    title: 'High Risk Website Detected',
                    message: 'Kavach AI has blocked a potentially dangerous website.',
                    priority: 2
                });
            }
            
            // Update badge with risk level
            this.updateBadge(tabId, analysis.overall_risk);
            
        } catch (error) {
            console.error('Error analyzing page content:', error);
        }
    }
    
    updateBadge(tabId, riskScore) {
        // Convert risk score to color
        let color = '#4CAF50'; // Green for low risk
        if (riskScore > 0.7) {
            color = '#F44336'; // Red for high risk
        } else if (riskScore > 0.4) {
            color = '#FFC107'; // Yellow for medium risk
        }
        
        // Update badge
        chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
        chrome.action.setBadgeText({ 
            text: Math.round(riskScore * 100).toString(), 
            tabId: tabId 
        });
    }
    
    updateCacheWithBackendResults(backendData) {
        if (!backendData.url) return;
        
        // Get existing analysis from cache or create new one
        const url = backendData.url;
        let analysis = this.cache.get(url) || {
            urlRisk: 0,
            visualRisk: 0,
            behaviorRisk: 0,
            warnings: [],
            timestamp: Date.now()
        };
        
        // Update with backend data
        analysis = {
            ...analysis,
            urlRisk: backendData.url_risk || analysis.urlRisk,
            visualRisk: backendData.visual_risk || analysis.visualRisk,
            behaviorRisk: backendData.behavior_risk || analysis.behaviorRisk,
            overall_risk: backendData.overall_risk || Math.max(analysis.urlRisk, analysis.visualRisk, analysis.behaviorRisk),
            kavach_analysis: backendData.kavach_analysis || {}
        };
        
        // Update cache
        this.cache.set(url, analysis);
    }

    async getFullAnalysis(url) {
        const baseAnalysis = await this.analyzeURL(url);
        const [visualScore, behaviorScore] = await Promise.all([
            this.analyzeVisualElements(url),
            this.analyzeBehavior(url)
        ]);

        return {
            ...baseAnalysis,
            visualRisk: visualScore,
            behaviorRisk: behaviorScore,
            warnings: this.generateWarnings(baseAnalysis, visualScore, behaviorScore)
        };
    }

    async analyzeVisualElements(url) {
        // Implement visual similarity analysis
        return new Promise(resolve => setTimeout(() => resolve(Math.random() * 100), 500));
    }

    async analyzeBehavior(url) {
        // Implement behavior analysis
        return new Promise(resolve => setTimeout(() => resolve(Math.random() * 100), 500));
    }

    generateWarnings(urlAnalysis, visualScore, behaviorScore) {
        const warnings = [];
        
        if (urlAnalysis.urlRisk > 70) {
            warnings.push("Suspicious URL pattern detected");
        }
        if (visualScore > 70) {
            warnings.push("This site appears to imitate a legitimate website");
        }
        if (behaviorScore > 70) {
            warnings.push("Suspicious behavior detected (unusual form submission patterns)");
        }

        return warnings;
    }

    async reportPhishingSite(url) {
        // Implementation for reporting phishing sites
        const report = {
            url,
            timestamp: Date.now(),
            analysis: await this.getFullAnalysis(url)
        };

        // Send to backend and update federated learning model
        await this.updateFederatedModel(report);
    }

    async updateFederatedModel(report) {
        // Implementation for federated learning update
    }

    async fetchAnalysisFromBackend(url) {
        try {
            const response = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
            
            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Backend API unavailable:', error);
            // Return a default analysis with low risk when backend is unavailable
            return {
                urlRisk: 0.1,
                visualRisk: 0.1,
                behaviorRisk: 0.1,
                overall_risk: 0.1,
                warnings: ['Backend API unavailable, using limited analysis']
            };
        }
    }
}

// Initialize the background service
const secureNet = new SecureNetAI(); 