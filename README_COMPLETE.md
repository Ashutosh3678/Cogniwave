# CogniWave - AI-Powered Medical Diagnostics System

Complete system with authentication, database, AI analysis, and PDF report generation.

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd cogniwave/server/backend

# Install dependencies
pip install -r requirements_minimal.txt

# Set your Groq API key in .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env

# Run backend server
python main.py
```

Backend will start on: **http://localhost:8000**

### 2. Frontend Setup

```bash
cd cogniwave/frontend/client

# Install dependencies (if not done)
npm install

# Run frontend
npm run dev
```

Frontend will start on: **http://localhost:5173**

## 📋 Features

### ✅ Completed Features

1. **Authentication System**
   - Doctor registration and login
   - JWT token-based authentication
   - Secure password hashing with bcrypt

2. **SQLite Database**
   - **doctors** table: User accounts and profiles
   - **patients** table: Patient information
   - **analysis_reports** table: Complete analysis history

3. **AI Analysis**
   - **ECG Agent**: Analyzes vital signs (HR, BP, Temperature, SpO2, ECG signals)
   - **Emotion Agent**: Analyzes facial expressions, audio stress, text sentiment
   - Dynamic data processing based on actual inputs

4. **Groq AI Integration**
   - Generates professional medical reports using LLM
   - Structured clinical documentation

5. **PDF Report Generation**
   - Downloadable PDF reports with ReportLab
   - Includes vital signs, analysis results, and AI-generated report

6. **Patient History**
   - View all past analyses for each patient
   - Retrieve detailed reports from database

## 🔐 API Endpoints

### Authentication

- **POST** `/api/v1/auth/register` - Register new doctor
- **POST** `/api/v1/auth/login` - Doctor login
- **GET** `/api/v1/auth/me` - Get current doctor info

### Analysis (Requires Authentication)

- **POST** `/api/v1/analysis/patient` - Analyze patient data
  - Saves to database automatically
  - Generates Groq report
  - Creates downloadable PDF

### Patient History (Requires Authentication)

- **GET** `/api/v1/patients/{patient_id}/history` - Get patient's analysis history
- **GET** `/api/v1/reports/{report_id}` - Get detailed report
- **GET** `/api/v1/reports/download/{filename}` - Download PDF report

### System

- **GET** `/api/v1/health/` - Health check

## 🎯 How to Use

### Step 1: Access Landing Page
Navigate to **http://localhost:5173** and click **"Get Started"**

### Step 2: Login/Register
- First-time users: Click "Register" and create an account
- Existing users: Enter username and password

### Step 3: Enter Patient Data
On the diagnostics page:
1. Enter vital signs (Heart Rate, BP, Temperature, SpO2)
2. (Optional) Enable camera for facial emotion analysis
3. (Optional) Enable microphone for voice stress analysis
4. Click **"Analyze Patient"**

### Step 4: View Results
- See real-time AI analysis from both agents
- View risk assessment and clinical summary
- Read AI-generated medical report (powered by Groq)
- Download PDF report for patient records

## 🗄️ Database Structure

### doctors
- `id`, `username`, `email`, `hashed_password`
- `full_name`, `specialization`, `license_number`
- `created_at`, `is_active`

### patients
- `id`, `patient_id`, `full_name`, `age`, `gender`
- `contact_number`, `email`, `medical_history`
- `created_at`, `updated_at`

### analysis_reports
- `id`, `analysis_id`, `patient_id`, `doctor_id`
- Vital signs: `heart_rate`, `bp_systolic`, `bp_diastolic`, `temperature`, `oxygen_saturation`
- Analysis: `ecg_analysis`, `emotion_analysis`, `overall_summary`
- Report: `groq_report`, `pdf_filename`
- Metadata: `priority_level`, `requires_attention`, `symptoms`, `notes`
- `created_at`

## 🔧 Configuration

### Environment Variables (.env)

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (change in production)
SECRET_KEY=your-secret-key-change-this
DATABASE_URL=sqlite:///./cogniwave.db
HOST=0.0.0.0
PORT=8000
```

### Get Groq API Key
1. Go to https://console.groq.com/keys
2. Create a free account
3. Generate an API key
4. Add it to your `.env` file

## 📁 Project Structure

```
cogniwave/
├── server/backend/
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── database.py            # SQLAlchemy models
│   ├── auth.py                # Authentication utilities
│   ├── simple_agents.py       # ECG & Emotion agents
│   ├── groq_service.py        # Groq AI integration
│   ├── pdf_generator.py       # PDF report generation
│   ├── .env                   # Environment variables
│   ├── cogniwave.db           # SQLite database (auto-created)
│   └── reports/               # Generated PDF files
│
└── frontend/client/
    ├── public/dashboard/
    │   ├── diagnostics.html   # Main diagnostics page
    │   ├── diagnostics.js     # Frontend logic
    │   └── auth.js            # Authentication manager
    └── src/
        └── components/ui/
            └── hero-parallax.tsx  # Landing page with Get Started button
```

## 🧪 Testing the System

### 1. Register a Doctor
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr_smith",
    "email": "smith@hospital.com",
    "password": "password123",
    "full_name": "Dr. John Smith",
    "specialization": "Cardiology"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -F "username=dr_smith" \
  -F "password=password123"
```

### 3. Analyze Patient (use token from login)
```bash
curl -X POST http://localhost:8000/api/v1/analysis/patient \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_metadata": {"patient_id": "PT-001", "age": 65},
    "physiological_data": {
      "heart_rate": 75,
      "blood_pressure_systolic": 120,
      "blood_pressure_diastolic": 80,
      "temperature": 36.8,
      "oxygen_saturation": 98
    }
  }'
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify all dependencies are installed: `pip list`
- Check `.env` file exists

### Groq report generation fails
- Verify `GROQ_API_KEY` is set in `.env`
- Check your Groq API quota/limits
- System will still work with mock report text

### Frontend can't connect
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`
- Open browser console (F12) for detailed errors

### Authentication issues
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token in browser DevTools → Application → Local Storage
- Verify SECRET_KEY is consistent

## 📝 Notes

- The AI models currently use **intelligent mock analysis** based on input values
- ECG Agent evaluates vital signs against medical thresholds
- Emotion Agent uses sentiment analysis on text and mock detection for media
- All data is stored locally in SQLite database
- PDF reports are saved in `backend/reports/` directory

## 🚧 Future Enhancements

- [ ] Real model integration with actual PyTorch inference
- [ ] Real-time camera/microphone streaming
- [ ] Patient history dashboard with charts
- [ ] Export history to Excel/CSV
- [ ] Email notifications for high-risk cases
- [ ] Multi-language support
- [ ] Mobile app integration

## 📄 License

This project was developed for educational and demonstration purposes.

---

**Need Help?** Check the logs:
- Backend: Terminal output where `python main.py` is running
- Frontend: Browser console (F12 → Console tab)
- Database: `cogniwave.db` file in backend directory
