"""
PDF report generation using ReportLab
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.platypus import Image as RLImage
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

def generate_pdf_report(report_data: dict, output_path: str) -> str:
    """
    Generate PDF medical report
    
    Args:
        report_data: Dictionary with patient data, analysis results, and Groq report
        output_path: Path where PDF will be saved
        
    Returns:
        Path to generated PDF file
    """
    try:
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for PDF elements
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#7A5AF8'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#7A5AF8'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['BodyText'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=12
        )
        
        # Header
        story.append(Paragraph("COGNIWAVE", title_style))
        story.append(Paragraph("AI-Powered Medical Diagnostic Report", styles['Heading3']))
        story.append(Spacer(1, 0.2*inch))
        
        # Metadata table
        patient_meta = report_data.get('patient_metadata', {})
        meta_data = [
            ['Report ID:', report_data.get('analysis_id', 'N/A')],
            ['Patient ID:', patient_meta.get('patient_id', 'N/A')],
            ['Date:', datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')],
            ['Priority:', report_data.get('summary', {}).get('priority_level', 'N/A').upper()]
        ]
        
        meta_table = Table(meta_data, colWidths=[2*inch, 4*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Vital Signs section
        story.append(Paragraph("VITAL SIGNS", heading_style))
        physio = report_data.get('physiological_data', {})
        vital_data = [
            ['Parameter', 'Value', 'Status'],
            ['Heart Rate', f"{physio.get('heart_rate', 'N/A')} BPM", get_hr_status(physio.get('heart_rate'))],
            ['Blood Pressure', f"{physio.get('blood_pressure_systolic', 'N/A')}/{physio.get('blood_pressure_diastolic', 'N/A')} mmHg", get_bp_status(physio.get('blood_pressure_systolic'))],
            ['Temperature', f"{physio.get('temperature', 'N/A')}°C", get_temp_status(physio.get('temperature'))],
            ['SpO2', f"{physio.get('oxygen_saturation', 'N/A')}%", get_spo2_status(physio.get('oxygen_saturation'))]
        ]
        
        vital_table = Table(vital_data, colWidths=[2*inch, 2*inch, 2*inch])
        vital_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7A5AF8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')])
        ]))
        story.append(vital_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Groq-generated report
        story.append(Paragraph("COMPREHENSIVE MEDICAL ANALYSIS", heading_style))
        groq_report = report_data.get('groq_report', 'Report not generated')
        
        # Split report into paragraphs
        for paragraph in groq_report.split('\n\n'):
            if paragraph.strip():
                # Check if it's a heading (all caps or starts with number)
                if paragraph.strip().isupper() or paragraph.strip()[0].isdigit():
                    story.append(Paragraph(paragraph.strip(), heading_style))
                else:
                    story.append(Paragraph(paragraph.strip(), body_style))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        story.append(Paragraph("This report was generated by CogniWave AI diagnostic system.", footer_style))
        story.append(Paragraph("For medical review and clinical decision support only.", footer_style))
        
        # Build PDF
        doc.build(story)
        logger.info(f"PDF report generated: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise Exception(f"PDF generation failed: {str(e)}")

# Helper functions for status assessment
def get_hr_status(hr):
    if hr is None:
        return "N/A"
    if 60 <= hr <= 100:
        return "Normal"
    elif 100 < hr <= 120:
        return "Elevated"
    else:
        return "Abnormal"

def get_bp_status(systolic):
    if systolic is None:
        return "N/A"
    if systolic < 120:
        return "Normal"
    elif 120 <= systolic < 140:
        return "Elevated"
    else:
        return "High"

def get_temp_status(temp):
    if temp is None:
        return "N/A"
    if 36.1 <= temp <= 37.2:
        return "Normal"
    elif temp > 37.2:
        return "Elevated"
    else:
        return "Low"

def get_spo2_status(spo2):
    if spo2 is None:
        return "N/A"
    if spo2 >= 95:
        return "Normal"
    elif spo2 >= 90:
        return "Low"
    else:
        return "Critical"
