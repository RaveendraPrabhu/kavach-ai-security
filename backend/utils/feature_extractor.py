import numpy as np
import re
from urllib.parse import urlparse

class FeatureExtractor:
    def extract_url_features(self, url):
        """Extract features from a URL for analysis"""
        features = np.zeros(100)
        
        if not url:
            return features
        
        # Basic URL features
        features[0] = len(url)
        features[1] = url.count('.')
        features[2] = url.count('/')
        features[3] = url.count('?')
        features[4] = url.count('=')
        features[5] = url.count('-')
        features[6] = url.count('_')
        features[7] = url.count('@')
        features[8] = url.count('&')
        features[9] = url.count('!')
        features[10] = url.count(' ')
        features[11] = url.count('+')
        features[12] = url.count('*')
        features[13] = url.count('#')
        features[14] = url.count('$')
        features[15] = url.count('%')
        
        # Count digits and letters
        features[16] = len(re.findall(r'\d', url))
        features[17] = len(re.findall(r'[a-zA-Z]', url))
        
        # URL structure features
        try:
            parsed_url = urlparse(url)
            features[18] = len(parsed_url.netloc)
            features[19] = len(parsed_url.path)
            features[20] = len(parsed_url.params)
            features[21] = len(parsed_url.query)
            features[22] = len(parsed_url.fragment)
            features[23] = 1 if parsed_url.scheme == 'https' else 0
            
            # Domain specific features
            domain = parsed_url.netloc
            features[24] = domain.count('-')
            features[25] = domain.count('.')
            features[26] = len(domain)
            
            # Path specific features
            path = parsed_url.path
            features[27] = path.count('/')
            features[28] = path.count('.')
            features[29] = len(path)
        except:
            # If URL parsing fails, use default values
            pass
        
        return features
    
    def extract_visual_features(self, image):
        """Extract features from an image for analysis"""
        # This would normally use computer vision techniques
        # For now, return a placeholder feature vector
        return np.random.random(100)
    
    def extract_behavior_features(self, behavior_data):
        """Extract features from behavior data for analysis"""
        features = np.zeros(100)
        
        if not behavior_data:
            return features
        
        # Extract features from behavior data if available
        if isinstance(behavior_data, dict):
            # Form submissions
            if 'form_submissions' in behavior_data:
                features[0] = behavior_data['form_submissions']
            
            # Redirects
            if 'redirects' in behavior_data:
                features[1] = behavior_data['redirects']
            
            # Popups
            if 'popups' in behavior_data:
                features[2] = behavior_data['popups']
            
            # Scripts
            if 'scripts' in behavior_data:
                features[3] = len(behavior_data['scripts'])
            
            # Input monitoring
            if 'input_monitoring' in behavior_data:
                features[4] = behavior_data['input_monitoring']
            
            # Clipboard access
            if 'clipboard_access' in behavior_data:
                features[5] = behavior_data['clipboard_access']
        
        return features 