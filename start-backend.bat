@echo off
echo ========================================
echo Starting Django Backend Server
echo ========================================
cd backend-django
echo.
echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)
echo.
echo Starting Django server at http://localhost:8000
echo Press CTRL+C to stop the server
echo.
python manage.py runserver
pause

