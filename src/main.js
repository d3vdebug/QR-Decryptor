import './style.css';

const fileInput = document.getElementById('file-input');
const previewCanvas = document.getElementById('preview-canvas');
const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });

// Camera elements
const cameraBtn = document.getElementById('camera-btn');
const cameraContainer = document.getElementById('camera-container');
const cameraVideo = document.getElementById('camera-video');
const captureBtn = document.getElementById('capture-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');

let cameraStream = null;
let isCameraActive = false;

const outputContainer = document.getElementById('decoded-info');
const loadingSpinner = document.getElementById('loading-spinner');
const noResult = document.getElementById('no-result');
const awaitingText = document.getElementById('awaiting-text');
const statusBadge = document.getElementById('status-badge');
const imgContainer = document.getElementById('image-preview-container');
const uploadArea = document.getElementById('upload-area');

const resType = document.getElementById('res-type');
const resRaw = document.getElementById('res-raw');
const wifiGrid = document.getElementById('wifi-grid');
const wifiFlag = document.getElementById('wifi-flag');
const wifiSsid = document.getElementById('wifi-ssid');
const wifiPass = document.getElementById('wifi-pass');
const wifiEncryption = document.getElementById('wifi-encryption');

function parsePayload(data) {
    if (data.startsWith('http://') || data.startsWith('https://')) {
        resRaw.innerHTML = `<a href="${data}" target="_blank" class="text-green-300 hover:text-green-100 underline">${data}</a>`;
        resType.textContent = 'URL';
    } else {
        resRaw.textContent = data;
        resType.textContent = data.startsWith("WIFI:") ? 'WIFI_CONFIG' : 'TEXT';
    }

    if (data.startsWith("WIFI:")) {
        wifiGrid.classList.remove('hidden');
        wifiFlag.classList.remove('hidden');

        const ssid = data.match(/S:([^;]+);/)?.[1] || '---';
        const pass = data.match(/P:([^;]+);/)?.[1] || '---';
        const type = data.match(/T:([^;]+);/)?.[1] || '---';

        wifiSsid.textContent = ssid;
        wifiPass.textContent = pass;
        wifiEncryption.textContent = type;
    } else {
        wifiGrid.classList.add('hidden');
        wifiFlag.classList.add('hidden');
    }
}

fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset UI for new scan
    outputContainer.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    noResult.classList.add('hidden');
    statusBadge.textContent = "Scanning";
    statusBadge.className = "px-2 py-0.5 border border-yellow-600 text-yellow-500 text-[9px] uppercase";

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            imgContainer.classList.remove('hidden');
            imgContainer.classList.remove('animating');

            const scale = Math.min(600 / img.width, 400 / img.height, 1);
            previewCanvas.width = img.width * scale;
            previewCanvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

            const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            // Trigger visual scan animation
            void imgContainer.offsetWidth; // Trigger reflow
            imgContainer.classList.add('animating');

            // Delay result until animation finishes (1.5s)
            setTimeout(() => {
                loadingSpinner.classList.add('hidden');
                if (code) {
                    parsePayload(code.data);
                    outputContainer.classList.remove('hidden');
                    statusBadge.textContent = "Success";
                    statusBadge.className = "px-2 py-0.5 border border-green-500 text-green-500 text-[9px] uppercase";

                    // Highlight box on canvas
                    ctx.strokeStyle = '#00ff41';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                    ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                    ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                    ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                    ctx.closePath();
                    ctx.stroke();
                } else {
                    statusBadge.textContent = "Error";
                    statusBadge.className = "px-2 py-0.5 border border-red-900 text-red-500 text-[9px] uppercase";
                    noResult.classList.remove('hidden');
                    awaitingText.innerHTML = '<span class="text-red-500">FAILED_TO_DECODE_PATTERN</span>';
                }
            }, 1500);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', () => {
    // Reset file input
    fileInput.value = '';
    // Hide image preview
    imgContainer.classList.add('hidden');
    // Reset output
    outputContainer.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    noResult.classList.remove('hidden');
    awaitingText.textContent = "Awaiting input...";
    statusBadge.textContent = "Waiting";
    statusBadge.className = "px-2 py-0.5 border border-green-900 text-[9px] uppercase";
    // Clear canvas
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
});

document.getElementById('copy-btn').addEventListener('click', () => {
    const text = resRaw.textContent;
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    const originalText = document.getElementById('copy-btn').textContent;
    document.getElementById('copy-btn').textContent = "COPIED";
    setTimeout(() => {
        document.getElementById('copy-btn').textContent = originalText;
    }, 1000);
});

// Camera functionality
cameraBtn.addEventListener('click', async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        cameraVideo.srcObject = cameraStream;
        cameraContainer.classList.remove('hidden');
        isCameraActive = true;
        uploadArea.classList.add('hidden');
    } catch (err) {
        console.error('Camera access denied:', err);
        alert('Camera access denied. Please allow camera permissions.');
    }
});

closeCameraBtn.addEventListener('click', () => {
    stopCamera();
});

captureBtn.addEventListener('click', () => {
    if (!isCameraActive) return;
    
    // Pause video and capture frame
    cameraVideo.pause();
    
    // Set canvas to video dimensions
    previewCanvas.width = cameraVideo.videoWidth;
    previewCanvas.height = cameraVideo.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(cameraVideo, 0, 0);
    
    // Process the captured frame
    processCanvas();
    
    // Stop camera
    stopCamera();
    
    // Show image container
    imgContainer.classList.remove('hidden');
    imgContainer.classList.remove('animating');
});

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraContainer.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    isCameraActive = false;
}

function processCanvas() {
    const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    loadingSpinner.classList.add('hidden');
    if (code) {
        parsePayload(code.data);
        outputContainer.classList.remove('hidden');
        statusBadge.textContent = "Success";
        statusBadge.className = "px-2 py-0.5 border border-green-500 text-green-500 text-[9px] uppercase";
        
        // Highlight box on canvas
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
        ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
        ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
        ctx.closePath();
        ctx.stroke();
    } else {
        statusBadge.textContent = "Error";
        statusBadge.className = "px-2 py-0.5 border border-red-900 text-red-500 text-[9px] uppercase";
        noResult.classList.remove('hidden');
        awaitingText.innerHTML = '<span class="text-red-500">FAILED_TO_DECODE_PATTERN</span>';
    }
}