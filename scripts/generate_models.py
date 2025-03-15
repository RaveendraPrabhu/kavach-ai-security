import tensorflow as tf
import numpy as np
import os
import json

def create_simple_url_model():
    """Create a simple URL analysis model"""
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_shape=(100,)),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    # Train with dummy data
    X = np.random.random((100, 100))
    y = np.random.randint(0, 2, (100, 1))
    model.fit(X, y, epochs=1, verbose=0)
    
    return model

def create_simple_visual_model():
    """Create a simple visual analysis model"""
    model = tf.keras.Sequential([
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    # Train with dummy data
    X = np.random.random((10, 224, 224, 3))
    y = np.random.randint(0, 2, (10, 1))
    model.fit(X, y, epochs=1, verbose=0)
    
    return model

def create_simple_behavior_model():
    """Create a simple behavior analysis model"""
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    # Train with dummy data
    X = np.random.random((50, 10))
    y = np.random.randint(0, 2, (50, 1))
    model.fit(X, y, epochs=1, verbose=0)
    
    return model

def save_models():
    """Save all models to the appropriate directories"""
    # Create directories if they don't exist
    backend_models_dir = os.path.join('backend', 'models', 'saved_models')
    extension_models_dir = os.path.join('dist', 'models')
    
    os.makedirs(backend_models_dir, exist_ok=True)
    os.makedirs(extension_models_dir, exist_ok=True)
    
    # Create and save URL model
    url_model = create_simple_url_model()
    url_model.save(os.path.join(backend_models_dir, 'url_detector.h5'))
    
    # Save for extension
    url_model.save(os.path.join(extension_models_dir, 'url_encoder'))
    
    # Create and save visual model
    visual_model = create_simple_visual_model()
    visual_model.save(os.path.join(backend_models_dir, 'visual_similarity.h5'))
    
    # Save for extension
    visual_model.save(os.path.join(extension_models_dir, 'visual_analyzer'))
    
    # Create and save behavior model
    behavior_model = create_simple_behavior_model()
    behavior_model.save(os.path.join(backend_models_dir, 'behavior_classifier.h5'))
    
    # Save for extension
    behavior_model.save(os.path.join(extension_models_dir, 'behavior_detector'))
    
    print("Models generated and saved successfully!")

if __name__ == "__main__":
    save_models() 