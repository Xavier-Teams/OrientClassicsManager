# 🗄️ Hướng dẫn Sao lưu và Khôi phục PostgreSQL

> **Mục đích**: Hướng dẫn chi tiết cách sao lưu và khôi phục cơ sở dữ liệu PostgreSQL để có thể sử dụng trên máy tính khác.

## 📋 Mục lục

- [📤 Phần 1: Sao lưu dữ liệu (Backup)](#-phần-1-sao-lưu-dữ-liệu-backup)
- [📥 Phần 2: Khôi phục dữ liệu (Restore)](#-phần-2-khôi-phục-dữ-liệu-restore)
- [🔧 Phần 3: Script tự động](#-phần-3-script-tự-động)
- [🚀 Phần 4: Hướng dẫn sử dụng](#-phần-4-hướng-dẫn-sử-dụng)
- [💡 Phần 5: Tips quan trọng](#-phần-5-tips-quan-trọng)
- [📋 Checklist di chuyển](#-checklist-di-chuyển-database)

---

## 📤 Phần 1: Sao lưu dữ liệu (Backup)

### 🔧 Cách 1: Sử dụng pg_dump (Khuyến nghị)

#### Sao lưu cơ bản
```bash
# Sao lưu toàn bộ database
pg_dump -h localhost -U username -d database_name > backup_file.sql

# Sao lưu với định dạng custom (nén, nhanh hơn)
pg_dump -h localhost -U username -d database_name -Fc > backup_file.dump

# Sao lưu với thông tin chi tiết
pg_dump -h localhost -U username -d database_name -v -f backup_file.sql
```

#### Các tùy chọn nâng cao
```bash
# Sao lưu chỉ cấu trúc (không có dữ liệu)
pg_dump -h localhost -U username -d database_name -s > schema_only.sql

# Sao lưu chỉ dữ liệu (không có cấu trúc)
pg_dump -h localhost -U username -d database_name -a > data_only.sql

# Sao lưu với nén gzip
pg_dump -h localhost -U username -d database_name | gzip > backup_file.sql.gz

# Sao lưu từng bảng cụ thể
pg_dump -h localhost -U username -d database_name -t table_name > table_backup.sql
```

### 🖥️ Cách 2: Sao lưu qua pgAdmin

1. **Mở pgAdmin**
2. **Kết nối** đến database server
3. **Chuột phải** vào database → **Backup...**
4. **Cấu hình backup**:
   - **Format**: Plain (SQL) hoặc Custom
   - **Compression**: Chọn mức nén (0-9)
   - **Encoding**: UTF8 (khuyến nghị)
5. **Chọn đường dẫn** lưu file
6. **Click Backup**

### 🌐 Cách 3: Sao lưu toàn bộ PostgreSQL cluster

```bash
# Sao lưu tất cả databases và users
pg_dumpall -h localhost -U postgres > all_databases.sql

# Chỉ sao lưu users và roles
pg_dumpall -h localhost -U postgres -r > roles_only.sql

# Chỉ sao lưu tablespaces
pg_dumpall -h localhost -U postgres -t > tablespaces_only.sql
```

---

## 📥 Phần 2: Khôi phục dữ liệu (Restore)

### 🔧 Cách 1: Khôi phục bằng psql

#### Khôi phục cơ bản
```bash
# Tạo database mới trước
createdb -h localhost -U username new_database_name

# Khôi phục từ file SQL
psql -h localhost -U username -d new_database_name < backup_file.sql

# Khôi phục từ file nén
gunzip -c backup_file.sql.gz | psql -h localhost -U username -d new_database_name
```

#### Khôi phục từ custom format
```bash
# Khôi phục từ file custom format
pg_restore -h localhost -U username -d new_database_name backup_file.dump

# Khôi phục với các tùy chọn
pg_restore -h localhost -U username -d new_database_name -v -c backup_file.dump

# Khôi phục chỉ một bảng cụ thể
pg_restore -h localhost -U username -d new_database_name -t table_name backup_file.dump
```

### 🖥️ Cách 2: Khôi phục qua pgAdmin

1. **Tạo database mới** trong pgAdmin
2. **Chuột phải** vào database → **Restore...**
3. **Chọn file backup**
4. **Cấu hình restore**:
   - **Format**: Tương ứng với file backup
   - **Role name**: User sở hữu objects
   - **Sections**: Data, Schema, hoặc cả hai
5. **Click Restore**

---

## 🔧 Phần 3: Script tự động

### 📄 Script Backup (backup_database.bat)

```batch
@echo off
echo ========================================
echo    PostgreSQL Database Backup Script
echo ========================================

:: Thiết lập biến môi trường
set PGPASSWORD=your_password
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=your_username
set DB_NAME=orient_classics_manager

:: Tạo thư mục backup nếu chưa có
if not exist "backups" mkdir backups

:: Tạo tên file với timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

echo Đang sao lưu database: %DB_NAME%
echo Thời gian: %timestamp%

:: Sao lưu database
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -Fc > "backups\%DB_NAME%_backup_%timestamp%.dump"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Sao lưu thành công!
    echo 📁 File: backups\%DB_NAME%_backup_%timestamp%.dump
) else (
    echo ❌ Sao lưu thất bại!
)

:: Xóa các file backup cũ hơn 7 ngày
forfiles /p backups /s /m *.dump /d -7 /c "cmd /c del @path" 2>nul

echo ========================================
pause
```

### 📄 Script Restore (restore_database.bat)

```batch
@echo off
echo ========================================
echo   PostgreSQL Database Restore Script
echo ========================================

:: Thiết lập biến môi trường
set PGPASSWORD=your_password
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=your_username
set DB_NAME=orient_classics_manager

echo Các file backup có sẵn:
echo ========================================
dir /b backups\*.dump 2>nul
echo ========================================

set /p BACKUP_FILE="Nhập tên file backup: "

if not exist "backups\%BACKUP_FILE%" (
    echo ❌ File không tồn tại!
    pause
    exit /b 1
)

echo.
echo ⚠️  CẢNH BÁO: Thao tác này sẽ XÓA toàn bộ dữ liệu hiện tại!
set /p CONFIRM="Bạn có chắc chắn muốn tiếp tục? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo Đã hủy thao tác.
    pause
    exit /b 0
)

echo Đang xóa database cũ...
dropdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% 2>nul

echo Đang tạo database mới...
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%

echo Đang khôi phục dữ liệu...
pg_restore -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% "backups\%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Khôi phục thành công!
) else (
    echo ❌ Khôi phục thất bại!
)

echo ========================================
pause
```

---

## 🚀 Phần 4: Hướng dẫn sử dụng

### Bước 1: Cấu hình Script

1. **Mở file** `scripts/backup_database.bat`
2. **Thay đổi các thông tin**:
   ```batch
   set PGPASSWORD=your_password      → Mật khẩu PostgreSQL của bạn
   set DB_USER=your_username         → Tên user PostgreSQL của bạn
   set DB_NAME=orient_classics_manager → Tên database của bạn
   ```

### Bước 2: Thực hiện Sao lưu

```bash
# Chạy script sao lưu
scripts\backup_database.bat
```

**Kết quả**: File backup sẽ được tạo trong thư mục `backups/` với tên có timestamp.

### Bước 3: Chuyển sang máy khác

1. **Copy thư mục** `backups` sang máy mới
2. **Cài đặt PostgreSQL** trên máy mới (cùng version hoặc mới hơn)
3. **Copy script** `restore_database.bat`
4. **Cấu hình script** với thông tin máy mới
5. **Chạy script khôi phục**

### Bước 4: Khôi phục dữ liệu

```bash
# Chạy script khôi phục
scripts\restore_database.bat
```

---

## 💡 Phần 5: Tips quan trọng

### 🔒 Bảo mật

- **Không lưu mật khẩu** trực tiếp trong script nếu chia sẻ
- **Sử dụng `.pgpass` file** để lưu mật khẩu an toàn:
  ```
  # File: %APPDATA%\postgresql\pgpass.conf (Windows)
  # Format: hostname:port:database:username:password
  localhost:5432:*:myuser:mypassword
  ```
- **Mã hóa file backup** nếu chứa dữ liệu nhạy cảm:
  ```bash
  # Mã hóa
  gpg -c backup_file.dump
  
  # Giải mã
  gpg backup_file.dump.gpg
  ```

### ⚡ Hiệu suất

- **Custom format** (`-Fc`) nhanh hơn và nhỏ hơn Plain SQL
- **Nén file backup**:
  ```bash
  gzip backup_file.sql
  ```
- **Sao lưu song song** (parallel):
  ```bash
  pg_dump -j 4 -Fd -f backup_directory database_name
  ```
- **Sao lưu từng bảng** nếu database lớn

### 🔄 Tự động hóa

#### Windows Task Scheduler
1. Mở **Task Scheduler**
2. **Create Basic Task**
3. **Trigger**: Daily/Weekly
4. **Action**: Start a program
5. **Program**: `C:\path\to\backup_database.bat`

#### Cron Job (Linux/WSL)
```bash
# Backup hàng ngày lúc 2:00 AM
0 2 * * * /path/to/backup_script.sh
```

### 🌐 Kết nối Remote

```bash
# Backup từ server remote
pg_dump -h remote_server.com -p 5432 -U username -d database_name > backup.sql

# Với SSL
pg_dump -h remote_server.com -p 5432 -U username -d database_name --sslmode=require > backup.sql

# Với SSH tunnel
ssh -L 5433:localhost:5432 user@remote_server
pg_dump -h localhost -p 5433 -U username -d database_name > backup.sql
```

### 🔍 Kiểm tra và Xác thực

```bash
# Kiểm tra file backup
pg_restore --list backup_file.dump

# Xác thực backup
pg_restore --schema-only backup_file.dump | psql -d test_database

# So sánh databases
pg_dump -s database1 > schema1.sql
pg_dump -s database2 > schema2.sql
diff schema1.sql schema2.sql
```

---

## 📋 Checklist di chuyển Database

### Trước khi di chuyển
- [ ] ✅ **Dừng ứng dụng** để tránh thay đổi dữ liệu
- [ ] ✅ **Kiểm tra dung lượng** database
- [ ] ✅ **Ghi chú version** PostgreSQL hiện tại
- [ ] ✅ **Backup cấu hình** PostgreSQL (postgresql.conf, pg_hba.conf)

### Thực hiện backup
- [ ] ✅ **Tạo backup** trên máy cũ
- [ ] ✅ **Kiểm tra file backup** (không bị lỗi)
- [ ] ✅ **Nén và mã hóa** nếu cần
- [ ] ✅ **Copy backup** sang máy mới

### Cài đặt máy mới
- [ ] ✅ **Cài đặt PostgreSQL** (cùng version hoặc mới hơn)
- [ ] ✅ **Cấu hình PostgreSQL** (port, memory, etc.)
- [ ] ✅ **Tạo user** và **database** mới
- [ ] ✅ **Cấu hình quyền** truy cập

### Khôi phục dữ liệu
- [ ] ✅ **Khôi phục dữ liệu** từ backup
- [ ] ✅ **Kiểm tra dữ liệu** sau khôi phục
- [ ] ✅ **Kiểm tra indexes** và **constraints**
- [ ] ✅ **Cập nhật statistics**:
  ```sql
  ANALYZE;
  ```

### Cập nhật ứng dụng
- [ ] ✅ **Cập nhật connection string** trong ứng dụng
- [ ] ✅ **Test kết nối** database
- [ ] ✅ **Test các chức năng** chính của ứng dụng
- [ ] ✅ **Monitor performance** sau di chuyển

### Hoàn tất
- [ ] ✅ **Backup lại** sau khi di chuyển thành công
- [ ] ✅ **Cập nhật tài liệu** hệ thống
- [ ] ✅ **Thông báo** cho team về thay đổi
- [ ] ✅ **Lên lịch backup** định kỳ cho máy mới

---

## 🆘 Xử lý sự cố

### Lỗi thường gặp

#### 1. "FATAL: password authentication failed"
```bash
# Kiểm tra user và password
psql -h localhost -U username -d postgres -c "\du"

# Reset password
ALTER USER username PASSWORD 'new_password';
```

#### 2. "database does not exist"
```bash
# Tạo database trước khi restore
createdb -h localhost -U username database_name
```

#### 3. "permission denied"
```bash
# Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE database_name TO username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO username;
```

#### 4. "version mismatch"
```bash
# Kiểm tra version
pg_dump --version
psql --version

# Sử dụng pg_dump của version mới hơn
```

### Recovery từ backup bị lỗi

```bash
# Restore từng phần
pg_restore --schema-only backup_file.dump  # Chỉ cấu trúc
pg_restore --data-only backup_file.dump    # Chỉ dữ liệu

# Bỏ qua lỗi và tiếp tục
pg_restore --exit-on-error backup_file.dump
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình sao lưu/khôi phục:

1. **Kiểm tra log** PostgreSQL
2. **Xem documentation** chính thức: https://www.postgresql.org/docs/
3. **Tham khảo** PostgreSQL Wiki
4. **Liên hệ** admin hệ thống

---

*Tài liệu này được tạo cho dự án OrientClassicsManager. Cập nhật lần cuối: $(Get-Date -Format "yyyy-MM-dd")*
