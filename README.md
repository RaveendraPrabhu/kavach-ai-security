# Kavach AI Security

Kavach AI Security is an advanced browser extension that uses artificial intelligence to detect and prevent phishing attacks in real-time. The name "Kavach" means "shield" or "armor" in Sanskrit, reflecting the extension's purpose of protecting users from online threats.

## Features

- **Real-time Phishing Detection**: Analyzes websites as you browse to identify potential phishing attempts
- **Visual Analysis**: Uses computer vision to detect visual similarities with legitimate websites
- **Behavioral Analysis**: Monitors page behavior for suspicious activities
- **URL Analysis**: Examines URLs for patterns commonly associated with phishing
- **Zero-Day Threat Detection**: Identifies previously unknown phishing techniques
- **User-Friendly Alerts**: Clear notifications when potential threats are detected
- **Detailed Risk Reports**: Comprehensive breakdown of detected security risks
- **Age Verification**: Helps protect minors from inappropriate content
- **Privacy-Focused**: All analysis happens locally or through secure API calls

## Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 14 or higher
- npm 6 or higher

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/RaveendraPrabhu/kavach-ai-security.git
   cd kavach-ai-security
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up your environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file and add your OpenAI API key.

5. Start the backend server:
   ```
   python backend/app.py
   ```
   The server will run on http://localhost:5000

### Extension Setup

1. Install the required npm packages:
   ```
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Load the extension in your browser:
   - Chrome: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `dist` folder
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder

## Usage

1. After installation, you'll see the Kavach AI icon in your browser toolbar.
2. Click the icon to open the extension popup and see the security status of the current page.
3. Browse the web normally - Kavach AI will automatically analyze pages as you visit them.
4. If a potential phishing attempt is detected, you'll receive an alert with details about the threat.
5. You can view detailed analysis by clicking "View Details" in the alert or popup.
6. To report a false positive or negative, use the feedback option in the popup.

## API Documentation

The backend API provides several endpoints for the extension to interact with:

### `/api/analyze` (POST)

Analyzes a URL and its content for security threats.

**Request Body:**
```json
{
  "url": "https://example.com",
  "screenshot": "base64_encoded_screenshot",
  "behavior": {
    "page_text": "Text content of the page",
    "form_data": {},
    "navigation": [],
    "metadata": {}
  }
}
```

**Response:**
```json
{
  "url_risk": 0.3,
  "visual_risk": 0.2,
  "behavior_risk": 0.1,
  "ssl_status": true,
  "overall_risk": 0.3,
  "kavach_analysis": {
    "zero_day_detection": {
      "is_zero_day": false,
      "risk_level": 0.1,
      "details": "No zero-day threats detected"
    },
    "phishing_risk": {
      "risk_level": 0.2,
      "indicators": ["legitimate domain age", "valid SSL"]
    },
    "content_risk": 0.1,
    "behavior_analysis": {
      "form_risk": 0.1,
      "navigation_risk": 0.1,
      "suspicious_patterns": []
    }
  }
}
```

### `/api/report` (POST)

Reports a phishing attempt or provides feedback.

**Request Body:**
```json
{
  "url": "https://example.com",
  "is_phishing": true,
  "details": "This site attempted to steal login credentials",
  "user_feedback": "The site mimics the legitimate bank website"
}
```

**Response:**
```json
{
  "success": true,
  "report_id": "12345"
}
```

## Development Setup

### Backend Development

1. Make sure you have all the required dependencies installed:
   ```
   pip install -r requirements.txt
   ```

2. For development, you can run the backend server with debug mode:
   ```
   python backend/app.py
   ```

3. To test the API endpoints:
   ```
   python test_api.py
   ```

### Frontend Development

1. Install development dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. For testing:
   ```
   npm test
   ```

### Building for Production

1. Build the extension:
   ```
   npm run build
   ```

2. The built extension will be in the `dist` folder, ready for distribution.

## Testing

### Backend Tests

Run the backend tests with:
```
python -m pytest backend/tests/
```

### Frontend Tests

Run the frontend tests with:
```
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- TensorFlow and scikit-learn for machine learning functionality
- The open-source community for various libraries used in this project
