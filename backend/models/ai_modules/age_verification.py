import tensorflow as tf
import cv2
import numpy as np
from transformers import pipeline

class AgeVerificationSystem:
    def __init__(self):
        self.content_classifier = self.load_content_classifier()
        self.text_analyzer = pipeline("text-classification", model="bert-base-uncased")
        self.age_threshold = 18

    def load_content_classifier(self):
        """Load pre-trained model for content classification"""
        base_model = tf.keras.applications.EfficientNetB0(
            include_top=False,
            weights='imagenet',
            input_shape=(224, 224, 3)
        )
        
        model = tf.keras.Sequential([
            base_model,
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        return model

    async def verify_content(self, page_data):
        """Comprehensive age-restricted content analysis"""
        visual_score = await self.analyze_visual_content(page_data['screenshots'])
        text_score = await self.analyze_text_content(page_data['text'])
        metadata_score = self.analyze_metadata(page_data['metadata'])
        
        return {
            'is_age_restricted': self.determine_restriction_status(
                visual_score, text_score, metadata_score
            ),
            'confidence_score': self.calculate_confidence([
                visual_score,
                text_score,
                metadata_score
            ]),
            'restriction_factors': {
                'visual_indicators': visual_score,
                'text_indicators': text_score,
                'metadata_indicators': metadata_score
            },
            'recommended_age': self.determine_recommended_age(
                visual_score, text_score, metadata_score
            )
        }

    async def analyze_visual_content(self, screenshots):
        """Analyze visual content for age-restricted material"""
        results = []
        for screenshot in screenshots:
            processed_image = self.preprocess_image(screenshot)
            prediction = self.content_classifier.predict(processed_image)
            results.append(float(prediction[0]))
        
        return {
            'risk_score': max(results),
            'detected_elements': self.identify_sensitive_elements(screenshots),
            'safe_zones': self.identify_safe_zones(screenshots)
        }

    async def analyze_text_content(self, text):
        """Analyze text for age-restricted content"""
        classification = self.text_analyzer(text)
        
        return {
            'content_rating': self.determine_content_rating(classification),
            'sensitive_terms': self.identify_sensitive_terms(text),
            'context_analysis': self.analyze_content_context(text)
        }

    def analyze_metadata(self, metadata):
        """Analyze page metadata for age indicators"""
        return {
            'age_declarations': self.extract_age_declarations(metadata),
            'content_warnings': self.extract_content_warnings(metadata),
            'regulatory_compliance': self.check_regulatory_compliance(metadata)
        }

    def determine_restriction_status(self, visual_score, text_score, metadata_score):
        """Determine if content should be age-restricted"""
        weighted_score = (
            0.4 * visual_score['risk_score'] +
            0.4 * text_score['content_rating']['score'] +
            0.2 * self.calculate_metadata_score(metadata_score)
        )
        return weighted_score > 0.6

    def determine_recommended_age(self, visual_score, text_score, metadata_score):
        """Calculate recommended minimum age for content"""
        base_age = 13
        risk_factors = []
        
        if visual_score['risk_score'] > 0.7:
            risk_factors.append(5)
        if text_score['content_rating']['score'] > 0.6:
            risk_factors.append(3)
        if metadata_score['regulatory_compliance']['age_requirement']:
            risk_factors.append(
                metadata_score['regulatory_compliance']['age_requirement'] - base_age
            )
        
        return base_age + sum(risk_factors) if risk_factors else base_age 