@echo off
REM Activate virtual environment and create superuser
call ..\venv-django\Scripts\activate.bat
python manage.py createsuperuser
pause

