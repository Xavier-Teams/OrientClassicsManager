#!/usr/bin/env python
"""
Script để tạo user ID 70 để fix foreign key constraints
"""
import os
import django
import sys

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from django.contrib.auth.hashers import make_password

def create_missing_user():
    """Create user ID 70 if not exists"""
    sys.stdout.reconfigure(encoding='utf-8')
    
    try:
        # Kiểm tra xem user ID 70 đã tồn tại chưa
        user = User.objects.filter(id=70).first()
        if user:
            print(f"User ID 70 already exists: {user.username} ({user.email})")
            return True
        
        # Tạo user mới với ID 70
        user = User(
            id=70,
            username='admin_old',
            email='admin_old@example.com',
            first_name='Admin',
            last_name='Old',
            full_name='Admin Old System',
            role='chu_nhiem',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            password=make_password('temp_password_123')
        )
        user.save()
        
        print(f"✓ Created user ID 70: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error creating user: {e}")
        return False

def create_missing_users():
    """Create other missing users if needed"""
    users_to_create = [
        {
            'id': 86,
            'username': 'vinhnv_old',
            'email': 'vinhnv.old@vnu.edu.vn',
            'first_name': 'Nguyễn Viết',
            'last_name': 'Vinh',
            'full_name': 'Nguyễn Viết Vinh',
            'role': 'thu_ky_hop_phan'
        },
        {
            'id': 87,
            'username': 'sonnk_old',
            'email': 'sonnk.old@vnu.edu.vn',
            'first_name': 'Nguyễn Kim',
            'last_name': 'Sơn',
            'full_name': 'Nguyễn Kim Sơn',
            'role': 'chu_nhiem'
        },
        {
            'id': 88,
            'username': 'hadv_old',
            'email': 'hadv.old@vnu.edu.vn',
            'first_name': 'Dương Văn',
            'last_name': 'Hà',
            'full_name': 'Dương Văn Hà',
            'role': 'thu_ky_hop_phan'
        }
    ]
    
    for user_data in users_to_create:
        try:
            user = User.objects.filter(id=user_data['id']).first()
            if user:
                print(f"User ID {user_data['id']} already exists: {user.username}")
                continue
            
            user = User(
                id=user_data['id'],
                username=user_data['username'],
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                full_name=user_data['full_name'],
                role=user_data['role'],
                is_staff=False,
                is_superuser=False,
                is_active=True,
                password=make_password('temp_password_123')
            )
            user.save()
            
            print(f"✓ Created user ID {user_data['id']}: {user.username}")
            
        except Exception as e:
            print(f"✗ Error creating user ID {user_data['id']}: {e}")

if __name__ == '__main__':
    print("Create missing users to fix foreign key constraints")
    print("=" * 60)
    
    create_missing_user()
    create_missing_users()
    
    print("\n" + "=" * 60)
    print("Complete! Now you can try restore again.")
