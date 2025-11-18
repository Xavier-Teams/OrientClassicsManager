"""
Django management command to seed database with works data
Matches the mock data that was displayed in the frontend

Usage: python manage.py seed_works
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from works.models import TranslationWork, TranslationPart
from datetime import datetime, timedelta
import random

User = get_user_model()


# Mock works data from frontend (matching the original mock data)
MOCK_WORKS_DATA = {
    "draft": [
        {
            "name": "Thi Kinh (Kinh Thi)",
            "author": "Khổng Tử biên soạn",
            "translator_name": "Nguyễn Văn A",
            "page_count": 450,
            "translation_progress": 0,
            "priority": "0",  # normal
        },
        {
            "name": "Thư Kinh (Kinh Thư)",
            "author": "Không rõ",
            "translator_name": None,
            "page_count": 380,
            "translation_progress": 0,
            "priority": "0",  # normal (low in frontend = normal in Django)
        },
        {
            "name": "Dịch Kinh (Kinh Dịch)",
            "author": "Phục Hy",
            "translator_name": None,
            "page_count": 520,
            "translation_progress": 0,
            "priority": "1",  # high
        },
    ],
    "approved": [
        {
            "name": "Lễ Ký",
            "author": "Đại Thánh",
            "translator_name": "Trần Thị B",
            "page_count": 320,
            "translation_progress": 5,
            "priority": "0",  # normal
        },
        {
            "name": "Xuân Thu",
            "author": "Khổng Tử",
            "translator_name": "Lê Văn C",
            "page_count": 280,
            "translation_progress": 8,
            "priority": "1",  # high
        },
    ],
    "in_progress": [
        {
            "name": "Luận Ngữ",
            "author": "Khổng Tử",
            "translator_name": "Phạm Thị D",
            "page_count": 350,
            "translation_progress": 65,
            "priority": "1",  # high
        },
        {
            "name": "Mạnh Tử",
            "author": "Mạnh Kha",
            "translator_name": "Hoàng Văn E",
            "page_count": 420,
            "translation_progress": 45,
            "priority": "0",  # normal
        },
        {
            "name": "Đại Học",
            "author": "Khổng Cấp",
            "translator_name": "Võ Thị F",
            "page_count": 150,
            "translation_progress": 30,
            "priority": "2",  # urgent
        },
        {
            "name": "Trung Dung",
            "author": "Tử Tư",
            "translator_name": "Đặng Văn G",
            "page_count": 180,
            "translation_progress": 55,
            "priority": "1",  # high
        },
        {
            "name": "Tôn Tử Binh Pháp",
            "author": "Tôn Vũ",
            "translator_name": "Bùi Thị H",
            "page_count": 220,
            "translation_progress": 70,
            "priority": "0",  # normal
        },
    ],
    "progress_checked": [
        {
            "name": "Đạo Đức Kinh",
            "author": "Lão Tử",
            "translator_name": "Mai Văn I",
            "page_count": 290,
            "translation_progress": 85,
            "priority": "1",  # high
        },
        {
            "name": "Trang Tử",
            "author": "Trang Chu",
            "translator_name": "Đinh Thị K",
            "page_count": 410,
            "translation_progress": 80,
            "priority": "0",  # normal
        },
        {
            "name": "Mặc Tử",
            "author": "Mặc Địch",
            "translator_name": "Lý Văn L",
            "page_count": 340,
            "translation_progress": 88,
            "priority": "0",  # normal
        },
    ],
    "completed": [
        {
            "name": "Hàn Phi Tử",
            "author": "Hàn Phi",
            "translator_name": "Phan Thị M",
            "page_count": 380,
            "translation_progress": 100,
            "priority": "0",  # normal
        },
        {
            "name": "Tuân Tử",
            "author": "Tuân Huống",
            "translator_name": "Tạ Văn N",
            "page_count": 310,
            "translation_progress": 100,
            "priority": "0",  # normal
        },
        {
            "name": "Liệt Tử",
            "author": "Liệt Ngự Khấu",
            "translator_name": "Vũ Thị O",
            "page_count": 260,
            "translation_progress": 100,
            "priority": "0",  # normal (low in frontend = normal)
        },
        {
            "name": "Quản Tử",
            "author": "Quản Trọng",
            "translator_name": "Dương Văn P",
            "page_count": 330,
            "translation_progress": 100,
            "priority": "0",  # normal
        },
    ],
}


class Command(BaseCommand):
    help = 'Seed database with works data matching frontend mock data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing works before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Starting works seeding...\n'))

        # Clear existing works if requested
        if options['clear']:
            self.stdout.write('🧹 Clearing existing works...')
            TranslationWork.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Existing works cleared\n'))

        # Get or create default translation part
        default_part, created = TranslationPart.objects.get_or_create(
            code='DEFAULT',
            defaults={
                'name': 'Hợp phần mặc định',
                'description': 'Hợp phần mặc định cho các tác phẩm'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created default translation part: {default_part.name}'))

        # Get admin user for created_by
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('❌ No user found. Please create a user first.'))
            return

        total_created = 0

        # Process each status group
        for status, works_list in MOCK_WORKS_DATA.items():
            self.stdout.write(f'\n📚 Processing {status} works...')
            
            for work_data in works_list:
                # Get or create translator
                translator = None
                if work_data.get('translator_name'):
                    translator, created = User.objects.get_or_create(
                        username=work_data['translator_name'].lower().replace(' ', '_'),
                        defaults={
                            'email': f"{work_data['translator_name'].lower().replace(' ', '.')}@orientclassics.vn",
                            'full_name': work_data['translator_name'],
                            'role': 'dich_gia',
                            'active': True,
                        }
                    )
                    if created:
                        translator.set_password('password123')
                        translator.save()
                        self.stdout.write(f'  👤 Created translator: {translator.full_name}')

                # Create work
                work = TranslationWork.objects.create(
                    name=work_data['name'],
                    author=work_data.get('author', ''),
                    source_language='Hán văn',
                    target_language='Tiếng Việt',
                    page_count=work_data['page_count'],
                    word_count=work_data['page_count'] * 500,  # Estimate: 500 words per page
                    translation_part=default_part,
                    translator=translator,
                    state=status,
                    priority=work_data['priority'],
                    translation_progress=work_data['translation_progress'],
                    active=True,
                    created_by=admin_user,
                )
                total_created += 1
                self.stdout.write(f'  ✅ Created: {work.name} ({status})')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Successfully created {total_created} works!'))
        self.stdout.write(self.style.SUCCESS('\n📊 Summary:'))
        
        # Print summary by status
        for status, _ in MOCK_WORKS_DATA.items():
            count = TranslationWork.objects.filter(state=status, active=True).count()
            self.stdout.write(f'  - {status}: {count} works')

