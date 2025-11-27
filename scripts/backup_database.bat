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
