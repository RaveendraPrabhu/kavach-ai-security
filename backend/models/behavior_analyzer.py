from sklearn.ensemble import RandomForestClassifier
import numpy as np
import re

class BehaviorAnalyzer:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.suspicious_patterns = self.load_suspicious_patterns()

    def load_suspicious_patterns(self):
        return {
            'form_submission': r'POST.*?password',
            'redirect_chain': r'window\.location',
            'popup_spam': r'window\.open',
            'clipboard_access': r'navigator\.clipboard',
            'keyboard_logging': r'addEventListener.*?keydown'
        }

    def extract_features(self, behavior_data):
        features = {
            'form_submissions': behavior_data.get('form_submissions', 0),
            'redirects': behavior_data.get('redirects', 0),
            'popups': behavior_data.get('popups', 0),
            'suspicious_scripts': self.analyze_scripts(behavior_data.get('scripts', [])),
            'input_monitoring': behavior_data.get('input_monitoring', 0),
            'clipboard_access': behavior_data.get('clipboard_access', 0)
        }
        return np.array(list(features.values()))

    def analyze_scripts(self, scripts):
        suspicious_count = 0
        for script in scripts:
            for pattern in self.suspicious_patterns.values():
                if re.search(pattern, script, re.I):
                    suspicious_count += 1
        return suspicious_count 