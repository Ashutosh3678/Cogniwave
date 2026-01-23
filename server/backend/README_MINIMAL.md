# CogniWave Minimal Backend

Simplified backend with 2 AI agents for patient analysis.

## Structure

```
backend/
├── simple_main.py          # Main FastAPI application
├── simple_agents.py        # ECG and Emotion agents
├── model_files/            # AI model files
│   ├── ecg_model.pt       # ECG analysis model
│   └── emotion_model.pth  # Emotion detection model
├── config.py              # Configuration (optional)
├── requirements_minimal.txt
├── start_minimal.bat      # Quick start script
└── venv/                  # Virtual environment
```

## Agents

### 1. ECG Agent
- Analyzes ECG signals and vital signs
- Detects abnormalities in heart rate, blood pressure, temperature, SpO2
- Risk assessment: low/medium/high

### 2. Emotion Agent
- Analyzes facial expressions from camera
- Processes audio for stress detection
- Sentiment analysis from text
- Detects emotional distress indicators

## Quick Start

### Option 1: Using Batch File
```bash
start_minimal.bat
```

### Option 2: Manual Start
```bash
# Activate virtual environment
venv\Scripts\activate

# Run server
python simple_main.py
```

Server will start on: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /api/v1/health/
```

### Patient Analysis
```
POST /api/v1/analysis/patient
```

**Request Body:**
```json
{
  "patient_metadata": {
    "patient_id": "PT-001",
    "age": 65,
    "gender": "male"
  },
  "physiological_data": {
    "heart_rate": 75,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "temperature": 36.8,
    "oxygen_saturation": 98,
    "ecg_data": [...]  // optional ECG signal array
  },
  "behavioral_data": {
    "image_data": "base64...",  // optional camera image
    "audio_data": "base64...",  // optional audio
    "text_data": "patient notes"  // optional
  }
}
```

**Response:**
```json
{
  "analysis_id": "ANALYSIS-123456",
  "status": "success",
  "timestamp": "2026-01-23T...",
  "agent_results": {
    "ecg_agent": {
      "status": "success",
      "findings": {
        "risk_level": "low",
        "risk_indicators": [...],
        "classification": "Risk Level: LOW"
      },
      "confidence": 0.85
    },
    "emotion_agent": {
      "status": "success",
      "findings": {
        "risk_level": "low",
        "risk_indicators": [...],
        "facial_analysis": {...}
      },
      "confidence": 0.80
    }
  },
  "summary": {
    "overall_status": "Normal parameters",
    "priority_level": "low",
    "requires_immediate_attention": false
  },
  "total_processing_time_ms": 245.5
}
```

## Frontend Integration

The frontend at `http://localhost:5173` sends patient data to this backend.

The diagnostics page already configured to work with these endpoints.

## Model Files

Place your trained models in `model_files/`:
- `ecg_model.pt` - ECG analysis model
- `emotion_model.pth` - Emotion detection model

Models are loaded automatically on startup. If models are missing, the system uses intelligent mock analysis.

## Notes

- Models run in CPU mode (change in simple_agents.py for GPU)
- CORS enabled for localhost:5173 and localhost:3000
- All analysis is async and non-blocking
- Comprehensive error handling and logging
