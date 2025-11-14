@echo off
REM Activate virtual environment and run migrations
call ..\venv-django\Scripts\activate.bat
python manage.py makemigrations
python manage.py migrate
pause

