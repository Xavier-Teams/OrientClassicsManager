@echo off
cd /d "%~dp0"
call ..\venv-fastapi\Scripts\activate.bat
python main.py

