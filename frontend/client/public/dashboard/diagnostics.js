/**
 * Diagnostics Page - Backend API Integration with Authentication
 * Integrates with FastAPI backend for multimodal patient analysis
 */

// Backend API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = `${API_BASE_URL}/api/v1/analysis/patient`;

// Global state
let cameraStream = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingStartTime = null;

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const startCameraBtn = document.getElementById('startCameraBtn');
const startMicBtn = document.getElementById('startMicBtn');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const micStatus = document.getElementById('micStatus');
const audioVisualizer = document.getElementById('audioVisualizer');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    drawECGPreview();
    setupEventListeners();
    checkBackendHealth();
});

// Setup event listeners
function setupEventListeners() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    startCameraBtn.addEventListener('click', toggleCamera);
    startMicBtn.addEventListener('click', toggleMicrophone);
    
    // Update ECG preview when checkbox changes
    document.getElementById('useECG').addEventListener('change', drawECGPreview);
}

// Check backend health
async function checkBackendHealth() {
    try {
        console.log('Checking backend at:', `${API_BASE_URL}/api/v1/health/`);
        const response = await fetch(`${API_BASE_URL}/api/v1/health/`);
        console.log('Health check response:', response);
        const data = await response.json();
        console.log('Backend health:', data);
        
        if (data.status === 'healthy') {
            showNotification('Backend connected successfully', 'success');
        }
    } catch (error) {
        console.error('Backend connection error:', error);
        showNotification('Backend not available. Make sure it\'s running on port 8000.', 'error');
    }
}

// Generate mock ECG data
function generateMockECG(duration = 10, sampleRate = 100) {
    const samples = duration * sampleRate;
    const ecgData = [];
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        // Simulate ECG waveform (simplified)
        const ecg = Math.sin(2 * Math.PI * 1.2 * t) * 0.3 + 
                   Math.sin(2 * Math.PI * 0.2 * t) * 0.1 +
                   Math.random() * 0.05;
        ecgData.push(parseFloat(ecg.toFixed(4)));
    }
    
    return ecgData;
}

// Draw ECG preview
function drawECGPreview() {
    const canvas = document.getElementById('ecgCanvas');
    const ctx = canvas.getContext('2d');
    const useECG = document.getElementById('useECG').checked;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!useECG) {
        // Draw straight line when ECG is not enabled
        ctx.strokeStyle = '#7A5AF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Add "Not Detected" text
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Not Detected', canvas.width / 2, canvas.height / 2 + 30);
    } else {
        // Draw normal ECG waveform
        const ecgData = generateMockECG(5, 50); // 5 seconds, 50Hz for preview
        
        ctx.strokeStyle = '#7A5AF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        ecgData.forEach((value, index) => {
            const x = (index / ecgData.length) * canvas.width;
            const y = canvas.height / 2 - (value * canvas.height / 2);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
}

// Toggle camera
async function toggleCamera() {
    if (cameraStream) {
        // Stop camera
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraVideo.classList.add('hidden');
        cameraPlaceholder.classList.remove('hidden');
        startCameraBtn.textContent = 'Start';
        startCameraBtn.classList.remove('bg-red-500');
        startCameraBtn.classList.add('bg-primary');
    } else {
        // Start camera
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            cameraVideo.srcObject = cameraStream;
            cameraVideo.classList.remove('hidden');
            cameraPlaceholder.classList.add('hidden');
            startCameraBtn.textContent = 'Stop';
            startCameraBtn.classList.remove('bg-primary');
            startCameraBtn.classList.add('bg-red-500');
            showNotification('Camera started', 'success');
        } catch (error) {
            console.error('Camera error:', error);
            showNotification('Camera access denied. Please grant permission.', 'error');
        }
    }
}

// Capture frame from camera
function captureFrame() {
    console.log('captureFrame called - cameraStream:', !!cameraStream);
    if (!cameraStream) {
        console.warn('Cannot capture frame: cameraStream is null');
        return null;
    }
    
    const canvas = cameraCanvas;
    canvas.width = cameraVideo.videoWidth || 640;
    canvas.height = cameraVideo.videoHeight || 480;
    
    console.log('Canvas dimensions:', canvas.width, canvas.height);
    console.log('Video dimensions:', cameraVideo.videoWidth, cameraVideo.videoHeight);
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image captured, data length:', imageData.length);
    return imageData;
}

// Toggle microphone
async function toggleMicrophone() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop recording
        mediaRecorder.stop();
        clearInterval(recordingInterval);
        startMicBtn.textContent = 'Record';
        startMicBtn.classList.remove('bg-red-500');
        startMicBtn.classList.add('bg-primary');
    } else {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            recordingStartTime = Date.now();
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.start();
            startMicBtn.textContent = 'Stop';
            startMicBtn.classList.remove('bg-primary');
            startMicBtn.classList.add('bg-red-500');
            
            // Update recording time
            recordingInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                document.getElementById('recordingTime').textContent = `${elapsed}s`;
            }, 1000);
            
            // Update mic status
            micStatus.innerHTML = `
                <i class="fas fa-microphone text-red-500 text-3xl mb-2 animate-pulse"></i>
                <p class="text-sm text-red-500">Recording...</p>
            `;
            
            showNotification('Recording started', 'success');
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 10000);
            
        } catch (error) {
            console.error('Microphone error:', error);
            showNotification('Microphone access denied. Please grant permission.', 'error');
        }
    }
}

// Get audio as base64
function getAudioBase64() {
    return new Promise((resolve) => {
        if (!mediaRecorder || audioChunks.length === 0) {
            resolve(null);
            return;
        }
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
            resolve(reader.result);
        };
        
        reader.readAsDataURL(audioBlob);
    });
}

// Main analysis function
async function handleAnalyze() {
    // Disable button
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...';
    
    // Show loading card
    document.getElementById('initialCard').classList.add('hidden');
    document.getElementById('resultsCard').classList.add('hidden');
    document.getElementById('loadingCard').classList.remove('hidden');
    
    // Track whether camera/mic were actually used
    let cameraUsed = false;
    let micUsed = false;
    
    try {
        // Gather input data - matching backend schema
        const patientId = document.getElementById('patientId').value || 'PT-001';
        const patientName = document.getElementById('patientName').value || null;
        const sessionId = document.getElementById('sessionId').value || `SESSION-${Date.now()}`;
        
        const requestData = {
            patient_metadata: {
                patient_id: patientId,
                full_name: patientName,
                age: 65,
                gender: "unknown"
            },
            physiological_data: {
                heart_rate: parseInt(document.getElementById('heartRate').value),
                blood_pressure_systolic: parseInt(document.getElementById('bpSystolic').value),
                blood_pressure_diastolic: parseInt(document.getElementById('bpDiastolic').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                oxygen_saturation: parseInt(document.getElementById('spo2').value)
            },
            behavioral_data: {},
            symptoms: [],
            report_type: "summary",
            audience: "clinician"
        };
        
        // Add ECG data if enabled
        if (document.getElementById('useECG').checked) {
            document.getElementById('loadingProgress').textContent = 'Generating ECG data...';
            requestData.physiological_data.ecg_data = generateMockECG();
        }
        
        // Add camera image if enabled and capture it BEFORE stopping
        const useCameraChecked = document.getElementById('useCamera').checked;
        console.log('useCamera checked:', useCameraChecked);
        console.log('cameraStream exists:', !!cameraStream);
        
        if (useCameraChecked) {
            if (!cameraStream) {
                showNotification('Camera is not started! Please click the Start button under Camera.', 'error');
                console.error('Camera checkbox is checked but camera stream is not active');
            } else {
                document.getElementById('loadingProgress').textContent = 'Capturing camera frame...';
                const imageBase64 = captureFrame();
                console.log('Image captured:', imageBase64 ? 'YES' : 'NO');
                if (imageBase64) {
                    requestData.behavioral_data.image_data = imageBase64;
                    cameraUsed = true;
                    console.log('Image added to request, length:', imageBase64.length);
                } else {
                    console.error('Failed to capture image from camera');
                }
            }
        }
        
        // Add audio if enabled and available BEFORE stopping
        const useMicChecked = document.getElementById('useMicrophone').checked;
        console.log('useMicrophone checked:', useMicChecked);
        console.log('audioChunks length:', audioChunks.length);
        
        if (useMicChecked) {
            if (audioChunks.length === 0) {
                showNotification('Microphone has no recording! Please record audio first.', 'error');
                console.error('Microphone checkbox is checked but no audio recorded');
            } else {
                document.getElementById('loadingProgress').textContent = 'Processing audio...';
                const audioBase64 = await getAudioBase64();
                console.log('Audio captured:', audioBase64 ? 'YES' : 'NO');
                if (audioBase64) {
                    requestData.behavioral_data.audio_data = audioBase64;
                    micUsed = true;
                    console.log('Audio added to request, length:', audioBase64.length);
                } else {
                    console.error('Failed to get audio data');
                }
            }
        }
        
        // Stop camera and microphone automatically after capturing data
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            cameraVideo.classList.add('hidden');
            cameraPlaceholder.classList.remove('hidden');
            startCameraBtn.textContent = 'Start';
            startCameraBtn.classList.remove('bg-red-500');
            startCameraBtn.classList.add('bg-primary');
        }
        
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            clearInterval(recordingInterval);
            startMicBtn.textContent = 'Record';
            startMicBtn.classList.remove('bg-red-500');
            startMicBtn.classList.add('bg-primary');
            micStatus.innerHTML = `
                <i class="fas fa-microphone-slash text-3xl mb-2 text-gray-400"></i>
                <p class="text-sm text-gray-400">Not recording</p>
            `;
        }
        
        // Add text data if microphone was used
        if (audioChunks.length > 0) {
            requestData.behavioral_data.text_data = "Patient audio recorded for analysis";
        }
        
        document.getElementById('loadingProgress').textContent = 'Sending to backend...';
        
        console.log('=== SENDING REQUEST TO BACKEND ===');
        console.log('Endpoint:', API_ENDPOINT);
        console.log('Request Data:', requestData);
        
        // Call backend API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.detail || errorData.error || 'Analysis failed');
        }
        
        const result = await response.json();
        console.log('Analysis result:', result);
        
        // Check for PDF URL and add download button
        if (result.pdf_url) {
            console.log('PDF available at:', result.pdf_url);
        }
        
        // Display results (pass flags for what was used)
        displayResults(result, sessionId, cameraUsed, micUsed);
        
        showNotification('Analysis complete!', 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        document.getElementById('loadingCard').classList.add('hidden');
        document.getElementById('initialCard').classList.remove('hidden');
    } finally {
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-brain mr-2"></i> Analyze Patient';
    }
}

// Display analysis results
function displayResults(result, sessionId, cameraUsed = false, micUsed = false) {
    // Hide loading, show results
    document.getElementById('loadingCard').classList.add('hidden');
    document.getElementById('resultsCard').classList.remove('hidden');
    
    // Extract summary data from backend response
    const summary = result.summary || {};
    let agentResults = result.agent_results || {};
    
    // Filter out facial/audio agents if not used
    if (!cameraUsed) {
        // Remove any facial/emotion/image analysis agents
        agentResults = Object.fromEntries(
            Object.entries(agentResults).filter(([key]) => 
                !key.toLowerCase().includes('facial') && 
                !key.toLowerCase().includes('emotion') &&
                !key.toLowerCase().includes('image')
            )
        );
    }
    
    if (!micUsed) {
        // Remove any audio/voice analysis agents
        agentResults = Object.fromEntries(
            Object.entries(agentResults).filter(([key]) => 
                !key.toLowerCase().includes('audio') && 
                !key.toLowerCase().includes('voice') &&
                !key.toLowerCase().includes('speech')
            )
        );
    }
    
    // Risk level with color coding (map from backend priority_level)
    const priorityLevel = summary.priority_level || 'ROUTINE';
    const riskMapping = {
        'urgent': 'HIGH',
        'high': 'HIGH',
        'medium': 'MODERATE',
        'low': 'LOW',
        'routine': 'LOW'
    };
    const riskLevel = riskMapping[priorityLevel.toLowerCase()] || 'LOW';
    
    const riskColors = {
        'LOW': { bg: 'bg-green-100', text: 'text-green-600' },
        'MODERATE': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        'HIGH': { bg: 'bg-red-100', text: 'text-red-600' }
    };
    
    const colors = riskColors[riskLevel] || riskColors['LOW'];
    const riskDiv = document.getElementById('riskLevel');
    riskDiv.className = `mb-6 text-center p-6 rounded-2xl ${colors.bg}`;
    document.getElementById('riskValue').className = `text-4xl font-bold mb-2 ${colors.text}`;
    document.getElementById('riskValue').textContent = riskLevel;
    
    // Confidence (aggregate from agents)
    let avgConfidence = 0;
    const confidenceValues = Object.values(agentResults)
        .filter(agent => agent.confidence !== null && agent.confidence !== undefined)
        .map(agent => agent.confidence);
    
    if (confidenceValues.length > 0) {
        avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
    }
    
    document.getElementById('riskConfidence').textContent = `Confidence: ${(avgConfidence * 100).toFixed(1)}%`;
    
    // Clinical summary from overall status
    const clinicalSummary = summary.overall_status || 'Analysis completed successfully.';
    document.getElementById('clinicalSummary').textContent = clinicalSummary;
    
    // Assessment - combine priority info
    const requiresAttention = summary.requires_immediate_attention ? 
        'Requires immediate clinical attention.' : 
        'No immediate attention required at this time.';
    document.getElementById('clinicalAssessment').textContent = 
        `Priority Level: ${priorityLevel.toUpperCase()}. ${requiresAttention}`;
    
    // Contributing signals from agent findings
    const signalsDiv = document.getElementById('contributingSignals');
    const signals = [];
    
    // Extract findings from each agent
    Object.entries(agentResults).forEach(([agentName, agentData]) => {
        if (agentData.findings) {
            // Extract classification if available
            if (agentData.findings.classification) {
                signals.push(`${agentName}: ${agentData.findings.classification}`);
            }
            // Extract risk indicators
            if (agentData.findings.risk_indicators && Array.isArray(agentData.findings.risk_indicators)) {
                agentData.findings.risk_indicators.forEach(indicator => {
                    signals.push(`${agentName}: ${indicator}`);
                });
            }
            // Extract abnormalities
            if (agentData.findings.abnormalities_detected && Array.isArray(agentData.findings.abnormalities_detected)) {
                agentData.findings.abnormalities_detected.forEach(abnormality => {
                    signals.push(`${agentName}: ${abnormality}`);
                });
            }
        }
    });
    
    if (signals.length > 0) {
        signalsDiv.innerHTML = signals.map(signal => `
            <div class="flex items-start bg-gray-50 p-3 rounded-lg">
                <i class="fas fa-check-circle text-primary mt-1 mr-2"></i>
                <span class="text-sm text-gray-700">${signal}</span>
            </div>
        `).join('');
    } else {
        signalsDiv.innerHTML = '<p class="text-sm text-gray-500">No specific signals detected</p>';
    }
    
    // LLM explanation (check if reporting agent has explanation)
    const reportingAgent = agentResults['explanation_reporting_agent'] || agentResults['reporting_agent'];
    if (reportingAgent && reportingAgent.findings && reportingAgent.findings.report) {
        document.getElementById('llmExplanation').classList.remove('hidden');
        document.getElementById('llmExplanationText').textContent = reportingAgent.findings.report;
    } else {
        document.getElementById('llmExplanation').classList.add('hidden');
    }
    
    // Metadata
    document.getElementById('resultSessionId').textContent = result.analysis_id || sessionId || '-';
    document.getElementById('resultTimestamp').textContent = 
        result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString();
    
    // Agent trace
    displayAgentTrace(agentResults);
}

// Display agent trace
function displayAgentTrace(agentResults) {
    if (!agentResults || Object.keys(agentResults).length === 0) {
        return;
    }
    
    document.getElementById('agentTraceCard').classList.remove('hidden');
    const traceDiv = document.getElementById('agentTraceContent');
    
    traceDiv.innerHTML = Object.entries(agentResults).map(([agentId, agentData]) => {
        const duration = agentData.processing_time_ms 
            ? (agentData.processing_time_ms / 1000).toFixed(2)
            : '-';
        
        const statusIcon = agentData.status === 'success' 
            ? '<i class="fas fa-check-circle text-green-500"></i>'
            : '<i class="fas fa-exclamation-circle text-red-500"></i>';
        
        const confidence = agentData.confidence !== null && agentData.confidence !== undefined
            ? `<div>Confidence: ${(agentData.confidence * 100).toFixed(1)}%</div>`
            : '';
        
        return `
            <div class="bg-gray-50 p-3 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-sm text-gray-800">${agentData.agent_name || agentId}</span>
                    ${statusIcon}
                </div>
                <div class="text-xs text-gray-600 space-y-1">
                    <div>Duration: ${duration}s</div>
                    ${confidence}
                    ${agentData.error ? `<div class="text-red-500">Error: ${agentData.error}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
