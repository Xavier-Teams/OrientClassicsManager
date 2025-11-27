@echo off
echo ========================================
echo  OrientClassicsManager Database Restore
echo ========================================

:: Thiết lập biến môi trường cho OrientClassicsManager
set PGPASSWORD=01092016
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=translation_db

echo 📊 Thông tin Database:
echo    - Tên DB: %DB_NAME%
echo    - Host: %DB_HOST%:%DB_PORT%
echo    - User: %DB_USER%
echo.

echo 📁 Các file backup có sẵn:
echo ========================================
dir /b backups\orient_classics_*.dump 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Không tìm thấy file backup nào!
    echo 💡 Hãy chạy backup_database_orient.bat trước.
    pause
    exit /b 1
)
echo ========================================

set /p BACKUP_FILE="📥 Nhập tên file backup (ví dụ: orient_classics_2024-01-01_10-30-00.dump): "

if not exist "backups\%BACKUP_FILE%" (
    echo ❌ File không tồn tại: backups\%BACKUP_FILE%
    pause
    exit /b 1
)

echo.
echo 📋 Thông tin file backup:
for %%I in ("backups\%BACKUP_FILE%") do (
    echo    - File: %%~nxI
    echo    - Kích thước: %%~zI bytes
    echo    - Ngày tạo: %%~tI
)

echo.
echo ⚠️  CẢNH BÁO QUAN TRỌNG:
echo    🔥 Thao tác này sẽ XÓA HOÀN TOÀN database hiện tại!
echo    🔥 Tất cả dữ liệu trong '%DB_NAME%' sẽ bị mất!
echo    🔥 Bao gồm: users, contracts, translations, payments, etc.
echo.
set /p CONFIRM="❓ Bạn có CHẮC CHẮN muốn tiếp tục? Gõ 'YES' để xác nhận: "

if /i not "%CONFIRM%"=="YES" (
    echo ✋ Đã hủy thao tác khôi phục.
    pause
    exit /b 0
)

echo.
echo 🔄 Bắt đầu quá trình khôi phục...

echo 1️⃣ Ngắt kết nối hiện tại đến database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%DB_NAME%' AND pid <> pg_backend_pid();" 2>nul

echo 2️⃣ Xóa database cũ...
dropdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Đã xóa database cũ
) else (
    echo    ⚠️  Database có thể không tồn tại (bỏ qua)
)

echo 3️⃣ Tạo database mới...
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% -E UTF8 -T template0
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Không thể tạo database mới!
    pause
    exit /b 1
)
echo    ✅ Đã tạo database mới

echo 4️⃣ Khôi phục dữ liệu từ backup...
pg_restore -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -v -c --if-exists "backups\%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Khôi phục thành công!
    echo.
    echo 📊 Dữ liệu đã khôi phục:
    echo    - Tất cả bảng và dữ liệu
    echo    - Users và roles
    echo    - Enums và constraints
    echo    - Indexes và sequences
    echo    - Functions và procedures
    
    echo.
    echo 🔍 Kiểm tra database sau khôi phục...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\dt" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Database hoạt động bình thường
    )
    
) else (
    echo ❌ Khôi phục thất bại!
    echo.
    echo 🔍 Các nguyên nhân có thể:
    echo    1. File backup bị hỏng
    echo    2. Không đủ quyền truy cập
    echo    3. Version PostgreSQL không tương thích
    echo    4. Thiếu extensions cần thiết
)

echo.
echo 📝 Các bước tiếp theo:
echo    1. Cập nhật DATABASE_URL trong file .env
echo    2. Chạy migrations nếu cần: npm run db:push
echo    3. Restart ứng dụng: npm run dev
echo    4. Kiểm tra kết nối từ ứng dụng

echo ========================================
pause
