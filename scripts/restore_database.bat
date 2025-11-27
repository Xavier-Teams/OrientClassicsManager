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

set /p BACKUP_FILE="Nhập tên file backup (ví dụ: backup_2024-01-01_10-30-00.dump): "

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
