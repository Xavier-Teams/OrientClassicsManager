@echo off
cd /d "%~dp0"
call ..\venv-django\Scripts\activate.bat
python manage.py seed_all --clear
pause

