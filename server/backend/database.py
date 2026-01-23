"""
Database models and setup for CogniWave
SQLite database with SQLAlchemy ORM
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database setup
DATABASE_URL = "sqlite:///./cogniwave.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models

class Doctor(Base):
    """Doctor/User authentication and profile"""
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    specialization = Column(String)
    license_number = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    reports = relationship("AnalysisReport", back_populates="doctor")

class Patient(Base):
    """Patient information"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    contact_number = Column(String)
    email = Column(String)
    medical_history = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reports = relationship("AnalysisReport", back_populates="patient")

class AnalysisReport(Base):
    """Patient analysis reports with all data"""
    __tablename__ = "analysis_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)  # Optional when auth is disabled
    
    # Vital signs data
    heart_rate = Column(Float)
    bp_systolic = Column(Float)
    bp_diastolic = Column(Float)
    temperature = Column(Float)
    oxygen_saturation = Column(Float)
    
    # Analysis results (JSON strings)
    ecg_analysis = Column(Text)
    emotion_analysis = Column(Text)
    overall_summary = Column(Text)
    
    # Risk assessment
    priority_level = Column(String)  # low, medium, high
    risk_score = Column(Float)
    requires_attention = Column(Boolean, default=False)
    
    # Report generation
    groq_report = Column(Text)  # Generated medical report text
    pdf_filename = Column(String)  # Path to PDF file
    
    # Metadata
    symptoms = Column(Text)  # JSON array
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="reports")
    doctor = relationship("Doctor", back_populates="reports")

# Database initialization
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create reports directory
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
