# Testing Kavach AI Security Extension

This document provides instructions for testing the Kavach AI Security extension for the hackathon evaluation.

## Setup Instructions

### 1. Backend Setup

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
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file

5. Start the backend server:
   ```
   python backend/app.py
   ```
   The server will run on http://localhost:5000

### 2. Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `dist` folder from the repository
4. The Kavach AI Security extension should now be installed and visible in your extensions list

## Testing Scenarios

### 1. Phishing Detection

1. Visit a known safe website (e.g., google.com)
   - The extension should show a low risk score

2. Visit a simulated phishing website (for testing purposes):
   - https://phishing-test.com (simulated URL)
   - The extension should detect this as a potential phishing attempt

### 2. Visual Analysis

1. Visit a legitimate banking website
   - The extension should recognize it as legitimate

2. Visit a website that mimics a banking website
   - The extension should detect visual similarities and flag it

### 3. URL Analysis

1. Test with various URLs:
   - Legitimate: https://www.paypal.com
   - Suspicious: https://paypal-secure.com (simulated)

### 4. Extension UI

1. Click on the extension icon to open the popup
   - Verify that the UI is responsive and displays information clearly
   - Check that risk scores are displayed correctly

## Evaluation Criteria

- **Functionality**: Does the extension correctly identify phishing attempts?
- **Performance**: Does the extension operate without significant lag?
- **User Experience**: Is the extension intuitive and user-friendly?
- **Innovation**: Does the solution use AI in a novel way to enhance security?
- **Technical Implementation**: Is the code well-structured and maintainable?

## Troubleshooting

If you encounter any issues during testing:

1. Check that the backend server is running on port 5000
2. Ensure the OpenAI API key is correctly set in the `.env` file
3. Verify that all dependencies are installed correctly
4. Check the browser console for any JavaScript errors

For any questions or assistance, please contact [Your Contact Information]. 