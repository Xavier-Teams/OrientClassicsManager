@echo off
echo ========================================
echo   OrientClassicsManager Database Backup
echo ========================================

:: Thiết lập biến môi trường cho OrientClassicsManager
set PGPASSWORD=01092016
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=translation_db

:: Tạo thư mục backup nếu chưa có
if not exist "backups" mkdir backups

:: Tạo tên file với timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

echo 📊 Thông tin Database:
echo    - Tên DB: %DB_NAME%
echo    - Host: %DB_HOST%:%DB_PORT%
echo    - User: %DB_USER%
echo    - Thời gian: %timestamp%
echo.

echo 🔄 Đang sao lưu database OrientClassicsManager...

:: Sao lưu database với custom format (nén và nhanh hơn)
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -Fc -v --exclude-table-data="drizzle.__drizzle_migrations" > "backups\orient_classics_%timestamp%.dump"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Sao lưu thành công!
    echo 📁 File: backups\orient_classics_%timestamp%.dump
    
    :: Hiển thị kích thước file
    for %%I in ("backups\orient_classics_%timestamp%.dump") do echo 📏 Kích thước: %%~zI bytes
    
    echo.
    echo 📋 Nội dung đã sao lưu:
    echo    - Tất cả bảng dữ liệu
    echo    - Cấu trúc database
    echo    - Indexes và constraints
    echo    - Users và roles
    echo    - Functions và procedures
    echo    - Enums: user_role, translation_status, contract_status, etc.
    
) else (
    echo ❌ Sao lưu thất bại! Kiểm tra lại thông tin kết nối.
    echo.
    echo 🔍 Các bước kiểm tra:
    echo    1. PostgreSQL service đang chạy?
    echo    2. Thông tin user/password đúng?
    echo    3. Database '%DB_NAME%' tồn tại?
    echo    4. User có quyền truy cập database?
)

echo.
echo 🧹 Dọn dẹp backup cũ (giữ lại 7 ngày gần nhất)...
forfiles /p backups /s /m orient_classics_*.dump /d -7 /c "cmd /c del @path" 2>nul

echo.
echo 📊 Danh sách backup hiện có:
dir /b backups\orient_classics_*.dump 2>nul

echo ========================================
echo 💡 Lưu ý: 
echo    - File backup ở định dạng PostgreSQL custom
echo    - Để khôi phục, sử dụng script restore_database_orient.bat
echo    - Backup tự động xóa sau 7 ngày
echo ========================================
pause
