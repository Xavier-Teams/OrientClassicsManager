# ⚡ Quick Start: Tạo Database mới trong pgAdmin4

## 🎯 Mục tiêu
Tạo database mới hoàn toàn với schema và dữ liệu mẫu trong **5 phút**.

## 📋 Checklist nhanh

### ✅ Bước 1: Tạo Database (1 phút)

**Trong pgAdmin4:**

1. Click chuột phải vào **Databases** → **Create** → **Database...**
2. Điền thông tin:
   - **Name**: `translation_db`
   - **Owner**: `postgres`
3. Click **Save**

**Hoặc chạy SQL:**
```sql
CREATE DATABASE translation_db WITH OWNER = postgres ENCODING = 'UTF8';
```

### ✅ Bước 2: Tạo Schema (2 phút)

**Mở Terminal:**
```bash
cd backend-django
python manage.py migrate
```

Lệnh này sẽ tự động tạo tất cả các bảng cần thiết.

### ✅ Bước 3: Insert Dữ liệu mẫu (1 phút)

**Trong pgAdmin4:**

1. Click chuột phải vào database `translation_db` → **Query Tool**
2. File → Open → Chọn `Doc/SQL_SEED_DATA.sql`
3. Click **Execute** (F5)

### ✅ Bước 4: Tạo Admin User (1 phút)

**Mở Terminal:**
```bash
cd backend-django
python manage.py createsuperuser
```

Nhập thông tin:
- Username: `admin`
- Email: `admin@orientclassics.vn`
- Password: (nhập password của bạn)

## ✅ Hoàn thành!

Bây giờ bạn có:
- ✅ Database `translation_db` với đầy đủ schema
- ✅ 17 Translation Works với dữ liệu mẫu
- ✅ 15 Translators
- ✅ 1 Admin user để đăng nhập

## 🧪 Kiểm tra nhanh

**Trong pgAdmin4 Query Tool:**
```sql
-- Kiểm tra số lượng works
SELECT state, COUNT(*) FROM translation_works GROUP BY state;

-- Kiểm tra translators
SELECT COUNT(*) FROM users WHERE role = 'dich_gia';
```

**Kết quả mong đợi:**
- draft: 3
- approved: 2
- in_progress: 5
- progress_checked: 3
- completed: 4
- Translators: 15

## 📚 Chi tiết

Xem hướng dẫn đầy đủ: [PGADMIN4_SETUP_GUIDE.md](./PGADMIN4_SETUP_GUIDE.md)

## ⚠️ Troubleshooting

**Lỗi "database does not exist":**
- Đảm bảo đã tạo database ở Bước 1

**Lỗi "permission denied":**
- Sử dụng user `postgres` hoặc user có quyền CREATE DATABASE

**Lỗi "relation already exists":**
- Database đã có schema, tạo database mới hoặc xóa các bảng cũ

---

**Thời gian ước tính: 5 phút** ⏱️

