# 📊 SQL Seed Data - Hướng dẫn sử dụng

## Mục đích

Script SQL này chuyển đổi dữ liệu mẫu từ frontend (mock data) sang SQL để có thể thực thi trực tiếp trong PostgreSQL, không cần chạy Django seed command.

## Nội dung

Script `SQL_SEED_DATA.sql` bao gồm:

1. **Translation Parts**: Tạo hợp phần dịch thuật mặc định
2. **Users**: 
   - Admin user (nếu chưa có)
   - 15 dịch giả (translators) với các tên: Nguyễn Văn A, Trần Thị B, ...
3. **Translation Works**: 17 tác phẩm được phân loại theo trạng thái:
   - **Draft (Dự kiến)**: 3 works
   - **Approved (Đã duyệt)**: 2 works
   - **In Progress (Đang dịch)**: 5 works
   - **Progress Checked (Đã kiểm tra tiến độ)**: 3 works
   - **Completed (Hoàn thành)**: 4 works

## Cách sử dụng

### Cách 1: Sử dụng psql command line

```bash
# Kết nối và chạy script
psql -U your_username -d translation_db -f Doc/SQL_SEED_DATA.sql

# Hoặc nếu đã ở trong psql
\i Doc/SQL_SEED_DATA.sql
```

### Cách 2: Sử dụng pgAdmin

1. Mở pgAdmin
2. Kết nối với database `translation_db`
3. Mở Query Tool (Tools > Query Tool)
4. Copy toàn bộ nội dung file `SQL_SEED_DATA.sql`
5. Paste vào Query Tool
6. Nhấn F5 hoặc Execute để chạy

### Cách 3: Sử dụng Django (khuyến nghị)

Nếu muốn có password đúng ngay từ đầu, sử dụng Django command:

```bash
cd backend-django
python manage.py seed_works
```

## Lưu ý quan trọng

### 1. Password Hash

Script SQL sử dụng password hash placeholder. Để set password đúng cho các users:

```python
# Chạy trong Django shell
python manage.py shell

>>> from users.models import User
>>> for user in User.objects.filter(role='dich_gia'):
...     user.set_password('password123')
...     user.save()
```

Hoặc chạy Django seed command để có password đúng ngay từ đầu.

### 2. Xóa dữ liệu cũ

Nếu muốn xóa dữ liệu cũ trước khi insert, uncomment các dòng DELETE ở đầu script:

```sql
DELETE FROM translation_works;
DELETE FROM translation_parts WHERE code = 'DEFAULT';
DELETE FROM users WHERE role = 'dich_gia' AND email LIKE '%@orientclassics.vn';
```

### 3. Tránh duplicate

Script sử dụng `WHERE NOT EXISTS` và `ON CONFLICT` để tránh duplicate, có thể chạy nhiều lần mà không bị lỗi.

## Xác minh dữ liệu

Sau khi chạy script, kiểm tra dữ liệu:

```sql
-- Xem số lượng works theo trạng thái
SELECT state, COUNT(*) as count 
FROM translation_works 
WHERE active = true 
GROUP BY state 
ORDER BY state;

-- Xem danh sách translators
SELECT username, full_name, email 
FROM users 
WHERE role = 'dich_gia' 
ORDER BY full_name;

-- Xem chi tiết works
SELECT 
    w.name,
    w.author,
    w.state,
    w.priority,
    w.translation_progress,
    u.full_name as translator_name
FROM translation_works w
LEFT JOIN users u ON w.translator_id = u.id
WHERE w.active = true
ORDER BY w.state, w.name;
```

## Dữ liệu được tạo

### Translation Parts
- **DEFAULT**: Hợp phần mặc định

### Translators (15 users)
- Nguyễn Văn A
- Trần Thị B
- Lê Văn C
- Phạm Thị D
- Hoàng Văn E
- Võ Thị F
- Đặng Văn G
- Bùi Thị H
- Mai Văn I
- Đinh Thị K
- Lý Văn L
- Phan Thị M
- Tạ Văn N
- Vũ Thị O
- Dương Văn P

### Translation Works (17 works)

#### Draft (3)
- Thi Kinh (Kinh Thi) - 450 trang
- Thư Kinh (Kinh Thư) - 380 trang
- Dịch Kinh (Kinh Dịch) - 520 trang (High priority)

#### Approved (2)
- Lễ Ký - 320 trang
- Xuân Thu - 280 trang (High priority)

#### In Progress (5)
- Luận Ngữ - 350 trang, 65% (High priority)
- Mạnh Tử - 420 trang, 45%
- Đại Học - 150 trang, 30% (Urgent priority)
- Trung Dung - 180 trang, 55% (High priority)
- Tôn Tử Binh Pháp - 220 trang, 70%

#### Progress Checked (3)
- Đạo Đức Kinh - 290 trang, 85% (High priority)
- Trang Tử - 410 trang, 80%
- Mặc Tử - 340 trang, 88%

#### Completed (4)
- Hàn Phi Tử - 380 trang, 100%
- Tuân Tử - 310 trang, 100%
- Liệt Tử - 260 trang, 100%
- Quản Tử - 330 trang, 100%

## Troubleshooting

### Lỗi: Foreign key constraint violation
- Đảm bảo đã chạy Django migrations trước: `python manage.py migrate`
- Kiểm tra xem có admin user không: `SELECT * FROM users WHERE is_superuser = true`

### Lỗi: Duplicate key
- Script đã có cơ chế tránh duplicate, nhưng nếu vẫn gặp lỗi, uncomment phần DELETE ở đầu script

### Không thấy dữ liệu trong frontend
- Kiểm tra API endpoint: `http://localhost:8000/api/v1/works/board/`
- Đảm bảo Django server đang chạy
- Kiểm tra database connection trong Django settings

## So sánh với Django Seed Command

| Tính năng | SQL Script | Django Seed Command |
|----------|------------|---------------------|
| Password hash | Placeholder (cần update) | Đúng ngay từ đầu |
| Dễ sử dụng | Cần biết SQL | Chỉ cần chạy command |
| Tốc độ | Nhanh | Chậm hơn (ORM overhead) |
| Kiểm soát | Toàn quyền | Giới hạn bởi Django |
| Phù hợp | Production/Manual | Development |

## Liên quan

- [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) - Tài liệu database schema
- [SUMMARY.md](./SUMMARY.md) - Tóm tắt dự án
- Django seed command: `backend-django/works/management/commands/seed_works.py`

