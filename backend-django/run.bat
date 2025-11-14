@echo off
REM Activate virtual environment and run Django server
call ..\venv-django\Scripts\activate.bat
python manage.py runserver
pause

