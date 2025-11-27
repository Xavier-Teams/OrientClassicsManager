#!/usr/bin/env python
"""
Script kiểm tra dữ liệu sau khi import
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def check_data():
    cursor = connection.cursor()
    
    # Các bảng quan trọng cần kiểm tra
    important_tables = [
        'users',
        'translators', 
        'translation_works',
        'translation_contracts',
        'payments',
        'contract_templates'
    ]
    
    print("Data Check Report")
    print("=" * 50)
    
    total_records = 0
    
    for table in important_tables:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM {table}')
            count = cursor.fetchone()[0]
            total_records += count
            print(f'{table:25}: {count:>6} records')
        except Exception as e:
            print(f'{table:25}: ERROR - {e}')
    
    print("-" * 50)
    print(f'{"Total records":25}: {total_records:>6}')
    
    # Kiểm tra các bảng có dữ liệu
    cursor.execute("""
        SELECT table_name, 
               (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I', table_name), false, true, '')))[1]::text::int as row_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'django_%'
        AND table_name NOT LIKE 'auth_%'
        ORDER BY table_name;
    """)
    
    all_tables = cursor.fetchall()
    
    print("\nAll Application Tables:")
    print("=" * 50)
    
    empty_tables = []
    for table_name, row_count in all_tables:
        if row_count == 0:
            empty_tables.append(table_name)
        print(f'{table_name:25}: {row_count:>6} records')
    
    if empty_tables:
        print(f"\nEmpty tables ({len(empty_tables)}):")
        for table in empty_tables:
            print(f'  - {table}')
    else:
        print("\nAll tables have data!")

if __name__ == '__main__':
    try:
        check_data()
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure Django is properly configured and database is accessible.")
