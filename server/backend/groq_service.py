"""
Groq API integration for medical report generation
"""

from groq import Groq
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")  # Set via environment variable
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set. Report generation will fail.")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def generate_medical_report(analysis_data: dict) -> str:
    """
    Generate comprehensive medical report using Groq API
    
    Args:
        analysis_data: Dictionary containing patient data and analysis results
        
    Returns:
        Generated medical report text
    """
    if not groq_client:
        raise Exception("Groq API not configured. Set GROQ_API_KEY environment variable.")
    
    # Extract data
    patient_info = analysis_data.get("patient_metadata", {})
    physiological = analysis_data.get("physiological_data", {})
    ecg_results = analysis_data.get("ecg_analysis", {})
    emotion_results = analysis_data.get("emotion_analysis", {})
    summary = analysis_data.get("summary", {})
    
    # Build prompt for Groq
    prompt = f"""You are an expert medical AI assistant. Generate a comprehensive, professional medical diagnostic report based on the following patient analysis data:

PATIENT INFORMATION:
- Patient ID: {patient_info.get('patient_id', 'N/A')}
- Age: {patient_info.get('age', 'N/A')}
- Gender: {patient_info.get('gender', 'N/A')}

VITAL SIGNS:
- Heart Rate: {physiological.get('heart_rate', 'N/A')} BPM
- Blood Pressure: {physiological.get('blood_pressure_systolic', 'N/A')}/{physiological.get('blood_pressure_diastolic', 'N/A')} mmHg
- Temperature: {physiological.get('temperature', 'N/A')}°C
- Oxygen Saturation: {physiological.get('oxygen_saturation', 'N/A')}%

ECG ANALYSIS FINDINGS:
{format_findings(ecg_results)}

EMOTIONAL/BEHAVIORAL ANALYSIS:
{format_findings(emotion_results)}

OVERALL ASSESSMENT:
- Priority Level: {summary.get('priority_level', 'N/A').upper()}
- Overall Status: {summary.get('overall_status', 'N/A')}
- Requires Immediate Attention: {'Yes' if summary.get('requires_immediate_attention') else 'No'}

Please generate a structured medical report with the following sections:
1. CLINICAL SUMMARY - Brief overview of patient condition
2. VITAL SIGNS ASSESSMENT - Analysis of physiological parameters
3. ECG FINDINGS - Detailed cardiac assessment
4. BEHAVIORAL ASSESSMENT - Emotional and stress indicators
5. RISK ANALYSIS - Identified risk factors and severity
6. RECOMMENDATIONS - Medical recommendations and follow-up actions
7. CONCLUSION - Final assessment and urgency level

Format the report professionally as it would be used by healthcare professionals. Be specific, concise, and clinically accurate."""

    try:
        # Call Groq API
        logger.info("Generating medical report with Groq API...")
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical AI that generates professional diagnostic reports for healthcare providers."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",  # or "mixtral-8x7b-32768"
            temperature=0.3,  # Lower temperature for more focused, clinical output
            max_tokens=2000
        )
        
        report = chat_completion.choices[0].message.content
        logger.info("Medical report generated successfully")
        return report
        
    except Exception as e:
        logger.error(f"Failed to generate report with Groq: {str(e)}")
        raise Exception(f"Report generation failed: {str(e)}")

def format_findings(findings_dict: dict) -> str:
    """Format analysis findings for prompt"""
    if not findings_dict:
        return "No data available"
    
    findings = findings_dict.get("findings", {})
    if not findings:
        return "No specific findings"
    
    output = []
    for key, value in findings.items():
        if isinstance(value, dict):
            output.append(f"- {key.replace('_', ' ').title()}: {value}")
        elif isinstance(value, list):
            output.append(f"- {key.replace('_', ' ').title()}: {', '.join(str(v) for v in value)}")
        else:
            output.append(f"- {key.replace('_', ' ').title()}: {value}")
    
    return "\n".join(output) if output else "No specific findings"
