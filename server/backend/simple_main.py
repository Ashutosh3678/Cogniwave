"""
Minimal CogniWave Backend
Simplified version with 2 agents: ECG Analysis + Emotion Detection
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import traceback

# Import agents
from simple_agents import ECGAgent, EmotionAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="CogniWave Minimal API",
    description="Simplified multimodal patient analysis with ECG and Emotion agents",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Initialize agents
ecg_agent = ECGAgent()
emotion_agent = EmotionAgent()

# ==================== Data Models ====================

class PatientMetadata(BaseModel):
    patient_id: str
    age: Optional[int] = None
    gender: Optional[str] = None

class PhysiologicalData(BaseModel):
    ecg_data: Optional[List[float]] = None
    heart_rate: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None

class BehavioralData(BaseModel):
    image_data: Optional[str] = None  # base64
    audio_data: Optional[str] = None  # base64
    text_data: Optional[str] = None

class AnalysisRequest(BaseModel):
    patient_metadata: PatientMetadata
    physiological_data: Optional[PhysiologicalData] = None
    behavioral_data: Optional[BehavioralData] = None
    symptoms: Optional[List[str]] = []
    report_type: str = "summary"
    audience: str = "clinician"

# ==================== Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "CogniWave Minimal API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/v1/health/",
            "analysis": "/api/v1/analysis/patient"
        }
    }

@app.get("/api/v1/health/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "agents": {
            "ecg_agent": "ready",
            "emotion_agent": "ready"
        }
    }

@app.post("/api/v1/analysis/patient")
async def analyze_patient(request: AnalysisRequest):
    """
    Analyze patient data using ECG and Emotion agents
    """
    try:
        start_time = datetime.utcnow()
        analysis_id = f"ANALYSIS-{int(start_time.timestamp() * 1000)}"
        
        logger.info(f"Starting analysis {analysis_id} for patient {request.patient_metadata.patient_id}")
        logger.info(f"Request data: physiological={request.physiological_data is not None}, behavioral={request.behavioral_data is not None}")
        
        results = {
            "analysis_id": analysis_id,
            "status": "success",
            "timestamp": start_time.isoformat(),
            "agent_results": {},
            "summary": {}
        }
        
        # Run ECG Agent (Model 1) - Handles vital signs/ECG data
        if request.physiological_data:
            logger.info("→ Sending vital signs to ECG Agent (ecg_model.pt)")
            ecg_result = await ecg_agent.analyze(request.physiological_data)
            results["agent_results"]["ecg_agent"] = ecg_result
            logger.info(f"✓ ECG Agent completed: {ecg_result.get('status')}")
        
        # Run Emotion Agent (Model 2) - Handles camera/audio data
        if request.behavioral_data:
            logger.info("→ Sending camera/audio to Emotion Agent (emotion_model.pth)")
            emotion_result = await emotion_agent.analyze(request.behavioral_data)
            results["agent_results"]["emotion_agent"] = emotion_result
            logger.info(f"✓ Emotion Agent completed: {emotion_result.get('status')}")
        
        # Generate summary
        results["summary"] = generate_summary(results["agent_results"])
        
        # Calculate total time
        end_time = datetime.utcnow()
        results["total_processing_time_ms"] = (end_time - start_time).total_seconds() * 1000
        
        logger.info(f"Analysis {analysis_id} completed successfully")
        return results
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def generate_summary(agent_results: Dict) -> Dict:
    """Generate overall summary from agent results"""
    
    # Default values
    priority_level = "low"
    overall_status = "Normal parameters"
    requires_attention = False
    
    # Check ECG results
    ecg_result = agent_results.get("ecg_agent", {})
    if ecg_result.get("status") == "success":
        ecg_risk = ecg_result.get("findings", {}).get("risk_level", "low")
        if ecg_risk == "high":
            priority_level = "high"
            requires_attention = True
            overall_status = "Abnormal physiological parameters detected"
        elif ecg_risk == "medium":
            priority_level = "medium"
            overall_status = "Elevated physiological risk indicators"
    
    # Check Emotion results
    emotion_result = agent_results.get("emotion_agent", {})
    if emotion_result.get("status") == "success":
        emotion_risk = emotion_result.get("findings", {}).get("risk_level", "low")
        if emotion_risk == "high" and priority_level == "low":
            priority_level = "medium"
            overall_status = "Emotional distress indicators detected"
    
    return {
        "overall_status": overall_status,
        "priority_level": priority_level,
        "requires_immediate_attention": requires_attention
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("=" * 60)
    logger.info("CogniWave Minimal Backend Starting")
    logger.info("ECG Agent: Handles vital signs data → ecg_model.pt")
    logger.info("Emotion Agent: Handles camera/audio data → emotion_model.pth")  
    logger.info("Server: http://0.0.0.0:8000")
    logger.info("=" * 60)
    uvicorn.run("simple_main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
