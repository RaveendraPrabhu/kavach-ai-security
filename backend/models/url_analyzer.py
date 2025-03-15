import tensorflow as tf
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import tld

class URLAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.build_model()

    def build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(100,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        self.model = model

    def extract_features(self, url):
        features = {
            'length': len(url),
            'num_digits': len(re.findall(r'\d', url)),
            'num_special': len(re.findall(r'[^a-zA-Z0-9]', url)),
            'has_https': int(url.startswith('https')),
            'num_dots': url.count('.'),
            'num_subdomains': len(url.split('.'))-1,
            'has_suspicious_tld': self.check_suspicious_tld(url),
            'entropy': self.calculate_entropy(url)
        }
        return np.array(list(features.values()))

    def check_suspicious_tld(self, url):
        try:
            domain = tld.get_tld(url, as_object=True)
            suspicious_tlds = {'.xyz', '.top', '.work', '.party', '.gq', '.ml'}
            return 1 if domain.suffix in suspicious_tlds else 0
        except:
            return 1

    def calculate_entropy(self, url):
        prob = [float(url.count(c)) / len(url) for c in dict.fromkeys(list(url))]
        entropy = -sum([p * np.log2(p) for p in prob])
        return entropy 