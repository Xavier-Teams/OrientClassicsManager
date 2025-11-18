"""
Seed database with works data from frontend mock data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Work, User, TranslationStatus, Priority
import uuid
from datetime import datetime, timedelta

# Mock works data from frontend
MOCK_WORKS = {
    "draft": [
        {
            "name": "Thi Kinh (Kinh Thi)",
            "author": "Khổng Tử biên soạn",
            "translator": "Nguyễn Văn A",
            "page_count": 450,
            "progress": 0,
            "priority": "normal",
            "due_date": "2024-03-30",
        },
        {
            "name": "Thư Kinh (Kinh Thư)",
            "author": "Không rõ",
            "translator": None,
            "page_count": 380,
            "progress": 0,
            "priority": "low",
            "due_date": "2024-04-15",
        },
        {
            "name": "Dịch Kinh (Kinh Dịch)",
            "author": "Phục Hy",
            "translator": None,
            "page_count": 520,
            "progress": 0,
            "priority": "high",
            "due_date": "2024-03-25",
        },
    ],
    "approved": [
        {
            "name": "Lễ Ký",
            "author": "Đại Thánh",
            "translator": "Trần Thị B",
            "page_count": 320,
            "progress": 5,
            "priority": "normal",
            "due_date": "2024-04-10",
        },
        {
            "name": "Xuân Thu",
            "author": "Khổng Tử",
            "translator": "Lê Văn C",
            "page_count": 280,
            "progress": 8,
            "priority": "high",
            "due_date": "2024-03-28",
        },
    ],
    "in_progress": [
        {
            "name": "Luận Ngữ",
            "author": "Khổng Tử",
            "translator": "Phạm Thị D",
            "page_count": 350,
            "progress": 65,
            "priority": "high",
            "due_date": "2024-03-20",
        },
        {
            "name": "Mạnh Tử",
            "author": "Mạnh Kha",
            "translator": "Hoàng Văn E",
            "page_count": 420,
            "progress": 45,
            "priority": "normal",
            "due_date": "2024-04-05",
        },
        {
            "name": "Đại Học",
            "author": "Khổng Cấp",
            "translator": "Võ Thị F",
            "page_count": 150,
            "progress": 30,
            "priority": "urgent",
            "due_date": "2024-03-18",
        },
        {
            "name": "Trung Dung",
            "author": "Tử Tư",
            "translator": "Đặng Văn G",
            "page_count": 180,
            "progress": 55,
            "priority": "high",
            "due_date": "2024-03-22",
        },
        {
            "name": "Tôn Tử Binh Pháp",
            "author": "Tôn Vũ",
            "translator": "Bùi Thị H",
            "page_count": 220,
            "progress": 70,
            "priority": "normal",
            "due_date": "2024-04-08",
        },
    ],
    "progress_checked": [
        {
            "name": "Đạo Đức Kinh",
            "author": "Lão Tử",
            "translator": "Mai Văn I",
            "page_count": 290,
            "progress": 85,
            "priority": "high",
            "due_date": "2024-03-15",
        },
        {
            "name": "Trang Tử",
            "author": "Trang Chu",
            "translator": "Đinh Thị K",
            "page_count": 410,
            "progress": 80,
            "priority": "normal",
            "due_date": "2024-03-25",
        },
        {
            "name": "Mặc Tử",
            "author": "Mặc Địch",
            "translator": "Lý Văn L",
            "page_count": 340,
            "progress": 88,
            "priority": "normal",
            "due_date": "2024-04-01",
        },
    ],
    "completed": [
        {
            "name": "Hàn Phi Tử",
            "author": "Hàn Phi",
            "translator": "Phan Thị M",
            "page_count": 380,
            "progress": 100,
            "priority": "normal",
            "due_date": "2024-02-28",
        },
        {
            "name": "Tuân Tử",
            "author": "Tuân Huống",
            "translator": "Tạ Văn N",
            "page_count": 310,
            "progress": 100,
            "priority": "normal",
            "due_date": "2024-02-15",
        },
        {
            "name": "Liệt Tử",
            "author": "Liệt Ngự Khấu",
            "translator": "Vũ Thị O",
            "page_count": 260,
            "progress": 100,
            "priority": "low",
            "due_date": "2024-01-30",
        },
        {
            "name": "Quản Tử",
            "author": "Quản Trọng",
            "translator": "Dương Văn P",
            "page_count": 330,
            "progress": 100,
            "priority": "normal",
            "due_date": "2024-02-10",
        },
    ],
}

def get_or_create_user(db: Session, name: str) -> User:
    """Get or create a user by name"""
    user = db.query(User).filter(User.full_name == name).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            username=name.lower().replace(" ", "_"),
            password="password123",  # Default password
            full_name=name,
            email=f"{name.lower().replace(' ', '.')}@example.com",
            role="dich_gia",
            active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def seed_works():
    """Seed works data"""
    db = SessionLocal()
    try:
        # Clear existing works
        db.query(Work).delete()
        db.commit()
        
        work_id = 1
        for status, works_list in MOCK_WORKS.items():
            for work_data in works_list:
                translator_id = None
                if work_data.get("translator"):
                    translator = get_or_create_user(db, work_data["translator"])
                    translator_id = translator.id
                
                work = Work(
                    id=str(uuid.uuid4()),
                    name=work_data["name"],
                    author=work_data.get("author"),
                    page_count=work_data.get("page_count", 0),
                    word_count=work_data.get("page_count", 0) * 500,  # Estimate
                    translation_status=TranslationStatus[status],
                    priority=Priority[work_data.get("priority", "normal")],
                    translation_progress=work_data.get("progress", 0),
                    translator_id=translator_id,
                    active=True
                )
                db.add(work)
                work_id += 1
        
        db.commit()
        print(f"✅ Seeded {work_id - 1} works successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding works: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_works()

