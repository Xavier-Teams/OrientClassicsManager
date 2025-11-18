"""
Django management command to seed database with all sample data
Includes users and works matching the frontend mock data

Usage: python manage.py seed_all
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from works.models import TranslationWork, TranslationPart
from datetime import datetime
import random

User = get_user_model()


# Sample users data
SAMPLE_USERS = [
    # Translators (from mock data)
    {"username": "nguyen_van_a", "full_name": "Nguyễn Văn A", "email": "nguyen.van.a@orientclassics.vn", "role": "dich_gia"},
    {"username": "tran_thi_b", "full_name": "Trần Thị B", "email": "tran.thi.b@orientclassics.vn", "role": "dich_gia"},
    {"username": "le_van_c", "full_name": "Lê Văn C", "email": "le.van.c@orientclassics.vn", "role": "dich_gia"},
    {"username": "pham_thi_d", "full_name": "Phạm Thị D", "email": "pham.thi.d@orientclassics.vn", "role": "dich_gia"},
    {"username": "hoang_van_e", "full_name": "Hoàng Văn E", "email": "hoang.van.e@orientclassics.vn", "role": "dich_gia"},
    {"username": "vo_thi_f", "full_name": "Võ Thị F", "email": "vo.thi.f@orientclassics.vn", "role": "dich_gia"},
    {"username": "dang_van_g", "full_name": "Đặng Văn G", "email": "dang.van.g@orientclassics.vn", "role": "dich_gia"},
    {"username": "bui_thi_h", "full_name": "Bùi Thị H", "email": "bui.thi.h@orientclassics.vn", "role": "dich_gia"},
    {"username": "mai_van_i", "full_name": "Mai Văn I", "email": "mai.van.i@orientclassics.vn", "role": "dich_gia"},
    {"username": "dinh_thi_k", "full_name": "Đinh Thị K", "email": "dinh.thi.k@orientclassics.vn", "role": "dich_gia"},
    {"username": "ly_van_l", "full_name": "Lý Văn L", "email": "ly.van.l@orientclassics.vn", "role": "dich_gia"},
    {"username": "phan_thi_m", "full_name": "Phan Thị M", "email": "phan.thi.m@orientclassics.vn", "role": "dich_gia"},
    {"username": "ta_van_n", "full_name": "Tạ Văn N", "email": "ta.van.n@orientclassics.vn", "role": "dich_gia"},
    {"username": "vu_thi_o", "full_name": "Vũ Thị O", "email": "vu.thi.o@orientclassics.vn", "role": "dich_gia"},
    {"username": "duong_van_p", "full_name": "Dương Văn P", "email": "duong.van.p@orientclassics.vn", "role": "dich_gia"},
]


# Mock works data from frontend
MOCK_WORKS_DATA = {
    "draft": [
        {"name": "Thi Kinh (Kinh Thi)", "author": "Khổng Tử biên soạn", "translator_name": "Nguyễn Văn A", "page_count": 450, "translation_progress": 0, "priority": "0"},
        {"name": "Thư Kinh (Kinh Thư)", "author": "Không rõ", "translator_name": None, "page_count": 380, "translation_progress": 0, "priority": "0"},
        {"name": "Dịch Kinh (Kinh Dịch)", "author": "Phục Hy", "translator_name": None, "page_count": 520, "translation_progress": 0, "priority": "1"},
    ],
    "approved": [
        {"name": "Lễ Ký", "author": "Đại Thánh", "translator_name": "Trần Thị B", "page_count": 320, "translation_progress": 5, "priority": "0"},
        {"name": "Xuân Thu", "author": "Khổng Tử", "translator_name": "Lê Văn C", "page_count": 280, "translation_progress": 8, "priority": "1"},
    ],
    "in_progress": [
        {"name": "Luận Ngữ", "author": "Khổng Tử", "translator_name": "Phạm Thị D", "page_count": 350, "translation_progress": 65, "priority": "1"},
        {"name": "Mạnh Tử", "author": "Mạnh Kha", "translator_name": "Hoàng Văn E", "page_count": 420, "translation_progress": 45, "priority": "0"},
        {"name": "Đại Học", "author": "Khổng Cấp", "translator_name": "Võ Thị F", "page_count": 150, "translation_progress": 30, "priority": "2"},
        {"name": "Trung Dung", "author": "Tử Tư", "translator_name": "Đặng Văn G", "page_count": 180, "translation_progress": 55, "priority": "1"},
        {"name": "Tôn Tử Binh Pháp", "author": "Tôn Vũ", "translator_name": "Bùi Thị H", "page_count": 220, "translation_progress": 70, "priority": "0"},
    ],
    "progress_checked": [
        {"name": "Đạo Đức Kinh", "author": "Lão Tử", "translator_name": "Mai Văn I", "page_count": 290, "translation_progress": 85, "priority": "1"},
        {"name": "Trang Tử", "author": "Trang Chu", "translator_name": "Đinh Thị K", "page_count": 410, "translation_progress": 80, "priority": "0"},
        {"name": "Mặc Tử", "author": "Mặc Địch", "translator_name": "Lý Văn L", "page_count": 340, "translation_progress": 88, "priority": "0"},
    ],
    "completed": [
        {"name": "Hàn Phi Tử", "author": "Hàn Phi", "translator_name": "Phan Thị M", "page_count": 380, "translation_progress": 100, "priority": "0"},
        {"name": "Tuân Tử", "author": "Tuân Huống", "translator_name": "Tạ Văn N", "page_count": 310, "translation_progress": 100, "priority": "0"},
        {"name": "Liệt Tử", "author": "Liệt Ngự Khấu", "translator_name": "Vũ Thị O", "page_count": 260, "translation_progress": 100, "priority": "0"},
        {"name": "Quản Tử", "author": "Quản Trọng", "translator_name": "Dương Văn P", "page_count": 330, "translation_progress": 100, "priority": "0"},
    ],
}


class Command(BaseCommand):
    help = 'Seed database with all sample data (users and works)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Starting database seeding...\n'))

        # Clear existing data if requested
        if options['clear']:
            self.stdout.write('🧹 Clearing existing data...')
            TranslationWork.objects.all().delete()
            User.objects.filter(role='dich_gia').delete()
            self.stdout.write(self.style.SUCCESS('✅ Existing data cleared\n'))

        # Create users
        self.stdout.write('👥 Creating users...')
        translator_map = {}
        for user_data in SAMPLE_USERS:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'full_name': user_data['full_name'],
                    'role': user_data['role'],
                    'active': True,
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'  ✅ Created: {user.full_name}')
            translator_map[user_data['full_name']] = user

        # Get or create default translation part
        default_part, created = TranslationPart.objects.get_or_create(
            code='DEFAULT',
            defaults={
                'name': 'Hợp phần mặc định',
                'description': 'Hợp phần mặc định cho các tác phẩm'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Created default translation part: {default_part.name}'))

        # Get admin user for created_by
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('❌ No user found. Please create a superuser first.'))
            return

        # Create works
        self.stdout.write('\n📚 Creating works...')
        total_created = 0

        for status, works_list in MOCK_WORKS_DATA.items():
            self.stdout.write(f'\n  Processing {status}...')
            
            for work_data in works_list:
                translator = None
                if work_data.get('translator_name'):
                    translator = translator_map.get(work_data['translator_name'])

                work = TranslationWork.objects.create(
                    name=work_data['name'],
                    author=work_data.get('author', ''),
                    source_language='Hán văn',
                    target_language='Tiếng Việt',
                    page_count=work_data['page_count'],
                    word_count=work_data['page_count'] * 500,
                    translation_part=default_part,
                    translator=translator,
                    state=status,
                    priority=work_data['priority'],
                    translation_progress=work_data['translation_progress'],
                    active=True,
                    created_by=admin_user,
                )
                total_created += 1
                self.stdout.write(f'    ✅ {work.name}')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Successfully created {total_created} works!'))
        self.stdout.write(self.style.SUCCESS('\n📊 Summary:'))
        
        for status, _ in MOCK_WORKS_DATA.items():
            count = TranslationWork.objects.filter(state=status, active=True).count()
            self.stdout.write(f'  - {status}: {count} works')

