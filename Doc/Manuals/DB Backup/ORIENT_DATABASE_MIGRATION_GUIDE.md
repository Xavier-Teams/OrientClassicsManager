# 🗄️ Hướng dẫn Di chuyển Database OrientClassicsManager

> **Dành riêng cho dự án OrientClassicsManager** - Hướng dẫn chi tiết sao lưu, di chuyển và khôi phục database PostgreSQL.

## 📋 Mục lục

- [🎯 Thông tin dự án](#-thông-tin-dự-án)
- [⚡ Quick Start](#-quick-start)
- [🔧 Scripts tự động](#-scripts-tự-động)
- [📤 Sao lưu Database](#-sao-lưu-database)
- [📥 Khôi phục Database](#-khôi-phục-database)
- [🚀 Thiết lập Database mới](#-thiết-lập-database-mới)
- [🔍 Kiểm tra Health](#-kiểm-tra-health)
- [📋 Checklist di chuyển](#-checklist-di-chuyển)
- [🆘 Xử lý sự cố](#-xử-lý-sự-cố)

---

## 🎯 Thông tin dự án

### Database Schema
- **Database Name**: `orient_classics_manager`
- **User**: `orient_user`
- **Technology**: PostgreSQL + Drizzle ORM
- **Port**: 5432 (default)

### Cấu trúc chính
```
OrientClassicsManager Database:
├── Users & Roles (user_role enum)
├── Contracts (contract_status enum)  
├── Translations (translation_status enum)
├── Payments & Categories
├── Works & Tasks
├── Reviews & Evaluations
└── File Uploads & Templates
```

### Enums quan trọng
- `user_role`: chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky, etc.
- `translation_status`: draft, approved, in_progress, completed, etc.
- `contract_status`: draft, pending_approval, approved, etc.

---

## ⚡ Quick Start

### 🔥 Sao lưu nhanh
```bash
scripts\backup_database_orient.bat
```

### 🔥 Khôi phục nhanh  
```bash
scripts\restore_database_orient.bat
```

### 🔥 Thiết lập database mới
```bash
scripts\setup_database_orient.bat
```

### 🔥 Kiểm tra health
```bash
scripts\check_database_orient.bat
```

---

## 🔧 Scripts tự động

### 📄 backup_database_orient.bat
**Chức năng**: Sao lưu database OrientClassicsManager
```batch
# Tự động tạo file backup với timestamp
# Format: orient_classics_YYYY-MM-DD_HH-MM-SS.dump
# Loại trừ migration tables
# Tự động xóa backup cũ hơn 7 ngày
```

**Cấu hình**:
```batch
set DB_NAME=orient_classics_manager
set DB_USER=postgres  
set DB_HOST=localhost
set DB_PORT=5432
```

### 📄 restore_database_orient.bat
**Chức năng**: Khôi phục database từ backup
```batch
# Hiển thị danh sách backup có sẵn
# Xác nhận trước khi xóa database cũ
# Tạo database mới và khôi phục dữ liệu
# Kiểm tra tính toàn vẹn sau khôi phục
```

### 📄 setup_database_orient.bat  
**Chức năng**: Thiết lập database từ đầu
```batch
# Tạo database và user mới
# Cấp quyền truy cập
# Tạo file .env template
# Chạy migrations
# Kiểm tra cấu trúc
```

### 📄 check_database_orient.bat
**Chức năng**: Kiểm tra sức khỏe database
```batch
# Kiểm tra kết nối PostgreSQL
# Xác minh database và user tồn tại
# Kiểm tra cấu trúc bảng và enums
# Kiểm tra dữ liệu và kích thước
# Xác minh file .env
```

---

## 📤 Sao lưu Database

### Cách 1: Sử dụng Script (Khuyến nghị)

```bash
# Chạy script backup
scripts\backup_database_orient.bat
```

**Kết quả**:
- File backup: `backups\orient_classics_2024-01-01_10-30-00.dump`
- Format: PostgreSQL custom (nén, nhanh)
- Bao gồm: Tất cả dữ liệu, cấu trúc, enums, constraints
- Loại trừ: Migration metadata

### Cách 2: Manual Command

```bash
# Backup cơ bản
pg_dump -h localhost -U postgres -d orient_classics_manager -Fc > backup.dump

# Backup với options đầy đủ
pg_dump -h localhost -U postgres -d orient_classics_manager \
  -Fc -v --exclude-table-data="drizzle.__drizzle_migrations" \
  > orient_classics_backup.dump
```

### Cách 3: Backup qua pgAdmin

1. **Kết nối** đến database `orient_classics_manager`
2. **Right-click** → Backup
3. **Format**: Custom
4. **Options**: 
   - Include data: Yes
   - Include schema: Yes
   - Compression: 6-9

---

## 📥 Khôi phục Database

### Cách 1: Sử dụng Script (Khuyến nghị)

```bash
# Chạy script restore
scripts\restore_database_orient.bat

# Nhập tên file backup khi được hỏi
# Ví dụ: orient_classics_2024-01-01_10-30-00.dump
```

**Quá trình**:
1. Hiển thị danh sách backup
2. Xác nhận xóa database cũ
3. Tạo database mới
4. Khôi phục dữ liệu
5. Kiểm tra tính toàn vẹn

### Cách 2: Manual Command

```bash
# Tạo database mới
createdb -h localhost -U postgres orient_classics_manager -E UTF8

# Khôi phục từ backup
pg_restore -h localhost -U postgres -d orient_classics_manager \
  -v -c --if-exists backup.dump
```

### Cách 3: Restore qua pgAdmin

1. **Tạo database mới**: `orient_classics_manager`
2. **Right-click** database → Restore
3. **Chọn file** backup
4. **Options**:
   - Clean before restore: Yes
   - Create database: No (đã tạo rồi)

---

## 🚀 Thiết lập Database mới

### Thiết lập tự động

```bash
# Chạy script setup hoàn chỉnh
scripts\setup_database_orient.bat
```

**Script sẽ thực hiện**:
1. ✅ Tạo database `orient_classics_manager`
2. ✅ Tạo user `orient_user` 
3. ✅ Cấp quyền truy cập
4. ✅ Tạo file `.env` template
5. ✅ Chạy Drizzle migrations
6. ✅ Kiểm tra cấu trúc

### Thiết lập thủ công

#### Bước 1: Tạo Database
```sql
CREATE DATABASE orient_classics_manager 
  WITH ENCODING 'UTF8' 
  TEMPLATE template0;
```

#### Bước 2: Tạo User
```sql
CREATE USER orient_user WITH PASSWORD 'orient_password_2024';
```

#### Bước 3: Cấp quyền
```sql
GRANT ALL PRIVILEGES ON DATABASE orient_classics_manager TO orient_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO orient_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO orient_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO orient_user;
```

#### Bước 4: Cấu hình .env
```bash
# Copy template
copy scripts\env.template .env

# Cập nhật DATABASE_URL
DATABASE_URL=postgresql://orient_user:orient_password_2024@localhost:5432/orient_classics_manager
```

#### Bước 5: Chạy Migrations
```bash
npm run db:push
```

#### Bước 6: Tạo dữ liệu mẫu (optional)
```bash
npm run db:seed
```

---

## 🔍 Kiểm tra Health

### Health Check tự động

```bash
scripts\check_database_orient.bat
```

**Kiểm tra**:
- ✅ PostgreSQL service
- ✅ Database existence
- ✅ User permissions
- ✅ Table structure
- ✅ Enums
- ✅ Sample data
- ✅ Database size
- ✅ Active connections
- ✅ .env configuration

### Kiểm tra thủ công

```sql
-- Kiểm tra database
SELECT current_database(), current_user;

-- Kiểm tra bảng
\dt

-- Kiểm tra enums
SELECT typname FROM pg_type WHERE typtype = 'e';

-- Kiểm tra dữ liệu
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM contracts;
SELECT COUNT(*) FROM translations;

-- Kiểm tra kích thước
SELECT pg_size_pretty(pg_database_size('orient_classics_manager'));
```

---

## 📋 Checklist di chuyển

### 📋 Máy cũ (Source)

#### Chuẩn bị
- [ ] ✅ Dừng ứng dụng OrientClassicsManager
- [ ] ✅ Kiểm tra version PostgreSQL: `SELECT version();`
- [ ] ✅ Kiểm tra kích thước database
- [ ] ✅ Backup file uploads trong `uploads/`

#### Sao lưu
- [ ] ✅ Chạy `scripts\backup_database_orient.bat`
- [ ] ✅ Kiểm tra file backup được tạo
- [ ] ✅ Verify backup: `pg_restore --list backup.dump`
- [ ] ✅ Copy backup sang máy mới

### 📋 Máy mới (Target)

#### Cài đặt
- [ ] ✅ Cài đặt PostgreSQL (cùng version hoặc mới hơn)
- [ ] ✅ Cài đặt Node.js và npm
- [ ] ✅ Clone source code OrientClassicsManager
- [ ] ✅ Chạy `npm install`

#### Thiết lập Database
- [ ] ✅ Copy backup file vào thư mục `backups/`
- [ ] ✅ Chạy `scripts\restore_database_orient.bat`
- [ ] ✅ Hoặc chạy `scripts\setup_database_orient.bat` (database mới)
- [ ] ✅ Cấu hình file `.env`

#### Kiểm tra
- [ ] ✅ Chạy `scripts\check_database_orient.bat`
- [ ] ✅ Chạy `npm run dev` để test ứng dụng
- [ ] ✅ Kiểm tra login và các chức năng chính
- [ ] ✅ Copy file uploads từ máy cũ

#### Hoàn tất
- [ ] ✅ Cập nhật DNS/IP nếu cần
- [ ] ✅ Thông báo team về địa chỉ mới
- [ ] ✅ Lên lịch backup định kỳ
- [ ] ✅ Tài liệu hóa thay đổi

---

## 🆘 Xử lý sự cố

### ❌ Lỗi kết nối PostgreSQL

**Triệu chứng**: `FATAL: password authentication failed`

**Giải pháp**:
```bash
# Kiểm tra service
net start postgresql-x64-14

# Reset password
psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"

# Kiểm tra pg_hba.conf
# Đảm bảo có dòng: local all all md5
```

### ❌ Database không tồn tại

**Triệu chứng**: `database "orient_classics_manager" does not exist`

**Giải pháp**:
```bash
# Tạo database
createdb -U postgres orient_classics_manager

# Hoặc chạy setup script
scripts\setup_database_orient.bat
```

### ❌ User không có quyền

**Triệu chứng**: `permission denied for database`

**Giải pháp**:
```sql
-- Cấp quyền đầy đủ
GRANT ALL PRIVILEGES ON DATABASE orient_classics_manager TO orient_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO orient_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO orient_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO orient_user;
```

### ❌ Backup file bị lỗi

**Triệu chứng**: `pg_restore: error: input file appears to be a text format dump`

**Giải pháp**:
```bash
# Nếu backup là SQL text
psql -U postgres -d orient_classics_manager < backup.sql

# Nếu backup bị corrupt, tạo backup mới
pg_dump -U postgres -d orient_classics_manager -Fc > new_backup.dump
```

### ❌ Version không tương thích

**Triệu chứng**: `pg_restore: server version mismatch`

**Giải pháp**:
```bash
# Sử dụng pg_dump của version mới hơn
"C:\Program Files\PostgreSQL\14\bin\pg_dump" -U postgres ...

# Hoặc export sang SQL format
pg_dump -U postgres -d orient_classics_manager > backup.sql
```

### ❌ Enums bị thiếu

**Triệu chứng**: `type "user_role" does not exist`

**Giải pháp**:
```bash
# Chạy lại migrations
npm run db:push

# Hoặc tạo enums thủ công
psql -U postgres -d orient_classics_manager -f shared/schema.sql
```

### ❌ File .env sai cấu hình

**Triệu chứng**: `DATABASE_URL must be set`

**Giải pháp**:
```bash
# Copy template
copy scripts\env.template .env

# Cập nhật DATABASE_URL
DATABASE_URL=postgresql://orient_user:orient_password_2024@localhost:5432/orient_classics_manager
```

---

## 📞 Hỗ trợ

### 🔧 Tools hữu ích

- **pgAdmin**: GUI quản lý PostgreSQL
- **DBeaver**: Universal database tool
- **VSCode PostgreSQL**: Extension cho VSCode

### 📚 Tài liệu tham khảo

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [OrientClassicsManager API Docs](./API_DOCUMENTATION.md)

### 🆘 Liên hệ

Nếu gặp vấn đề không thể giải quyết:
1. Kiểm tra logs PostgreSQL
2. Chạy `scripts\check_database_orient.bat`
3. Tham khảo file `TROUBLESHOOTING.md`
4. Liên hệ admin hệ thống

---

## 📝 Lịch sử cập nhật

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 2024-01-01 | 1.0 | Tạo hướng dẫn ban đầu |
| 2024-01-15 | 1.1 | Thêm scripts tự động |
| 2024-02-01 | 1.2 | Cập nhật troubleshooting |

---

*Tài liệu này được tạo riêng cho dự án **OrientClassicsManager**. Cập nhật lần cuối: 2024-11-27*
