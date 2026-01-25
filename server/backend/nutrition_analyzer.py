"""
Nutrition Label Analyzer with OCR and Gemini AI
"""
import os
import re
import json
from PIL import Image
import base64
from io import BytesIO
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract not available")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception as e:
    GEMINI_AVAILABLE = False
    genai = None
    logger.warning(f"google-generativeai not available: {e}")

# Configure Tesseract path for Windows
if TESSERACT_AVAILABLE:
    TESSERACT_PATHS = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
    ]

    for path in TESSERACT_PATHS:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            logger.info(f"Tesseract found at: {path}")
            break

class NutritionAnalyzer:
    def __init__(self, gemini_api_key: Optional[str] = None):
        """Initialize the nutrition analyzer with Gemini API"""
        self.api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found")
        
        if self.api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                model_names = [
                    'gemini-2.0-flash-exp',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-pro'
                ]
                
                self.model = None
                for model_name in model_names:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        logger.info(f"Gemini API initialized with model: {model_name}")
                        break
                    except Exception:
                        continue
                
                if not self.model:
                    logger.warning("Could not initialize any Gemini model")
                    
            except Exception as e:
                logger.error(f"Failed to initialize Gemini API: {e}")
                self.model = None
        else:
            self.model = None
    
    def extract_text_from_base64(self, base64_image: str) -> str:
        """Extract text from base64 encoded image"""
        if not TESSERACT_AVAILABLE:
            return ""
        
        try:
            # Remove data URL prefix if present
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            image_bytes = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_bytes))
            image = image.convert('L')  # Grayscale
            text = pytesseract.image_to_string(image)
            logger.info(f"Extracted text length: {len(text)}")
            return text
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            return ""
    
    def parse_nutrition_data(self, text: str) -> Dict:
        """Parse nutrition data from text"""
        nutrition_data = {
            "serving_size": None,
            "calories": None,
            "total_fat": None,
            "saturated_fat": None,
            "trans_fat": None,
            "cholesterol": None,
            "sodium": None,
            "total_carbohydrates": None,
            "dietary_fiber": None,
            "total_sugars": None,
            "added_sugars": None,
            "protein": None,
            "raw_text": text[:500]  # First 500 chars
        }
        
        patterns = {
            "calories": r'calories?\s*:?\s*(\d+)',
            "total_fat": r'total\s*fat\s*:?\s*(\d+\.?\d*)\s*g',
            "saturated_fat": r'saturated\s*fat\s*:?\s*(\d+\.?\d*)\s*g',
            "trans_fat": r'trans\s*fat\s*:?\s*(\d+\.?\d*)\s*g',
            "cholesterol": r'cholesterol\s*:?\s*(\d+\.?\d*)\s*mg',
            "sodium": r'sodium\s*:?\s*(\d+\.?\d*)\s*mg',
            "total_carbohydrates": r'total\s*carbohydrate\s*:?\s*(\d+\.?\d*)\s*g',
            "dietary_fiber": r'dietary\s*fiber\s*:?\s*(\d+\.?\d*)\s*g',
            "total_sugars": r'(?:total\s*)?sugars?\s*:?\s*(\d+\.?\d*)\s*g',
            "added_sugars": r'added\s*sugars?\s*:?\s*(\d+\.?\d*)\s*g',
            "protein": r'protein\s*:?\s*(\d+\.?\d*)\s*g',
            "serving_size": r'serving\s*size\s*:?\s*([\d.]+\s*\w+)'
        }
        
        text_lower = text.lower()
        for key, pattern in patterns.items():
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                try:
                    nutrition_data[key] = float(match.group(1)) if key != "serving_size" else match.group(1)
                except ValueError:
                    nutrition_data[key] = match.group(1)
        
        return nutrition_data
    
    def get_ai_recommendation(self, nutrition_data: Dict, user_vitals: Dict = None) -> Dict:
        """Get AI recommendation using Gemini"""
        if not self.model:
            return {
                "recommendation": "AI unavailable",
                "safe_to_eat": None,
                "health_score": 50,
                "reasons": ["AI analysis not configured"],
                "concerns": [],
                "alternatives": "Please configure Gemini API"
            }
        
        try:
            vitals_info = "No user health data provided"
            if user_vitals:
                vitals_info = f"""
- Heart Rate: {user_vitals.get('heart_rate', 'N/A')} bpm
- Blood Pressure: {user_vitals.get('bp_systolic', 'N/A')}/{user_vitals.get('bp_diastolic', 'N/A')} mmHg
- Temperature: {user_vitals.get('temperature', 'N/A')}°C
- SpO2: {user_vitals.get('spo2', 'N/A')}%
"""
            
            prompt = f"""
Analyze this nutrition label and provide health recommendations.

**Nutrition Data:**
- Calories: {nutrition_data.get('calories', 'N/A')}
- Total Fat: {nutrition_data.get('total_fat', 'N/A')}g
- Saturated Fat: {nutrition_data.get('saturated_fat', 'N/A')}g
- Sodium: {nutrition_data.get('sodium', 'N/A')}mg
- Total Carbs: {nutrition_data.get('total_carbohydrates', 'N/A')}g
- Sugars: {nutrition_data.get('total_sugars', 'N/A')}g
- Protein: {nutrition_data.get('protein', 'N/A')}g

**User Vitals:**
{vitals_info}

Provide recommendation as JSON:
{{
    "recommendation": "Safe to eat / Should avoid / Eat in moderation",
    "safe_to_eat": true/false,
    "health_score": 0-100,
    "reasons": ["reason1", "reason2"],
    "concerns": ["concern1", "concern2"],
    "alternatives": "brief suggestions"
}}
"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean markdown
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
            
            recommendation = json.loads(response_text)
            return recommendation
            
        except Exception as e:
            logger.error(f"AI recommendation error: {e}")
            return {
                "recommendation": "Error analyzing",
                "safe_to_eat": None,
                "health_score": 50,
                "reasons": [str(e)],
                "concerns": [],
                "alternatives": "Unable to analyze"
            }
    
    def analyze_nutrition_label(self, base64_image: str, user_vitals: Dict = None) -> Dict:
        """Complete analysis pipeline"""
        logger.info("Starting nutrition label analysis")
        
        text = self.extract_text_from_base64(base64_image)
        if not text:
            return {
                "success": False,
                "error": "Could not extract text from image"
            }
        
        nutrition_data = self.parse_nutrition_data(text)
        recommendation = self.get_ai_recommendation(nutrition_data, user_vitals)
        
        return {
            "success": True,
            "nutrition_data": nutrition_data,
            "recommendation": recommendation
        }
