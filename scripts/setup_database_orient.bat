@echo off
echo ========================================
echo OrientClassicsManager Database Setup
echo ========================================

:: Thiết lập biến môi trường
set PGPASSWORD=your_password_here
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=orient_classics_manager
set APP_USER=orient_user
set APP_PASSWORD=orient_password_2024

echo 📊 Cấu hình Database:
echo    - Database: %DB_NAME%
echo    - Host: %DB_HOST%:%DB_PORT%
echo    - Admin User: %DB_USER%
echo    - App User: %APP_USER%
echo.

echo 🔍 Kiểm tra kết nối PostgreSQL...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT version();" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Không thể kết nối PostgreSQL!
    echo 💡 Kiểm tra:
    echo    - PostgreSQL service đang chạy?
    echo    - Thông tin user/password đúng?
    echo    - Port %DB_PORT% có mở?
    pause
    exit /b 1
)
echo ✅ Kết nối PostgreSQL thành công!

echo.
echo 1️⃣ Tạo database OrientClassicsManager...
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% -E UTF8 -T template0 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database '%DB_NAME%' đã được tạo
) else (
    echo ⚠️  Database có thể đã tồn tại
)

echo.
echo 2️⃣ Tạo user ứng dụng...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE USER %APP_USER% WITH PASSWORD '%APP_PASSWORD%';" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ User '%APP_USER%' đã được tạo
) else (
    echo ⚠️  User có thể đã tồn tại
)

echo.
echo 3️⃣ Cấp quyền cho user ứng dụng...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %APP_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON SCHEMA public TO %APP_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %APP_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %APP_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %APP_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %APP_USER%;"
echo ✅ Đã cấp quyền cho user ứng dụng

echo.
echo 4️⃣ Tạo file .env với cấu hình database...
echo # OrientClassicsManager Database Configuration > .env.example
echo DATABASE_URL=postgresql://%APP_USER%:%APP_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME% >> .env.example
echo NODE_ENV=development >> .env.example
echo PORT=5000 >> .env.example
echo. >> .env.example
echo # Session Configuration >> .env.example
echo SESSION_SECRET=your_session_secret_here_change_in_production >> .env.example
echo. >> .env.example
echo # OpenAI Configuration (optional) >> .env.example
echo OPENAI_API_KEY=your_openai_api_key_here >> .env.example

if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ Đã tạo file .env từ template
    echo ⚠️  Hãy cập nhật các giá trị trong file .env
) else (
    echo ⚠️  File .env đã tồn tại, tạo .env.example làm tham khảo
)

echo.
echo 5️⃣ Chạy Drizzle migrations...
if exist "node_modules" (
    call npm run db:push
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Migrations đã được thực thi
    ) else (
        echo ❌ Lỗi khi chạy migrations
    )
) else (
    echo ⚠️  Chưa cài đặt dependencies. Chạy: npm install
)

echo.
echo 6️⃣ Kiểm tra cấu trúc database...
psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME% -c "\dt" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database structure OK
) else (
    echo ❌ Có vấn đề với database structure
)

echo.
echo ========================================
echo ✅ Hoàn tất cài đặt database!
echo.
echo 📋 Thông tin kết nối:
echo    Database: %DB_NAME%
echo    Host: %DB_HOST%:%DB_PORT%
echo    User: %APP_USER%
echo    Password: %APP_PASSWORD%
echo.
echo 🔗 Connection String:
echo    postgresql://%APP_USER%:%APP_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
echo 📝 Các bước tiếp theo:
echo    1. Cập nhật file .env với thông tin chính xác
echo    2. Chạy: npm install (nếu chưa)
echo    3. Chạy: npm run db:push (nếu chưa)
echo    4. Chạy: npm run db:seed (để tạo dữ liệu mẫu)
echo    5. Chạy: npm run dev (để khởi động ứng dụng)
echo.
echo 🔒 Bảo mật:
echo    - Thay đổi mật khẩu mặc định trong production
echo    - Cấu hình firewall cho PostgreSQL
echo    - Sử dụng SSL khi deploy
echo ========================================
pause
