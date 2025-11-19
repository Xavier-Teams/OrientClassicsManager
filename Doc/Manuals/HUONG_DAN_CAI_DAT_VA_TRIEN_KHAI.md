# Hướng Dẫn Cài Đặt và Triển Khai Hệ Thống

## Mục Lục
1. [Cài Đặt PostgreSQL Database](#1-cài-đặt-postgresql-database)
2. [Cài Đặt và Khởi Chạy Backend Django](#2-cài-đặt-và-khởi-chạy-backend-django)
3. [Cài Đặt và Khởi Chạy Frontend](#3-cài-đặt-và-khởi-chạy-frontend)
4. [Các Câu Lệnh SQL Thường Dùng](#4-các-câu-lệnh-sql-thường-dùng)

---

## 1. Cài Đặt PostgreSQL Database

### 1.1. Tải và Cài Đặt PostgreSQL

#### Windows:
1. Truy cập trang web: https://www.postgresql.org/download/windows/
2. Tải PostgreSQL Installer từ EnterpriseDB
3. Chạy file installer và làm theo hướng dẫn:
   - Chọn thư mục cài đặt (mặc định: `C:\Program Files\PostgreSQL\<version>`)
   - Chọn các components cần thiết:
     - PostgreSQL Server
     - pgAdmin 4 (công cụ quản lý database)
     - Stack Builder
     - Command Line Tools
   - Thiết lập mật khẩu cho user `postgres` (lưu ý: ghi nhớ mật khẩu này)
   - Chọn port mặc định: `5432`
   - Chọn locale: `Vietnamese, Vietnam`

#### Linux (Ubuntu/Debian):
```bash
# Cập nhật package list
sudo apt update

# Cài đặt PostgreSQL
sudo apt install postgresql postgresql-contrib

# Khởi động PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
# Sử dụng Homebrew
brew install postgresql@15

# Khởi động PostgreSQL
brew services start postgresql@15
```

### 1.2. Kiểm Tra Cài Đặt

Mở Command Prompt/Terminal và chạy:
```bash
psql --version
```

Nếu hiển thị version number, PostgreSQL đã được cài đặt thành công.

### 1.3. Tạo Database và User

#### Cách 1: Sử dụng psql Command Line

1. Mở Command Prompt/Terminal
2. Kết nối đến PostgreSQL:
```bash
# Windows
psql -U postgres

# Linux/macOS (có thể cần sudo)
sudo -u postgres psql
```

3. Nhập mật khẩu của user `postgres` khi được yêu cầu

4. Tạo database mới:
```sql
CREATE DATABASE translation_db;
```

5. Tạo user mới (tùy chọn):
```sql
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE translation_db TO your_username;
```

6. Kết nối đến database mới:
```sql
\c translation_db
```

7. Thoát psql:
```sql
\q
```

#### Cách 2: Sử dụng pgAdmin 4

1. Mở pgAdmin 4 từ Start Menu (Windows) hoặc Applications (Linux/macOS)
2. Kết nối đến PostgreSQL server:
   - Click chuột phải vào "Servers" → "Create" → "Server"
   - Tab "General": Nhập tên server (ví dụ: `Local PostgreSQL`)
   - Tab "Connection":
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: mật khẩu bạn đã thiết lập
   - Click "Save"
3. Tạo database:
   - Click chuột phải vào "Databases" → "Create" → "Database"
   - Database name: `translation_db`
   - Owner: `postgres`
   - Click "Save"

### 1.4. Cấu Hình Database cho Django

Tạo file `.env` trong thư mục `backend-django` với nội dung:

```env
# Database Configuration
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True

# OpenAI API (nếu sử dụng)
OPENAI_API_KEY=your-openai-api-key-here
```

**Lưu ý:** Thay `your_postgres_password` bằng mật khẩu bạn đã thiết lập cho user `postgres`.

---

## 2. Cài Đặt và Khởi Chạy Backend Django

### 2.1. Yêu Cầu Hệ Thống

- Python 3.8 trở lên
- PostgreSQL đã được cài đặt và cấu hình
- pip (Python package manager)

### 2.2. Kiểm Tra Python

Mở Command Prompt/Terminal và kiểm tra:
```bash
python --version
# hoặc
python3 --version
```

Nếu chưa có Python, tải và cài đặt từ: https://www.python.org/downloads/

### 2.3. Tạo Virtual Environment

#### Windows:
```bash
# Di chuyển đến thư mục dự án
cd D:\2. Vincent\DEV\OrientClassicsManager

# Tạo virtual environment
python -m venv venv-django

# Kích hoạt virtual environment
venv-django\Scripts\activate
```

#### Linux/macOS:
```bash
# Di chuyển đến thư mục dự án
cd /path/to/OrientClassicsManager

# Tạo virtual environment
python3 -m venv venv-django

# Kích hoạt virtual environment
source venv-django/bin/activate
```

Sau khi kích hoạt, bạn sẽ thấy `(venv-django)` ở đầu dòng lệnh.

### 2.4. Cài Đặt Dependencies

1. Di chuyển đến thư mục backend-django:
```bash
cd backend-django
```

2. Cài đặt các packages:
```bash
pip install -r requirements.txt
```

**Lưu ý:** Nếu gặp lỗi khi cài đặt `psycopg2-binary` trên Windows, có thể cần:
- Cài đặt Visual C++ Build Tools
- Hoặc sử dụng pre-compiled wheel: `pip install psycopg2-binary --only-binary :all:`

### 2.5. Cấu Hình Database

1. Đảm bảo file `.env` đã được tạo trong thư mục `backend-django` (xem phần 1.4)

2. Kiểm tra cấu hình trong `backend-django/config/settings.py`:
   - Database name, user, password phải khớp với file `.env`

### 2.6. Chạy Migrations

1. Tạo migrations (nếu có thay đổi models):
```bash
python manage.py makemigrations
```

2. Áp dụng migrations vào database:
```bash
python manage.py migrate
```

Lệnh này sẽ tạo các bảng cần thiết trong database.

### 2.7. Tạo Superuser (Admin)

Tạo tài khoản admin để truy cập Django Admin:
```bash
python manage.py createsuperuser
```

Nhập thông tin:
- Username: (ví dụ: `admin`)
- Email: (tùy chọn)
- Password: (nhập mật khẩu mạnh)

### 2.8. Khởi Chạy Server

#### Cách 1: Sử dụng run.bat (Windows)
```bash
# Từ thư mục backend-django
run.bat
```

#### Cách 2: Chạy thủ công
```bash
# Đảm bảo virtual environment đã được kích hoạt
# Windows
venv-django\Scripts\activate

# Linux/macOS
source venv-django/bin/activate

# Chạy server
cd backend-django
python manage.py runserver
```

Server sẽ chạy tại: `http://localhost:8000` hoặc `http://127.0.0.1:8000`

### 2.9. Kiểm Tra Server

1. Mở trình duyệt và truy cập:
   - API Root: `http://localhost:8000/api/`
   - Admin Panel: `http://localhost:8000/admin/`
   - Đăng nhập admin panel bằng superuser đã tạo

2. Kiểm tra logs trong terminal để xem các request và lỗi (nếu có)

### 2.10. Các Lệnh Hữu Ích Khác

```bash
# Xem danh sách migrations
python manage.py showmigrations

# Rollback migration cụ thể
python manage.py migrate app_name migration_number

# Tạo dữ liệu mẫu (nếu có script)
python manage.py loaddata fixtures/initial_data.json

# Chạy shell Django để tương tác với database
python manage.py shell

# Thu thập static files (cho production)
python manage.py collectstatic
```

---

## 3. Cài Đặt và Khởi Chạy Frontend

### 3.1. Yêu Cầu Hệ Thống

- Node.js 18.x trở lên
- npm hoặc yarn (đi kèm với Node.js)

### 3.2. Kiểm Tra Node.js

Mở Command Prompt/Terminal và kiểm tra:
```bash
node --version
npm --version
```

Nếu chưa có Node.js, tải và cài đặt từ: https://nodejs.org/

### 3.3. Cài Đặt Dependencies

1. Di chuyển đến thư mục gốc của dự án:
```bash
cd D:\2. Vincent\DEV\OrientClassicsManager
```

2. Cài đặt các packages:
```bash
npm install
```

Quá trình này có thể mất vài phút để tải tất cả dependencies.

### 3.4. Cấu Hình Environment Variables (Nếu Cần)

Nếu frontend cần biến môi trường, tạo file `.env` trong thư mục gốc:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

### 3.5. Khởi Chạy Development Server

```bash
npm run dev
```

Hoặc trên Windows:
```bash
npm run dev:win
```

Server sẽ chạy tại: `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

### 3.6. Build cho Production

```bash
npm run build
```

Files build sẽ được tạo trong thư mục `dist/public`.

### 3.7. Kiểm Tra Frontend

1. Mở trình duyệt và truy cập: `http://localhost:5173`
2. Kiểm tra console (F12) để xem các lỗi (nếu có)
3. Đảm bảo backend đang chạy để frontend có thể kết nối API

### 3.8. Các Lệnh Hữu Ích Khác

```bash
# Kiểm tra TypeScript types
npm run check

# Push database schema changes (nếu sử dụng Drizzle)
npm run db:push

# Seed database với dữ liệu mẫu
npm run db:seed
```

---

## 4. Các Câu Lệnh SQL Thường Dùng

### 4.1. Kết Nối Database

```bash
# Kết nối đến PostgreSQL
psql -U postgres -d translation_db

# Hoặc từ psql prompt
\c translation_db
```

### 4.2. Xem Thông Tin Database và Tables

```sql
-- Liệt kê tất cả databases
\l

-- Liệt kê tất cả tables trong database hiện tại
\dt

-- Xem cấu trúc của một table
\d table_name

-- Xem chi tiết table với các constraints
\d+ table_name

-- Liệt kê tất cả schemas
\dn

-- Liệt kê tất cả users/roles
\du
```

### 4.3. Truy Vấn Dữ Liệu (SELECT)

```sql
-- Xem tất cả dữ liệu trong table
SELECT * FROM table_name;

-- Xem dữ liệu với điều kiện
SELECT * FROM table_name WHERE column_name = 'value';

-- Xem một số cột cụ thể
SELECT column1, column2 FROM table_name;

-- Sắp xếp kết quả
SELECT * FROM table_name ORDER BY column_name ASC;
SELECT * FROM table_name ORDER BY column_name DESC;

-- Giới hạn số lượng kết quả
SELECT * FROM table_name LIMIT 10;

-- Đếm số lượng records
SELECT COUNT(*) FROM table_name;

-- Tìm kiếm với LIKE
SELECT * FROM table_name WHERE column_name LIKE '%keyword%';

-- Tìm kiếm với IN
SELECT * FROM table_name WHERE column_name IN ('value1', 'value2');

-- JOIN tables
SELECT t1.*, t2.* 
FROM table1 t1 
JOIN table2 t2 ON t1.id = t2.table1_id;
```

### 4.4. Chèn Dữ Liệu (INSERT)

```sql
-- Chèn một record
INSERT INTO table_name (column1, column2, column3) 
VALUES ('value1', 'value2', 'value3');

-- Chèn nhiều records cùng lúc
INSERT INTO table_name (column1, column2) 
VALUES 
  ('value1', 'value2'),
  ('value3', 'value4'),
  ('value5', 'value6');

-- Chèn với RETURNING (trả về record vừa chèn)
INSERT INTO table_name (column1, column2) 
VALUES ('value1', 'value2') 
RETURNING *;
```

### 4.5. Cập Nhật Dữ Liệu (UPDATE)

```sql
-- Cập nhật tất cả records
UPDATE table_name SET column_name = 'new_value';

-- Cập nhật với điều kiện
UPDATE table_name 
SET column1 = 'new_value1', column2 = 'new_value2' 
WHERE id = 1;

-- Cập nhật nhiều records với điều kiện
UPDATE table_name 
SET status = 'active' 
WHERE created_at < '2024-01-01';

-- Cập nhật với RETURNING
UPDATE table_name 
SET column_name = 'new_value' 
WHERE id = 1 
RETURNING *;
```

### 4.6. Xóa Dữ Liệu (DELETE)

```sql
-- Xóa với điều kiện
DELETE FROM table_name WHERE id = 1;

-- Xóa nhiều records
DELETE FROM table_name WHERE status = 'inactive';

-- Xóa tất cả records (CẨN THẬN!)
DELETE FROM table_name;

-- Xóa với RETURNING
DELETE FROM table_name 
WHERE id = 1 
RETURNING *;
```

### 4.7. Quản Lý Tables

```sql
-- Tạo table mới
CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm cột vào table
ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255);

-- Xóa cột khỏi table
ALTER TABLE table_name DROP COLUMN column_name;

-- Đổi tên cột
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;

-- Thay đổi kiểu dữ liệu của cột
ALTER TABLE table_name ALTER COLUMN column_name TYPE VARCHAR(500);

-- Thêm constraint
ALTER TABLE table_name ADD CONSTRAINT constraint_name UNIQUE (column_name);

-- Xóa constraint
ALTER TABLE table_name DROP CONSTRAINT constraint_name;

-- Đổi tên table
ALTER TABLE table_name RENAME TO new_table_name;

-- Xóa table (CẨN THẬN!)
DROP TABLE table_name;

-- Xóa table nếu tồn tại
DROP TABLE IF EXISTS table_name;
```

### 4.8. Quản Lý Indexes

```sql
-- Tạo index
CREATE INDEX index_name ON table_name (column_name);

-- Tạo unique index
CREATE UNIQUE INDEX index_name ON table_name (column_name);

-- Xóa index
DROP INDEX index_name;

-- Xem tất cả indexes
\di
```

### 4.9. Backup và Restore

```bash
# Backup database
pg_dump -U postgres -d translation_db > backup.sql

# Backup chỉ schema (không có data)
pg_dump -U postgres -d translation_db --schema-only > schema.sql

# Backup chỉ data (không có schema)
pg_dump -U postgres -d translation_db --data-only > data.sql

# Restore database
psql -U postgres -d translation_db < backup.sql

# Hoặc tạo database mới và restore
createdb -U postgres new_database
psql -U postgres -d new_database < backup.sql
```

### 4.10. Quản Lý Users và Permissions

```sql
-- Tạo user mới
CREATE USER username WITH PASSWORD 'password';

-- Đổi mật khẩu user
ALTER USER username WITH PASSWORD 'new_password';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE translation_db TO username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO username;

-- Thu hồi quyền
REVOKE ALL PRIVILEGES ON DATABASE translation_db FROM username;

-- Xóa user
DROP USER username;
```

### 4.11. Các Câu Lệnh Hữu Ích Khác

```sql
-- Xem thông tin về database size
SELECT pg_size_pretty(pg_database_size('translation_db'));

-- Xem thông tin về table size
SELECT pg_size_pretty(pg_total_relation_size('table_name'));

-- Xem các connections đang active
SELECT * FROM pg_stat_activity;

-- Kill một connection
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <process_id>;

-- Xem version PostgreSQL
SELECT version();

-- Xem thời gian hiện tại
SELECT NOW();
SELECT CURRENT_TIMESTAMP;

-- Format output
\x  -- Toggle expanded display
\pset border 2  -- Set border style
\timing  -- Show query execution time
```

### 4.12. Transactions

```sql
-- Bắt đầu transaction
BEGIN;

-- Thực hiện các thao tác
UPDATE table_name SET column1 = 'value1' WHERE id = 1;
INSERT INTO table_name (column1) VALUES ('value2');

-- Commit transaction (lưu thay đổi)
COMMIT;

-- Hoặc Rollback (hủy thay đổi)
ROLLBACK;
```

### 4.13. Export và Import Data

```sql
-- Export data ra CSV
\copy table_name TO 'C:\path\to\file.csv' CSV HEADER;

-- Import data từ CSV
\copy table_name FROM 'C:\path\to\file.csv' CSV HEADER;
```

**Lưu ý:** Đường dẫn file phải là đường dẫn tuyệt đối và user PostgreSQL phải có quyền truy cập.

---

## 5. Troubleshooting

### 5.1. Lỗi Kết Nối Database

**Lỗi:** `could not connect to server`
- Kiểm tra PostgreSQL service đã chạy chưa
- Windows: Services → PostgreSQL → Start
- Linux: `sudo systemctl start postgresql`
- Kiểm tra port 5432 có bị firewall chặn không

**Lỗi:** `password authentication failed`
- Kiểm tra lại mật khẩu trong file `.env`
- Đổi mật khẩu PostgreSQL nếu cần

### 5.2. Lỗi Django Migrations

**Lỗi:** `relation does not exist`
- Chạy lại migrations: `python manage.py migrate`
- Kiểm tra database name trong settings.py

**Lỗi:** `no such table`
- Đảm bảo đã chạy migrations: `python manage.py migrate`
- Kiểm tra app đã được thêm vào INSTALLED_APPS chưa

### 5.3. Lỗi Frontend

**Lỗi:** `Cannot find module`
- Xóa `node_modules` và `package-lock.json`
- Chạy lại `npm install`

**Lỗi:** `Port already in use`
- Đổi port trong `vite.config.ts`
- Hoặc kill process đang sử dụng port: `netstat -ano | findstr :5173` (Windows)

### 5.4. Lỗi CORS

Nếu frontend không kết nối được với backend:
- Kiểm tra CORS_ALLOWED_ORIGINS trong `settings.py`
- Đảm bảo URL frontend đã được thêm vào danh sách

---

## 6. Checklist Khởi Động Hệ Thống

Trước khi bắt đầu làm việc, đảm bảo:

- [ ] PostgreSQL đã được cài đặt và đang chạy
- [ ] Database `translation_db` đã được tạo
- [ ] File `.env` trong `backend-django` đã được cấu hình đúng
- [ ] Virtual environment Django đã được tạo và kích hoạt
- [ ] Dependencies Django đã được cài đặt (`pip install -r requirements.txt`)
- [ ] Migrations đã được chạy (`python manage.py migrate`)
- [ ] Superuser đã được tạo (`python manage.py createsuperuser`)
- [ ] Backend server đang chạy (`python manage.py runserver`)
- [ ] Node.js dependencies đã được cài đặt (`npm install`)
- [ ] Frontend server đang chạy (`npm run dev`)

---

## 7. Tài Liệu Tham Khảo

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Django Documentation: https://docs.djangoproject.com/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/

---

**Lưu ý:** Tài liệu này được cập nhật cho dự án OrientClassicsManager. Nếu có thay đổi trong cấu hình hoặc setup, vui lòng cập nhật lại tài liệu này.

