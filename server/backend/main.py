"""
CogniWave Complete Backend - Database + Auth + Groq + PDF
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import traceback
import json
import os

# Import modules
from simple_agents import ECGAgent, EmotionAgent
from database import init_db, get_db, Doctor, Patient, AnalysisReport, REPORTS_DIR
from auth import get_password_hash, authenticate_doctor, create_access_token, get_current_doctor
from groq_service import generate_medical_report
from pdf_generator import generate_pdf_report

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CogniWave API v2.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    init_db()
    logger.info("✓ Database initialized")

ecg_agent = ECGAgent()
emotion_agent = EmotionAgent()

# ===== Models =====
class DoctorRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    specialization: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    doctor: dict

class PatientMetadata(BaseModel):
    patient_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    full_name: Optional[str] = None

class PhysiologicalData(BaseModel):
    ecg_data: Optional[List[float]] = None
    heart_rate: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None

class BehavioralData(BaseModel):
    image_data: Optional[str] = None
    audio_data: Optional[str] = None
    text_data: Optional[str] = None

class AnalysisRequest(BaseModel):
    patient_metadata: PatientMetadata
    physiological_data: Optional[PhysiologicalData] = None
    behavioral_data: Optional[BehavioralData] = None
    symptoms: Optional[List[str]] = []
    notes: Optional[str] = None

# ===== Auth Endpoints =====
@app.post("/api/v1/auth/register", response_model=Token, tags=["Auth"])
async def register(data: DoctorRegister, db: Session = Depends(get_db)):
    if db.query(Doctor).filter(Doctor.username == data.username).first():
        raise HTTPException(400, "Username exists")
    doctor = Doctor(username=data.username, email=data.email, hashed_password=get_password_hash(data.password),
                   full_name=data.full_name, specialization=data.specialization)
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    token = create_access_token({"sub": doctor.username})
    logger.info(f"✓ Registered: {doctor.username}")
    return {"access_token": token, "token_type": "bearer", 
            "doctor": {"id": doctor.id, "username": doctor.username, "email": doctor.email, "full_name": doctor.full_name}}

@app.post("/api/v1/auth/login", response_model=Token, tags=["Auth"])
async def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    doctor = authenticate_doctor(db, form.username, form.password)
    if not doctor:
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": doctor.username})
    logger.info(f"✓ Login: {doctor.username}")
    return {"access_token": token, "token_type": "bearer",
            "doctor": {"id": doctor.id, "username": doctor.username, "email": doctor.email, "full_name": doctor.full_name}}

@app.get("/api/v1/auth/me", tags=["Auth"])
async def me(doctor: Doctor = Depends(get_current_doctor)):
    return {"id": doctor.id, "username": doctor.username, "email": doctor.email, "full_name": doctor.full_name}

# ===== Analysis Endpoint =====
@app.post("/api/v1/analysis/patient", tags=["Analysis"])
async def analyze(req: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        start = datetime.utcnow()
        analysis_id = f"ANALYSIS-{int(start.timestamp() * 1000)}"
        logger.info(f"→ Analysis {analysis_id}")
        
        # Get/Create Patient
        patient = db.query(Patient).filter(Patient.patient_id == req.patient_metadata.patient_id).first()
        if not patient:
            patient = Patient(patient_id=req.patient_metadata.patient_id, full_name=req.patient_metadata.full_name,
                            age=req.patient_metadata.age, gender=req.patient_metadata.gender)
            db.add(patient)
            db.commit()
            db.refresh(patient)
        
        results = {"analysis_id": analysis_id, "status": "success", "agent_results": {}}
        
        # Run Agents
        if req.physiological_data:
            logger.info("  ECG Agent analyzing...")
            results["agent_results"]["ecg_agent"] = await ecg_agent.analyze(req.physiological_data)
        
        if req.behavioral_data:
            logger.info("  Emotion Agent analyzing...")
            results["agent_results"]["emotion_agent"] = await emotion_agent.analyze(req.behavioral_data)
        
        # Summary
        results["summary"] = generate_summary(results["agent_results"])
        
        # Groq Report
        report_data = {
            "patient_metadata": req.patient_metadata.dict(),
            "physiological_data": req.physiological_data.dict() if req.physiological_data else {},
            "ecg_analysis": results["agent_results"].get("ecg_agent", {}),
            "emotion_analysis": results["agent_results"].get("emotion_agent", {}),
            "summary": results["summary"]
        }
        
        try:
            logger.info("  Generating Groq report...")
            groq_report = generate_medical_report(report_data)
            results["groq_report"] = groq_report
            logger.info("  ✓ Groq report done")
        except Exception as e:
            logger.error(f"  ✗ Groq failed: {e}")
            groq_report = f"Report generation failed: {e}"
            results["groq_report"] = groq_report
        
        # PDF Generation
        pdf_filename = f"{analysis_id}.pdf"
        pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
        report_data["groq_report"] = groq_report
        report_data["analysis_id"] = analysis_id
        
        try:
            logger.info("  Generating PDF...")
            generate_pdf_report(report_data, pdf_path)
            results["pdf_url"] = f"/api/v1/reports/download/{pdf_filename}"
            logger.info("  ✓ PDF done")
        except Exception as e:
            logger.error(f"  ✗ PDF failed: {e}")
            results["pdf_url"] = None
            pdf_filename = None
        
        # Save to DB
        report = AnalysisReport(
            analysis_id=analysis_id, patient_id=patient.id, doctor_id=None,
            heart_rate=req.physiological_data.heart_rate if req.physiological_data else None,
            bp_systolic=req.physiological_data.blood_pressure_systolic if req.physiological_data else None,
            bp_diastolic=req.physiological_data.blood_pressure_diastolic if req.physiological_data else None,
            temperature=req.physiological_data.temperature if req.physiological_data else None,
            oxygen_saturation=req.physiological_data.oxygen_saturation if req.physiological_data else None,
            ecg_analysis=json.dumps(results["agent_results"].get("ecg_agent", {})),
            emotion_analysis=json.dumps(results["agent_results"].get("emotion_agent", {})),
            overall_summary=json.dumps(results["summary"]),
            priority_level=results["summary"].get("priority_level", "low"),
            requires_attention=results["summary"].get("requires_immediate_attention", False),
            groq_report=groq_report, pdf_filename=pdf_filename, 
            symptoms=json.dumps(req.symptoms) if req.symptoms else None, notes=req.notes
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        
        results["database_id"] = report.id
        results["total_processing_time_ms"] = (datetime.utcnow() - start).total_seconds() * 1000
        logger.info(f"✓ Analysis complete: {analysis_id} (DB ID: {report.id})")
        return results
        
    except Exception as e:
        logger.error(f"✗ Analysis failed: {e}\n{traceback.format_exc()}")
        raise HTTPException(500, f"Analysis failed: {e}")

# ===== Patient History =====
@app.get("/api/v1/patients/{patient_id}/history", tags=["Patients"])
async def history(patient_id: str, doctor: Doctor = Depends(get_current_doctor), db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    reports = db.query(AnalysisReport).filter(AnalysisReport.patient_id == patient.id).order_by(AnalysisReport.created_at.desc()).all()
    return {
        "patient": {"patient_id": patient.patient_id, "full_name": patient.full_name, "age": patient.age, "gender": patient.gender},
        "total_reports": len(reports),
        "reports": [{"id": r.id, "analysis_id": r.analysis_id, "created_at": r.created_at.isoformat(),
                    "priority_level": r.priority_level, "requires_attention": r.requires_attention,
                    "doctor": r.doctor.full_name, "pdf_available": r.pdf_filename is not None} for r in reports]
    }

@app.get("/api/v1/reports/{report_id}", tags=["Reports"])
async def get_report(report_id: int, doctor: Doctor = Depends(get_current_doctor), db: Session = Depends(get_db)):
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    return {
        "id": report.id, "analysis_id": report.analysis_id,
        "patient": {"patient_id": report.patient.patient_id, "full_name": report.patient.full_name, "age": report.patient.age, "gender": report.patient.gender},
        "doctor": {"full_name": report.doctor.full_name, "specialization": report.doctor.specialization},
        "vital_signs": {"heart_rate": report.heart_rate, "blood_pressure": f"{report.bp_systolic}/{report.bp_diastolic}" if report.bp_systolic else None,
                       "temperature": report.temperature, "oxygen_saturation": report.oxygen_saturation},
        "ecg_analysis": json.loads(report.ecg_analysis) if report.ecg_analysis else {},
        "emotion_analysis": json.loads(report.emotion_analysis) if report.emotion_analysis else {},
        "summary": json.loads(report.overall_summary) if report.overall_summary else {},
        "groq_report": report.groq_report, "priority_level": report.priority_level, "requires_attention": report.requires_attention,
        "created_at": report.created_at.isoformat(), "pdf_url": f"/api/v1/reports/download/{report.pdf_filename}" if report.pdf_filename else None
    }

@app.get("/api/v1/reports/download/{filename}", tags=["Reports"])
async def download_pdf(filename: str):
    pdf_path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(pdf_path):
        raise HTTPException(404, "PDF not found")
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)

# ===== Health =====
@app.get("/api/v1/health/", tags=["System"])
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat(),
            "agents": {"ecg_agent": "ready", "emotion_agent": "ready"},
            "features": {"auth": "enabled", "database": "enabled", "groq": "enabled", "pdf": "enabled"}}

def generate_summary(agent_results: Dict) -> Dict:
    priority = "low"
    status = "Normal parameters"
    attention = False
    
    ecg = agent_results.get("ecg_agent", {})
    if ecg.get("status") == "success":
        risk = ecg.get("findings", {}).get("risk_level", "low")
        if risk == "high":
            priority = "high"
            attention = True
            status = "Abnormal physiological parameters"
        elif risk == "medium":
            priority = "medium"
            status = "Elevated risk indicators"
    
    emotion = agent_results.get("emotion_agent", {})
    if emotion.get("status") == "success" and emotion.get("findings", {}).get("risk_level") == "high" and priority == "low":
        priority = "medium"
        status = "Emotional distress detected"
    
    return {"overall_status": status, "priority_level": priority, "requires_immediate_attention": attention}

if __name__ == "__main__":
    import uvicorn
    logger.info("=" * 60)
    logger.info("CogniWave Backend v2.0")
    logger.info("Auth + Database + Groq Reports + PDF Export")
    logger.info("=" * 60)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
