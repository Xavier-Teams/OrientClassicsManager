"""
Django management command to seed database with work tasks sample data
Based on Google Sheet structure: https://docs.google.com/spreadsheets/d/1bASkuOXOXBLJ3CNkMDTbHCigOv9a3_6c5K4rSiUVqvk/edit?usp=sharing

Usage: python manage.py seed_work_tasks
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from works.models import WorkTask
from datetime import datetime, timedelta
import random

User = get_user_model()


# Sample work tasks data based on Google Sheet structure
SAMPLE_WORK_TASKS = [
    # Công việc chung - Hằng ngày
    {
        "title": "Kiểm tra email và xử lý công văn đến",
        "description": "Kiểm tra và xử lý các email công văn đến trong ngày",
        "work_group": "chung",
        "frequency": "hang_ngay",
        "priority": "trung_binh",
        "status": "dang_tien_hanh",
        "progress_percent": 60,
    },
    {
        "title": "Cập nhật tiến độ công việc hàng ngày",
        "description": "Báo cáo và cập nhật tiến độ các công việc đang thực hiện",
        "work_group": "chung",
        "frequency": "hang_ngay",
        "priority": "cao",
        "status": "dang_tien_hanh",
        "progress_percent": 80,
    },
    {
        "title": "Họp giao ban đầu tuần",
        "description": "Tham gia họp giao ban để báo cáo và nhận nhiệm vụ",
        "work_group": "chung",
        "frequency": "hang_tuan",
        "priority": "cao",
        "status": "hoan_thanh",
        "progress_percent": 100,
    },
    # Biên tập
    {
        "title": "Biên tập bản dịch Thi Kinh",
        "description": "Rà soát và chỉnh sửa bản dịch Thi Kinh",
        "work_group": "bien_tap",
        "frequency": "dot_xuat",
        "priority": "rat_cao",
        "status": "dang_tien_hanh",
        "progress_percent": 45,
    },
    {
        "title": "Kiểm tra chất lượng bản dịch Thư Kinh",
        "description": "Kiểm tra và đánh giá chất lượng bản dịch",
        "work_group": "bien_tap",
        "frequency": "dot_xuat",
        "priority": "cao",
        "status": "chua_bat_dau",
        "progress_percent": 0,
    },
    # Thiết kế + CNTT
    {
        "title": "Cập nhật hệ thống quản lý công việc",
        "description": "Nâng cấp và cập nhật các tính năng mới cho hệ thống",
        "work_group": "thiet_ke_cntt",
        "frequency": "hang_thang",
        "priority": "cao",
        "status": "dang_tien_hanh",
        "progress_percent": 30,
    },
    {
        "title": "Thiết kế giao diện mới cho ứng dụng",
        "description": "Thiết kế UI/UX cho phiên bản mới của ứng dụng",
        "work_group": "thiet_ke_cntt",
        "frequency": "dot_xuat",
        "priority": "trung_binh",
        "status": "chua_bat_dau",
        "progress_percent": 0,
    },
    # Quét trùng lặp
    {
        "title": "Quét trùng lặp các tác phẩm đã dịch",
        "description": "Kiểm tra và phát hiện các tác phẩm trùng lặp trong hệ thống",
        "work_group": "quet_trung_lap",
        "frequency": "hang_tuan",
        "priority": "trung_binh",
        "status": "hoan_thanh",
        "progress_percent": 100,
    },
    # Hành chính
    {
        "title": "Chuẩn bị tài liệu họp thường trực",
        "description": "Soạn thảo và chuẩn bị các tài liệu cho cuộc họp",
        "work_group": "hanh_chinh",
        "frequency": "hang_tuan",
        "priority": "cao",
        "status": "dang_tien_hanh",
        "progress_percent": 70,
    },
    {
        "title": "Xử lý các thủ tục hành chính",
        "description": "Hoàn thiện các thủ tục hành chính còn tồn đọng",
        "work_group": "hanh_chinh",
        "frequency": "hang_ngay",
        "priority": "trung_binh",
        "status": "dang_tien_hanh",
        "progress_percent": 50,
    },
    # Thẩm định bản dịch thử
    {
        "title": "Thẩm định bản dịch thử Dịch Kinh",
        "description": "Đánh giá và thẩm định chất lượng bản dịch thử",
        "work_group": "tham_dinh_ban_dich_thu",
        "frequency": "dot_xuat",
        "priority": "rat_cao",
        "status": "cham_tien_do",
        "progress_percent": 40,
    },
    # Thẩm định cấp CG
    {
        "title": "Thẩm định cấp CG cho Lễ Ký",
        "description": "Thực hiện thẩm định cấp CG theo quy trình",
        "work_group": "tham_dinh_cap_cg",
        "frequency": "dot_xuat",
        "priority": "cao",
        "status": "hoan_thanh",
        "progress_percent": 100,
    },
    # Nghiệm thu cấp DA
    {
        "title": "Nghiệm thu cấp DA dự án dịch thuật",
        "description": "Tổ chức và thực hiện nghiệm thu dự án",
        "work_group": "nghiem_thu_cap_da",
        "frequency": "hang_thang",
        "priority": "rat_cao",
        "status": "dang_tien_hanh",
        "progress_percent": 25,
    },
    # Họp thường trực
    {
        "title": "Tham gia họp thường trực tháng 10",
        "description": "Tham gia và báo cáo trong cuộc họp thường trực",
        "work_group": "hop_thuong_truc",
        "frequency": "hang_thang",
        "priority": "cao",
        "status": "hoan_thanh",
        "progress_percent": 100,
    },
    {
        "title": "Chuẩn bị nội dung họp thường trực tháng 11",
        "description": "Soạn thảo nội dung và tài liệu cho cuộc họp",
        "work_group": "hop_thuong_truc",
        "frequency": "hang_thang",
        "priority": "cao",
        "status": "dang_tien_hanh",
        "progress_percent": 65,
    },
]


class Command(BaseCommand):
    help = "Seed database with sample work tasks data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing work tasks before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing work tasks..."))
            WorkTask.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Cleared all work tasks"))

        # Get or create a default user for created_by and assigned_to
        user = User.objects.first()
        if not user:
            self.stdout.write(
                self.style.ERROR("No users found. Please create a user first.")
            )
            return

        self.stdout.write(self.style.SUCCESS("Seeding work tasks..."))

        today = datetime.now().date()
        created_count = 0
        updated_count = 0

        for task_data in SAMPLE_WORK_TASKS:
            # Generate random dates
            days_ago_start = random.randint(0, 30)
            days_until_due = random.randint(1, 60)
            start_date = today - timedelta(days=days_ago_start)
            due_date = today + timedelta(days=days_until_due)

            # Set completed_date if status is hoan_thanh
            completed_date = None
            if task_data["status"] == "hoan_thanh":
                completed_date = today - timedelta(days=random.randint(0, 7))

            # Create or update task
            task, created = WorkTask.objects.update_or_create(
                title=task_data["title"],
                defaults={
                    "description": task_data.get("description", ""),
                    "work_group": task_data["work_group"],
                    "frequency": task_data["frequency"],
                    "priority": task_data["priority"],
                    "status": task_data["status"],
                    "start_date": start_date,
                    "due_date": due_date,
                    "completed_date": completed_date,
                    "progress_percent": task_data["progress_percent"],
                    "assigned_to": user if random.choice([True, False]) else None,
                    "created_by": user,
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created: "{task.title}"')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated: "{task.title}"')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully seeded work tasks: {created_count} created, {updated_count} updated"
            )
        )

