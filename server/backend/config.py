"""
Configuration Settings

Application configuration using Pydantic settings management.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """
    Application settings.
    
    Settings can be configured via environment variables or .env file.
    """
    
    # ============= Application Settings =============
    
    APP_NAME: str = "Agentic Multimodal Patient Understanding System"
    VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = """
    AI-powered multimodal patient monitoring and risk assessment system using specialized agents.
    
    **IMPORTANT:** This system does not provide medical diagnosis or treatment recommendations
    and is intended for clinical decision support only.
    
    ## Features
    
    - **Physiological Risk Assessment**: ECG signal analysis, vital signs pattern detection
    - **Behavioral & Emotional Signal Analysis**: Facial expression, speech, text cue extraction
    - **Signal Prioritization**: Conflict resolution and risk level assignment
    - **Decision Support Reporting**: Human-readable explanations for clinicians
    
    ## Architecture
    
    The system uses an agent-based architecture with:
    - Central Orchestrator for workflow coordination and conflict resolution
    - Specialized agents for signal extraction and risk assessment
    - Comprehensive tracing and logging for audit trails
    - Parallel and sequential execution strategies for efficiency
    
    ## Safety
    
    All outputs are early warning signals and risk assessments to assist healthcare
    professionals in prioritizing patient care. Final clinical decisions must always
    be made by qualified healthcare professionals.
    """
    
    ENVIRONMENT: str = "development"  # development, staging, production
    DEBUG: bool = True
    
    # ============= Server Settings =============
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # ============= CORS Settings =============
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ]
    
    # ============= Logging Settings =============
    
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    LOG_TO_FILE: bool = False
    LOG_DIR: str = "logs"
    
    # ============= API Settings =============
    
    ENABLE_DOCS: bool = True  # Enable Swagger/ReDoc documentation
    API_V1_PREFIX: str = "/api/v1"
    
    # ============= Agent Settings =============
    
    # Timeouts for agent execution (in seconds)
    AGENT_TIMEOUT: int = 30
    
    # Maximum number of parallel agent executions
    MAX_PARALLEL_AGENTS: int = 2
    
    # ============= Database Settings (Future Use) =============
    
    # DATABASE_URL: str = "sqlite:///./data/app.db"
    # Placeholder for future database integration
    
    # ============= ML Model Settings =============
    
    MODEL_DIR: str = "models"
    
    # ECG Model Configuration
    ECG_MODEL_PATH: str = os.getenv(
        "ECG_MODEL_PATH",
        "C:/OneDrive/Desktop/heal/Phycological_model/mimic_iv_ecg_physionet_pretrained.pt"
    )
    ECG_CONFIG_PATH: str = os.getenv(
        "ECG_CONFIG_PATH",
        "C:/OneDrive/Desktop/heal/Phycological_model/mimic_iv_ecg_physionet_pretrained.yaml"
    )
    
    # Emotion Model Configuration
    EMOTION_MODEL_DIR: str = os.getenv(
        "EMOTION_MODEL_DIR",
        "C:/OneDrive/Desktop/heal/emotion_model/Multimodal-Emotion-AI"
    )
    EMOTION_DATASET_CSV: str = os.getenv(
        "EMOTION_DATASET_CSV",
        "C:/OneDrive/Desktop/heal/emotion_model/Multimodal-Emotion-AI/results/image_data.csv"
    )
    
    # Face detection configuration
    FACE_CASCADE_PATH: str = os.getenv(
        "FACE_CASCADE_PATH",
        ""  # Will use OpenCV's built-in cascade if empty
    )
    
    # ============= LLM Settings (Phase 5) =============
    
    # LLM Provider (groq, openai)
    LLM_PROVIDER: str = "groq"
    
    # Groq API Key
    GROQ_API_KEY: str = ""
    
    # LLM Model
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    
    # OpenAI API Key (fallback)
    OPENAI_API_KEY: str = ""
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env


# Create settings instance
settings = Settings()


# Create necessary directories
def create_directories():
    """Create necessary directories for the application."""
    directories = [
        settings.LOG_DIR,
        # Add more directories as needed
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)


# Initialize directories
create_directories()
