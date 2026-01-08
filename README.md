# QR_DECRYPTOR

A QR code decoder web application built with vanilla JavaScript, Tailwind CSS, and jsQR library.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Supported QR Code Formats](#supported-qr-code-formats)
- [Code Architecture](#code-architecture)
- [UI Components](#ui-components)
- [Customization](#customization)

---

## Overview

QR_DECRYPTOR is a modern, cyberpunk/hacker-themed QR code scanning and decoding application. It allows users to:
- Upload QR code images from their device
- Capture QR codes using their device camera
- Decode various types of QR code content (URLs, WiFi configs, plain text)

The application features a retro terminal aesthetic with green-on-black color scheme, CRT monitor effects, and smooth animations.

---

## Features

### Core Functionality
- **Image Upload**: Drag & drop or click to select QR code images
- **Camera Capture**: Use device camera to scan QR codes in real-time
- **Multi-format Support**: Decodes URLs, WiFi configurations, and plain text
- **Visual Feedback**: Scan animation and status indicators
- **Copy to Clipboard**: One-click copying of decoded content

### UI/UX Features
- **Responsive Design**: Optimized for mobile and desktop
- **Hacker Aesthetic**: CRT overlay, glowing borders, monospace fonts
- **Scan Animation**: Animated scanning line effect
- **Status Badges**: Visual indicators for scanning states
- **WiFi Password Blur**: Password hidden by default, reveal on hover

---

## How It Works

### Image Processing Pipeline

```
User Input (Image/Camera)
        ↓
Canvas Rendering
        ↓
ImageData Extraction
        ↓
jsQR Analysis
        ↓
Data Parsing
        ↓
UI Update
```

### Step-by-Step Process

1. **Input Handling**
   - File input accepts image files via click or drag & drop
   - Camera stream accessed via `navigator.mediaDevices.getUserMedia()`
   - Video frames captured and rendered to canvas

2. **Canvas Rendering**
   - Image/video scaled to fit canvas dimensions
   - `getImageData()` extracts pixel data as Uint8ClampedArray
   - Array contains RGBA values for each pixel

3. **QR Decoding**
   - jsQR library analyzes image data
   - Returns location points and decoded string
   - Location points define QR code corners

4. **Content Parsing**
   - URL detection (http/https prefixes)
   - WiFi config parsing (WIFI: protocol)
   - Plain text fallback for other content

5. **Visual Feedback**
   - Green bounding box drawn around detected QR
   - Status badge updates (Waiting → Scanning → Success/Error)
   - Scan animation plays during processing

---

## Technical Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup and structure |
| **Tailwind CSS** | Utility-first styling (via CDN) |
| **Vanilla JavaScript** | Application logic (ES6+) |
| **jsQR** | QR code detection and decoding |
| **Vite** | Development server and build tool |
| **ES Modules** | Module system for JavaScript |

### External Dependencies

```html
<!-- jsQR Library -->
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>
```

---

## Project Structure

```
QR Decoder/
├── .gitignore
├── index.html          # Main HTML entry point
├── package.json        # Node.js dependencies
├── README.md           # This file
├── public/
│   └── vite.svg        # Vite favicon
└── src/
    ├── main.js         # Application logic
    ├── style.css       # Custom styles
    ├── counter.js      # Unused (placeholder)
    └── javascript.svg  # Unused (placeholder)
```

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone or download the project:
```bash
git clone <repository-url>
cd QR Decoder
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## Usage

### Uploading an Image

1. Click the upload area or drag & drop an image
2. Image is processed automatically
3. Decoded content appears in the output section

### Using Camera

1. Click the "Camera" button
2. Allow camera permissions when prompted
3. Point camera at QR code
4. Click "Capture" to scan
5. Results display automatically

### Interpreting Results

#### URL Detection
- Automatically detected and displayed as clickable links
- Opens in new tab when clicked

#### WiFi Configuration
- Parsed from WIFI: protocol format
- Displays SSID, password, and encryption type
- Password blurred by default (hover to reveal)

#### Plain Text
- Displayed in monospace font
- Copy button available for quick copying

---

## Supported QR Code Formats

### URLs
```javascript
// Detected by prefix check
if (data.startsWith('http://') || data.startsWith('https://')) {
    // Render as clickable link
}
```

### WiFi Configurations
```
WIFI:S:MyNetwork;P:password123;T:WPA;;
```
- **S**: SSID (network name)
- **P**: Password
- **T**: Encryption type (WPA, WEP, none)

### Plain Text
Any other text content is displayed as-is with "TEXT" type indicator.

---

## Code Architecture

### Main JavaScript File (`src/main.js`)

#### Global Variables

```javascript
// DOM Elements
const fileInput = document.getElementById('file-input');
const previewCanvas = document.getElementById('preview-canvas');
const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });

// State
let cameraStream = null;
let isCameraActive = false;

// Output Elements
const outputContainer = document.getElementById('decoded-info');
const resType = document.getElementById('res-type');
const resRaw = document.getElementById('res-raw');
```

#### Core Functions

##### `parsePayload(data)`
Parses decoded QR data and updates UI accordingly.

```javascript
function parsePayload(data) {
    // Detect URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
        resType.textContent = 'URL';
        resRaw.innerHTML = `<a href="${data}" ...>${data}</a>`;
    }
    // Detect WiFi
    else if (data.startsWith("WIFI:")) {
        resType.textContent = 'WIFI_CONFIG';
        // Extract SSID, password, encryption using regex
        const ssid = data.match(/S:([^;]+);/)?.[1] || '---';
        // ...
    }
}
```

##### `updateClock()` (Removed)
Previously displayed current time in header. Removed as per user request.

##### `fileInput` Event Handler
Handles image upload and processing.

```javascript
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // Render to canvas
            // Extract image data
            // Run jsQR
            // Update UI with results
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});
```

##### Camera Functions

```javascript
// Start camera stream
cameraBtn.addEventListener('click', async () => {
    cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
    });
    cameraVideo.srcObject = cameraStream;
    // Show camera container
});

// Capture frame
captureBtn.addEventListener('click', () => {
    cameraVideo.pause();
    previewCanvas.width = cameraVideo.videoWidth;
    previewCanvas.height = cameraVideo.videoHeight;
    ctx.drawImage(cameraVideo, 0, 0);
    processCanvas();
    stopCamera();
});
```

##### `processCanvas()`
Processes canvas image data and decodes QR code.

```javascript
function processCanvas() {
    const imageData = ctx.getImageData(0, 0, 
        previewCanvas.width, previewCanvas.height);
    const code = jsQR(imageData.data, 
        imageData.width, imageData.height);
    
    if (code) {
        parsePayload(code.data);
        // Draw bounding box
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(code.location.topLeftCorner.x, ...);
        // ...
    }
}
```

---

## UI Components

### Header
- Title: "QR_DECRYPTOR" (left-aligned)
- Clear button (right-aligned)
- Responsive design for mobile/desktop

### Input Section
- Camera button with icon
- Camera preview (hidden by default)
- Capture/Close buttons
- Drag & drop upload area

### Image Preview
- Canvas element for rendering
- Scan animation overlay
- Green bounding box on detection

### Output Section
- Type indicator (URL/WIFI_CONFIG/TEXT)
- Status badge (Waiting/Scanning/Success/Error)
- WiFi details grid (SSID, Password, Encryption)
- Content display area with scrollbar
- Copy button

### Footer
- "Made by Devdebug" attribution

---

## Customization

### Theme Colors

Edit [`src/style.css`](src/style.css):

```css
:root {
    --hacker-green: #00ff41;
    --hacker-dark: #0d0208;
    --hacker-glow: rgba(0, 255, 65, 0.2);
}
```

### Animation Timing

Edit [`src/main.js`](src/main.js):

```javascript
// Delay before showing results (ms)
setTimeout(() => {
    // Show results
}, 1500);  // Change 1500 to desired delay
```

### Scan Animation

Edit [`src/style.css`](src/style.css):

```css
@keyframes scan-once {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
}
```

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Required APIs
- `FileReader` API
- `Canvas` API
- `getUserMedia` API (for camera)
- ES6+ JavaScript

---

## License

MIT License - feel free to use and modify for your projects.

---

## Acknowledgments

- [jsQR](https://github.com/nicejmp/jsQR) - Pure JavaScript QR code decoder
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Vite](https://vitejs.dev) - Next generation frontend tooling

---

**Made with ❤️ by Devdebug**
