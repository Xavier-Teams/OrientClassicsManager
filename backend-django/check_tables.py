#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def check_tables():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
    print('Database Tables:')
    print('=' * 40)
    for i, table in enumerate(tables, 1):
        print(f'{i:2d}. {table[0]}')
    
    print(f'\nTotal: {len(tables)} tables')
    
    # Check Django core tables
    django_tables = [t[0] for t in tables if t[0].startswith(('auth_', 'django_', 'sessions_'))]
    app_tables = [t[0] for t in tables if not t[0].startswith(('auth_', 'django_', 'sessions_'))]
    
    print(f'\nDjango core tables: {len(django_tables)}')
    print(f'Application tables: {len(app_tables)}')
    
    print('\nApplication tables:')
    for table in app_tables:
        print(f'  - {table}')

if __name__ == '__main__':
    check_tables()
