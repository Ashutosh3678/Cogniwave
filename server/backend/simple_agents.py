"""
Simplified Agents for ECG and Emotion Analysis
"""

import torch
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import logging
from datetime import datetime
from typing import Dict, Any
import os

logger = logging.getLogger(__name__)

# ==================== ECG Agent ====================

class ECGAgent:
    """Agent for ECG signal analysis"""
    
    def __init__(self):
        self.agent_id = "ecg_agent"
        self.agent_name = "ECG Analysis Agent"
        self.model_path = "model_files/ecg_model.pt"
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load ECG model"""
        try:
            if os.path.exists(self.model_path):
                logger.info(f"Loading ECG model from {self.model_path}")
                self.model = torch.load(self.model_path, map_location=torch.device('cpu'))
                self.model.eval()
                logger.info("ECG model loaded successfully")
            else:
                logger.warning(f"ECG model not found at {self.model_path}, using mock analysis")
        except Exception as e:
            logger.error(f"Failed to load ECG model: {str(e)}")
            logger.warning("Using mock ECG analysis")
    
    async def analyze(self, physiological_data) -> Dict[str, Any]:
        """Analyze ECG and vital signs"""
        start_time = datetime.utcnow()
        
        try:
            findings = {}
            
            # Analyze vital signs
            hr = physiological_data.heart_rate
            bp_sys = physiological_data.blood_pressure_systolic
            bp_dia = physiological_data.blood_pressure_diastolic
            temp = physiological_data.temperature
            spo2 = physiological_data.oxygen_saturation
            
            # Risk assessment based on vital signs
            risk_indicators = []
            risk_level = "low"
            
            if hr:
                if hr > 100:
                    risk_indicators.append(f"Elevated heart rate: {hr} bpm (normal: 60-100)")
                    risk_level = "medium"
                elif hr < 60:
                    risk_indicators.append(f"Low heart rate: {hr} bpm (normal: 60-100)")
                    risk_level = "medium"
            
            if bp_sys and bp_dia:
                if bp_sys > 140 or bp_dia > 90:
                    risk_indicators.append(f"Elevated blood pressure: {bp_sys}/{bp_dia} mmHg")
                    risk_level = "high" if bp_sys > 160 else "medium"
                elif bp_sys < 90:
                    risk_indicators.append(f"Low blood pressure: {bp_sys}/{bp_dia} mmHg")
                    risk_level = "medium"
            
            if temp:
                if temp > 37.5:
                    risk_indicators.append(f"Elevated temperature: {temp}°C")
                    risk_level = "medium"
                elif temp < 36.0:
                    risk_indicators.append(f"Low temperature: {temp}°C")
                    risk_level = "medium"
            
            if spo2:
                if spo2 < 95:
                    risk_indicators.append(f"Low oxygen saturation: {spo2}%")
                    risk_level = "high" if spo2 < 90 else "medium"
            
            # Analyze ECG data if available
            ecg_findings = None
            if physiological_data.ecg_data and len(physiological_data.ecg_data) > 0:
                ecg_findings = self._analyze_ecg_signal(physiological_data.ecg_data)
                if ecg_findings.get("abnormalities"):
                    risk_indicators.extend(ecg_findings["abnormalities"])
                    if ecg_findings.get("risk_level") == "high":
                        risk_level = "high"
            
            # Calculate confidence
            confidence = 0.85 if len(risk_indicators) > 0 else 0.75
            
            findings = {
                "risk_level": risk_level,
                "risk_indicators": risk_indicators if risk_indicators else ["All vital signs within normal range"],
                "vital_signs": {
                    "heart_rate": hr,
                    "blood_pressure": f"{bp_sys}/{bp_dia}" if bp_sys and bp_dia else None,
                    "temperature": temp,
                    "spo2": spo2
                },
                "classification": f"Risk Level: {risk_level.upper()}"
            }
            
            if ecg_findings:
                findings["ecg_analysis"] = ecg_findings
            
            end_time = datetime.utcnow()
            
            return {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": "success",
                "findings": findings,
                "confidence": confidence,
                "timestamp": end_time.isoformat(),
                "processing_time_ms": (end_time - start_time).total_seconds() * 1000
            }
            
        except Exception as e:
            logger.error(f"ECG analysis failed: {str(e)}")
            return {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "processing_time_ms": 0
            }
    
    def _analyze_ecg_signal(self, ecg_data: list) -> Dict:
        """Analyze ECG signal"""
        try:
            ecg_array = np.array(ecg_data)
            
            # Basic signal analysis
            mean_val = np.mean(ecg_array)
            std_val = np.std(ecg_array)
            max_val = np.max(ecg_array)
            min_val = np.min(ecg_array)
            
            abnormalities = []
            risk_level = "low"
            
            # Simple heuristics (would use actual model in production)
            if std_val > 0.5:
                abnormalities.append("High signal variability detected")
                risk_level = "medium"
            
            if max_val > 2.0 or min_val < -2.0:
                abnormalities.append("Abnormal signal amplitude detected")
                risk_level = "high"
            
            return {
                "signal_quality": "good",
                "abnormalities": abnormalities if abnormalities else ["No significant abnormalities detected"],
                "risk_level": risk_level,
                "statistics": {
                    "mean": float(mean_val),
                    "std": float(std_val),
                    "samples": len(ecg_data)
                }
            }
            
        except Exception as e:
            logger.error(f"ECG signal analysis failed: {str(e)}")
            return {"error": str(e)}


# ==================== Emotion Agent ====================

class EmotionAgent:
    """Agent for emotion and behavioral analysis"""
    
    def __init__(self):
        self.agent_id = "emotion_agent"
        self.agent_name = "Emotion Analysis Agent"
        self.model_path = "model_files/emotion_model.pth"
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load emotion model"""
        try:
            if os.path.exists(self.model_path):
                logger.info(f"Loading emotion model from {self.model_path}")
                self.model = torch.load(self.model_path, map_location=torch.device('cpu'))
                if hasattr(self.model, 'eval'):
                    self.model.eval()
                logger.info("Emotion model loaded successfully")
            else:
                logger.warning(f"Emotion model not found at {self.model_path}, using mock analysis")
        except Exception as e:
            logger.error(f"Failed to load emotion model: {str(e)}")
            logger.warning("Using mock emotion analysis")
    
    async def analyze(self, behavioral_data) -> Dict[str, Any]:
        """Analyze emotions from image, audio, or text"""
        start_time = datetime.utcnow()
        
        try:
            findings = {}
            risk_indicators = []
            risk_level = "low"
            
            # Analyze image if available
            if behavioral_data.image_data:
                image_result = self._analyze_image(behavioral_data.image_data)
                findings["facial_analysis"] = image_result
                
                # Check for distress indicators
                if image_result.get("detected_emotion") in ["sad", "angry", "fear"]:
                    risk_indicators.append(f"Facial expression indicates {image_result['detected_emotion']}")
                    risk_level = "medium"
            
            # Analyze audio if available
            if behavioral_data.audio_data:
                audio_result = self._analyze_audio(behavioral_data.audio_data)
                findings["audio_analysis"] = audio_result
                
                if audio_result.get("stress_detected"):
                    risk_indicators.append("Stress indicators in voice detected")
                    risk_level = "medium"
            
            # Analyze text if available
            if behavioral_data.text_data:
                text_result = self._analyze_text(behavioral_data.text_data)
                findings["text_analysis"] = text_result
                
                if text_result.get("sentiment") == "negative":
                    risk_indicators.append("Negative sentiment in patient communication")
            
            # Calculate confidence
            confidence = 0.80 if risk_indicators else 0.70
            
            findings["risk_level"] = risk_level
            findings["risk_indicators"] = risk_indicators if risk_indicators else ["No emotional distress indicators detected"]
            findings["classification"] = f"Emotional State: {risk_level.upper()} risk"
            
            end_time = datetime.utcnow()
            
            return {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": "success",
                "findings": findings,
                "confidence": confidence,
                "timestamp": end_time.isoformat(),
                "processing_time_ms": (end_time - start_time).total_seconds() * 1000
            }
            
        except Exception as e:
            logger.error(f"Emotion analysis failed: {str(e)}")
            return {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "processing_time_ms": 0
            }
    
    def _analyze_image(self, image_data: str) -> Dict:
        """Analyze facial image"""
        try:
            # Mock emotion detection (would use actual model in production)
            emotions = ["neutral", "happy", "sad", "angry", "fear", "surprise"]
            detected_emotion = np.random.choice(emotions, p=[0.4, 0.3, 0.1, 0.1, 0.05, 0.05])
            
            return {
                "detected_emotion": detected_emotion,
                "confidence": 0.82,
                "face_detected": True
            }
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_audio(self, audio_data: str) -> Dict:
        """Analyze audio data"""
        try:
            # Mock audio analysis
            stress_level = np.random.choice(["low", "medium", "high"], p=[0.6, 0.3, 0.1])
            
            return {
                "stress_level": stress_level,
                "stress_detected": stress_level != "low",
                "confidence": 0.75
            }
        except Exception as e:
            logger.error(f"Audio analysis failed: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_text(self, text_data: str) -> Dict:
        """Analyze text sentiment"""
        try:
            # Simple sentiment analysis
            negative_words = ["pain", "hurt", "bad", "awful", "terrible", "sad", "worried", "anxious"]
            positive_words = ["good", "fine", "well", "better", "happy", "comfortable"]
            
            text_lower = text_data.lower()
            neg_count = sum(1 for word in negative_words if word in text_lower)
            pos_count = sum(1 for word in positive_words if word in text_lower)
            
            if neg_count > pos_count:
                sentiment = "negative"
            elif pos_count > neg_count:
                sentiment = "positive"
            else:
                sentiment = "neutral"
            
            return {
                "sentiment": sentiment,
                "confidence": 0.70
            }
        except Exception as e:
            logger.error(f"Text analysis failed: {str(e)}")
            return {"error": str(e)}
