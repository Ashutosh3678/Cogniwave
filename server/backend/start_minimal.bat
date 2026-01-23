@echo off
echo Starting CogniWave Minimal Backend...
echo.

cd /d "%~dp0"

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
python simple_main.py

pause
