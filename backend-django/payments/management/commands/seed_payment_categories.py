"""
Django management command to seed database with PaymentCategoryConfig data
Based on PAYMENT_ARCHITECTURE.md

Usage: python manage.py seed_payment_categories
"""

import sys
from django.core.management.base import BaseCommand
from payments.models import PaymentCategoryConfig


class Command(BaseCommand):
    help = 'Seed PaymentCategoryConfig with default categories'

    def handle(self, *args, **options):
        try:
            print('Starting to seed PaymentCategoryConfig...')
        except UnicodeEncodeError:
            # Fallback for Windows console encoding issues
            import sys
            sys.stdout.reconfigure(encoding='utf-8')
            print('Starting to seed PaymentCategoryConfig...')

        categories = [
            # Nhóm: Dịch thuật
            {
                'work_group': 'dich_thuat',
                'category_code': 'chi_phi_dich_thuat',
                'category_name': 'Chi phí dịch thuật',
                'description': 'Các khoản thanh toán liên quan đến dịch thuật: Tạm ứng lần 1, Tạm ứng lần 2, Quyết toán',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'thu_ky_hop_phan', 'dich_gia'],
                'can_create_roles': ['thu_ky_hop_phan', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1, 'auto_approve_amount': 10000000},
            },
            {
                'work_group': 'dich_thuat',
                'category_code': 'chi_phi_tham_dinh',
                'category_name': 'Chi phí thẩm định',
                'description': 'Các khoản thanh toán cho thẩm định: Thẩm định dịch thử, Thẩm định chuyên gia',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'thu_ky_hop_phan', 'chuyen_gia'],
                'can_create_roles': ['thu_ky_hop_phan', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            {
                'work_group': 'dich_thuat',
                'category_code': 'chi_phi_hieu_dinh',
                'category_name': 'Chi phí hiệu đính',
                'description': 'Thanh toán cho công việc hiệu đính bản dịch',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'thu_ky_hop_phan', 'chuyen_gia'],
                'can_create_roles': ['thu_ky_hop_phan', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            {
                'work_group': 'dich_thuat',
                'category_code': 'chi_phi_hop',
                'category_name': 'Chi phí họp',
                'description': 'Thanh toán cho các cuộc họp: Họp thường trực, Họp nghiệm thu',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'thu_ky_hop_phan'],
                'can_create_roles': ['thu_ky_hop_phan', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            
            # Nhóm: Biên tập
            {
                'work_group': 'bien_tap',
                'category_code': 'chi_phi_bien_tap',
                'category_name': 'Chi phí biên tập',
                'description': 'Các khoản thanh toán cho biên tập: Biên tập thô, Bông 1, Bông 2, Bông 3, Bông 4',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'bien_tap_vien'],
                'can_create_roles': ['bien_tap_vien', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            {
                'work_group': 'bien_tap',
                'category_code': 'chi_phi_dan_trang',
                'category_name': 'Chi phí dàn trang',
                'description': 'Thanh toán cho công việc dàn trang: Dàn trang, Mi trang',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'ky_thuat_vien'],
                'can_create_roles': ['ky_thuat_vien', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            {
                'work_group': 'bien_tap',
                'category_code': 'chi_phi_thiet_ke',
                'category_name': 'Chi phí thiết kế',
                'description': 'Thanh toán cho thiết kế: Thiết kế bìa, Thiết kế nội dung',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'ky_thuat_vien'],
                'can_create_roles': ['ky_thuat_vien', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            
            # Nhóm: CNTT
            {
                'work_group': 'cntt',
                'category_code': 'chi_phi_phat_trien',
                'category_name': 'Chi phí phát triển',
                'description': 'Thanh toán cho phát triển hệ thống và bảo trì',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'ky_thuat_vien'],
                'can_create_roles': ['ky_thuat_vien', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            {
                'work_group': 'cntt',
                'category_code': 'chi_phi_quet_trung_lap',
                'category_name': 'Chi phí quét trùng lặp',
                'description': 'Thanh toán cho công việc quét và phân tích trùng lặp',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'ky_thuat_vien'],
                'can_create_roles': ['ky_thuat_vien', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            
            # Nhóm: Hành chính
            {
                'work_group': 'hanh_chinh',
                'category_code': 'chi_phi_hanh_chinh',
                'category_name': 'Chi phí hành chính',
                'description': 'Các khoản thanh toán hành chính chung',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'van_phong', 'van_thu'],
                'can_create_roles': ['van_phong', 'van_thu', 'truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
            
            # Nhóm: Khác
            {
                'work_group': 'khac',
                'category_code': 'chi_phi_khac',
                'category_name': 'Chi phí khác',
                'description': 'Các khoản thanh toán khác không thuộc các nhóm trên',
                'can_view_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'can_create_roles': ['truong_ban_thu_ky', 'chu_nhiem', 'pho_chu_nhiem'],
                'can_approve_roles': ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky'],
                'requires_approval': True,
                'approval_workflow': {'levels': 1},
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for cat_data in categories:
            category_code = cat_data['category_code']
            work_group = cat_data['work_group']
            
            # Check if category already exists
            category, created = PaymentCategoryConfig.objects.get_or_create(
                work_group=work_group,
                category_code=category_code,
                defaults=cat_data
            )
            
            if created:
                created_count += 1
                try:
                    print(f'[OK] Created: {work_group} - {cat_data["category_name"]}')
                except UnicodeEncodeError:
                    print(f'[OK] Created: {work_group} - {cat_data["category_code"]}')
            else:
                # Update existing category
                for key, value in cat_data.items():
                    setattr(category, key, value)
                category.save()
                updated_count += 1
                try:
                    print(f'[UPDATED] Updated: {work_group} - {cat_data["category_name"]}')
                except UnicodeEncodeError:
                    print(f'[UPDATED] Updated: {work_group} - {cat_data["category_code"]}')

        print(f'\n[COMPLETED] Created: {created_count}, Updated: {updated_count}, Total: {len(categories)}')

