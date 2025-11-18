#!/bin/bash

echo "========================================"
echo "Starting Django Backend Server"
echo "========================================"

cd backend-django

echo ""
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 not found!"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

python3 --version

echo ""
echo "Starting Django server at http://localhost:8000"
echo "Press CTRL+C to stop the server"
echo ""

python3 manage.py runserver

