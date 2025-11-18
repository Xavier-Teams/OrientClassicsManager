# 🗄️ Hướng dẫn tạo Database mới hoàn toàn trong pgAdmin4

## Mục đích

Hướng dẫn chi tiết cách tạo database mới hoàn toàn cho dự án **Quản lý Dự án Kinh điển phương Đông** trong pgAdmin4, bao gồm cả schema và dữ liệu mẫu.

## 📋 Yêu cầu

- PostgreSQL đã được cài đặt và chạy
- pgAdmin4 đã được cài đặt
- Quyền tạo database (thường là user `postgres`)

## 🚀 Các bước thực hiện

### BƯỚC 1: Tạo Database mới trong pgAdmin4

1. **Mở pgAdmin4** và kết nối với PostgreSQL server

2. **Tạo Database mới:**
   - Click chuột phải vào **Databases** → **Create** → **Database...**
   - Trong tab **General**:
     - **Name**: `translation_db` (hoặc tên bạn muốn)
     - **Owner**: `postgres` (hoặc user của bạn)
     - **Comment**: `Database cho dự án Quản lý Dự án Kinh điển phương Đông`
   - Trong tab **Definition**:
     - **Encoding**: `UTF8` (mặc định)
     - **Template**: `template0` (khuyến nghị cho database mới)
   - Click **Save**

3. **Hoặc sử dụng SQL Query:**
   ```sql
   -- Tạo database mới
   CREATE DATABASE translation_db
       WITH 
       OWNER = postgres
       ENCODING = 'UTF8'
       LC_COLLATE = 'Vietnamese_Vietnam.1258'
       LC_CTYPE = 'Vietnamese_Vietnam.1258'
       TEMPLATE = template0;
   
   -- Kết nối vào database mới
   \c translation_db
   ```

### BƯỚC 2: Tạo Schema từ Django Migrations

Có 2 cách để tạo schema:

#### Cách 1: Sử dụng Django Migrations (Khuyến nghị)

1. **Mở Terminal/Command Prompt**

2. **Di chuyển đến thư mục backend-django:**
   ```bash
   cd backend-django
   ```

3. **Cập nhật file `.env` hoặc `settings.py`** với thông tin database mới:
   ```env
   DB_NAME=translation_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. **Chạy migrations:**
   ```bash
   python manage.py migrate
   ```

   Lệnh này sẽ tạo tất cả các bảng cần thiết:
   - `users` - Bảng người dùng
   - `translation_parts` - Hợp phần dịch thuật
   - `translation_works` - Tác phẩm dịch thuật
   - `translation_contracts` - Hợp đồng dịch thuật
   - Các bảng Django system (auth, sessions, admin, etc.)

#### Cách 2: Sử dụng SQL Script (Nếu không có Django)

Nếu bạn muốn tạo schema trực tiếp bằng SQL, sử dụng script `CREATE_SCHEMA.sql` (sẽ được tạo ở bước sau).

### BƯỚC 3: Insert dữ liệu mẫu

Sau khi đã có schema, chèn dữ liệu mẫu:

1. **Trong pgAdmin4:**
   - Click chuột phải vào database `translation_db`
   - Chọn **Query Tool**

2. **Mở file SQL_SEED_DATA.sql:**
   - File → Open → Chọn `Doc/SQL_SEED_DATA.sql`

3. **Chạy script:**
   - Click **Execute** (F5) hoặc nhấn **F5**
   - Script sẽ tự động:
     - Tạo Translation Part mặc định
     - Tạo 15 Translators
     - Tạo 17 Translation Works với đầy đủ trạng thái

4. **Kiểm tra kết quả:**
   ```sql
   -- Kiểm tra số lượng records
   SELECT 'Users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'Translation Parts', COUNT(*) FROM translation_parts
   UNION ALL
   SELECT 'Translation Works', COUNT(*) FROM translation_works;
   ```

### BƯỚC 4: Tạo Superuser (Admin)

Để có thể đăng nhập vào Django Admin:

1. **Chạy Django command:**
   ```bash
   cd backend-django
   python manage.py createsuperuser
   ```

2. **Hoặc insert trực tiếp bằng SQL:**
   ```sql
   -- Lưu ý: Password hash này là cho password "admin123"
   -- Nên sử dụng Django createsuperuser để có password hash đúng
   INSERT INTO users (
       username, email, password, full_name, role,
       is_superuser, is_staff, is_active, active,
       date_joined, created_at, updated_at
   )
   VALUES (
       'admin',
       'admin@orientclassics.vn',
       'pbkdf2_sha256$600000$...', -- Sử dụng Django để tạo hash đúng
       'Administrator',
       'thu_ky_hop_phan',
       true,
       true,
       true,
       true,
       NOW(),
       NOW(),
       NOW()
   );
   ```

## 📊 Kiểm tra Database

Sau khi hoàn tất, kiểm tra database:

### 1. Kiểm tra Tables

```sql
-- Xem tất cả các bảng
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Kiểm tra Dữ liệu

```sql
-- Số lượng works theo trạng thái
SELECT 
    state,
    COUNT(*) as count,
    ROUND(AVG(translation_progress), 2) as avg_progress
FROM translation_works
WHERE active = true
GROUP BY state
ORDER BY state;

-- Danh sách translators
SELECT 
    username,
    full_name,
    email,
    role
FROM users
WHERE role = 'dich_gia'
ORDER BY full_name;

-- Chi tiết works với translator
SELECT 
    w.id,
    w.name,
    w.author,
    w.state,
    w.priority,
    w.translation_progress,
    w.page_count,
    u.full_name as translator_name
FROM translation_works w
LEFT JOIN users u ON w.translator_id = u.id
WHERE w.active = true
ORDER BY w.state, w.name;
```

### 3. Kiểm tra Foreign Keys

```sql
-- Kiểm tra foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

## 🔧 Troubleshooting

### Lỗi: "database does not exist"

- Đảm bảo đã tạo database trước khi chạy migrations
- Kiểm tra tên database trong settings.py có đúng không

### Lỗi: "permission denied"

- Đảm bảo user có quyền CREATE DATABASE
- Hoặc sử dụng user `postgres` (superuser)

### Lỗi: "relation already exists"

- Database đã có schema, cần xóa các bảng cũ hoặc tạo database mới
- Hoặc chạy `python manage.py migrate --fake` nếu muốn giữ nguyên schema

### Lỗi: Foreign key constraint violation

- Đảm bảo đã chạy migrations trước khi insert data
- Kiểm tra thứ tự insert (users trước, sau đó mới đến works)

### Không thấy dữ liệu trong Django Admin

- Kiểm tra `AUTH_USER_MODEL` trong settings.py
- Đảm bảo đã tạo superuser
- Kiểm tra database connection trong Django

## 📝 Tóm tắt các file cần thiết

1. **SQL_SEED_DATA.sql** - Script chứa dữ liệu mẫu (17 works, 15 translators)
2. **PGADMIN4_SETUP_GUIDE.md** - File này (hướng dẫn chi tiết)
3. **Django migrations** - Tự động tạo schema khi chạy `python manage.py migrate`

## ✅ Checklist hoàn thành

- [ ] Database `translation_db` đã được tạo
- [ ] Đã chạy Django migrations (`python manage.py migrate`)
- [ ] Đã chạy SQL seed script (`SQL_SEED_DATA.sql`)
- [ ] Đã tạo superuser (`python manage.py createsuperuser`)
- [ ] Đã kiểm tra dữ liệu trong pgAdmin4
- [ ] Đã test kết nối Django với database mới
- [ ] Đã test API endpoint `/api/v1/works/board/`

## 🎯 Kết quả mong đợi

Sau khi hoàn tất, bạn sẽ có:

- ✅ Database `translation_db` với đầy đủ schema
- ✅ 1 Translation Part (DEFAULT)
- ✅ 15 Translators (users với role 'dich_gia')
- ✅ 17 Translation Works phân loại theo trạng thái
- ✅ 1 Superuser để đăng nhập Django Admin
- ✅ Tất cả foreign keys và constraints đã được thiết lập

## 📚 Tài liệu liên quan

- [SQL_SEED_DATA_README.md](./SQL_SEED_DATA_README.md) - Hướng dẫn sử dụng SQL seed script
- [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) - Tài liệu database schema
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn setup tổng thể

---

**Lưu ý**: Nếu gặp vấn đề, hãy kiểm tra logs trong pgAdmin4 hoặc Django console để xem chi tiết lỗi.

