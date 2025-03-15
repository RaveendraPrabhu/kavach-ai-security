import requests
import json
import base64
import cv2
import numpy as np

def create_dummy_screenshot():
    # Create a simple image
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    img.fill(255)  # White background
    # Convert to bytes
    _, img_encoded = cv2.imencode('.png', img)
    return base64.b64encode(img_encoded.tobytes()).decode('utf-8')

# Test data
data = {
    "url": "https://example.com",
    "screenshot": create_dummy_screenshot(),
    "behavior": {
        "page_text": "Welcome to our secure login page. Please enter your credentials.",
        "user_actions": [
            {"type": "click", "element": "login_button", "timestamp": 1234567890},
            {"type": "input", "element": "password_field", "timestamp": 1234567891}
        ],
        "metadata": {
            "page_load_time": 1.5,
            "user_interactions": 2,
            "form_fields": ["username", "password"]
        }
    }
}

# Test root endpoint
print("\nTesting root endpoint...")
response = requests.get("http://localhost:5000/")
print(json.dumps(response.json(), indent=2))

# Test analyze endpoint
print("\nTesting analyze endpoint...")
response = requests.post("http://localhost:5000/api/analyze", json=data)
print(json.dumps(response.json(), indent=2)) 