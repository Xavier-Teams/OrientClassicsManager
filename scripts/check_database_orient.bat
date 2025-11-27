@echo off
echo ========================================
echo OrientClassicsManager Database Health Check
echo ========================================

:: Thiết lập biến môi trường
set PGPASSWORD=your_password_here
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=orient_classics_manager
set APP_USER=orient_user

echo 📊 Kiểm tra Database: %DB_NAME%
echo    Host: %DB_HOST%:%DB_PORT%
echo    Time: %date% %time%
echo.

echo 🔍 1. Kiểm tra kết nối PostgreSQL...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT version();" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL service đang chạy
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT version();" | findstr PostgreSQL
) else (
    echo ❌ Không thể kết nối PostgreSQL
    goto :error_exit
)

echo.
echo 🔍 2. Kiểm tra database tồn tại...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%';" | findstr "1" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database '%DB_NAME%' tồn tại
) else (
    echo ❌ Database '%DB_NAME%' không tồn tại
    echo 💡 Chạy setup_database_orient.bat để tạo database
    goto :error_exit
)

echo.
echo 🔍 3. Kiểm tra user ứng dụng...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT 1 FROM pg_user WHERE usename = '%APP_USER%';" | findstr "1" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ User '%APP_USER%' tồn tại
) else (
    echo ❌ User '%APP_USER%' không tồn tại
    echo 💡 Chạy setup_database_orient.bat để tạo user
)

echo.
echo 🔍 4. Kiểm tra kết nối với user ứng dụng...
set PGPASSWORD=orient_password_2024
psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME% -c "SELECT current_user, current_database();" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ User ứng dụng có thể kết nối
) else (
    echo ❌ User ứng dụng không thể kết nối
    echo 💡 Kiểm tra mật khẩu hoặc quyền truy cập
)

echo.
echo 🔍 5. Kiểm tra cấu trúc bảng...
set PGPASSWORD=your_password_here
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\dt" | findstr "public" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Có bảng trong database
    echo.
    echo 📋 Danh sách bảng chính:
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" -t | findstr -v "^$"
) else (
    echo ❌ Không có bảng nào trong database
    echo 💡 Chạy: npm run db:push để tạo schema
)

echo.
echo 🔍 6. Kiểm tra enums...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;" | findstr -v "^$" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Enums đã được tạo
    echo.
    echo 📋 Danh sách enums:
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;" -t | findstr -v "^$"
) else (
    echo ⚠️  Chưa có enums
)

echo.
echo 🔍 7. Kiểm tra dữ liệu mẫu...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) FROM users;" 2>nul | findstr -r "[0-9]" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Có dữ liệu trong bảng users
    for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) FROM users;" -t') do echo    Số lượng users: %%i
) else (
    echo ⚠️  Chưa có dữ liệu users
    echo 💡 Chạy: npm run db:seed để tạo dữ liệu mẫu
)

echo.
echo 🔍 8. Kiểm tra kích thước database...
for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT pg_size_pretty(pg_database_size('%DB_NAME%'));" -t') do echo 📏 Kích thước database: %%i

echo.
echo 🔍 9. Kiểm tra kết nối hiện tại...
for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT count(*) FROM pg_stat_activity WHERE datname = '%DB_NAME%';" -t') do echo 🔗 Số kết nối hiện tại: %%i

echo.
echo 🔍 10. Kiểm tra file .env...
if exist ".env" (
    echo ✅ File .env tồn tại
    findstr "DATABASE_URL" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ DATABASE_URL đã được cấu hình
    ) else (
        echo ❌ Thiếu DATABASE_URL trong .env
    )
) else (
    echo ❌ File .env không tồn tại
    echo 💡 Chạy setup_database_orient.bat để tạo
)

echo.
echo ========================================
echo 📊 TÓM TẮT HEALTH CHECK
echo ========================================
echo ✅ Các thành phần hoạt động bình thường
echo ⚠️  Các thành phần cần chú ý  
echo ❌ Các thành phần có vấn đề
echo.
echo 💡 Để khắc phục vấn đề:
echo    - Chạy setup_database_orient.bat (thiết lập ban đầu)
echo    - Chạy npm run db:push (tạo/cập nhật schema)
echo    - Chạy npm run db:seed (tạo dữ liệu mẫu)
echo ========================================
goto :end

:error_exit
echo.
echo ❌ Health check thất bại!
echo 💡 Kiểm tra PostgreSQL service và cấu hình kết nối.

:end
pause
