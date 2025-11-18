# 🚀 HƯỚNG DẪN SETUP DỰ ÁN

## 📋 Mục lục

1. [Prerequisites](#prerequisites)
2. [Setup Express Backend](#setup-express-backend)
3. [Setup Django Backend](#setup-django-backend)
4. [Setup Frontend](#setup-frontend)
5. [Database Setup](#database-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ và npm
- **Python** 3.11+
- **PostgreSQL** 12+
- **Git**

---

## Setup Express Backend

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

File `.env` đã được tạo với cấu hình PostgreSQL:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:01092016@localhost:5432/translation_db

# Database Configuration (Individual variables for Django)
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=01092016
DB_HOST=localhost
DB_PORT=5432

# OpenAI API Key
OPENAI_API_KEY=sk-proj-...

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Lưu ý:** Đảm bảo PostgreSQL đang chạy và database `translation_db` đã được tạo.

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed database với sample data (optional)
npm run db:seed
```

**Lưu ý:** Khi chạy `npm run db:push`, chọn `+ create table` cho tất cả các tables.

### 4. Start Server

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

---

## Setup Django Backend

### 1. Virtual Environment

```bash
# Windows
python -m venv venv-django
.\venv-django\Scripts\activate

# Linux/Mac
python3 -m venv venv-django
source venv-django/bin/activate
```

### 2. Install Dependencies

```bash
cd backend-django
pip install -r requirements.txt
```

### 3. Environment Variables

File `.env` trong `backend-django/` đã được tạo với cấu hình:

```env
# Django Configuration
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True

# Database Configuration
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=01092016
DB_HOST=localhost
DB_PORT=5432

# OpenAI API Key
OPENAI_API_KEY=sk-proj-...
```

**Lưu ý:** Django sẽ tự động load các biến môi trường từ file `.env` này.

### 4. Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Nếu gặp lỗi "relation already exists", fake migrations:
python manage.py migrate --fake users 0001
python manage.py migrate --fake works 0001
python manage.py migrate --fake contracts 0001
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Start Server

```bash
# Windows
cd backend-django
.\run.bat

# Hoặc manual
python manage.py runserver
```

Django server sẽ chạy tại: **http://localhost:8000**

---

## Setup Frontend

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE translation_db;
```

### 2. Push Schema (Express/Drizzle)

```bash
npm run db:push
```

### 3. Run Migrations (Django)

```bash
cd backend-django
python manage.py migrate
```

### 4. Seed Data (Optional)

```bash
# Express backend
npm run db:seed

# Hoặc Django admin
python manage.py createsuperuser
# Sau đó tạo data qua admin panel
```

---

## Test Setup

### Express Backend

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:5000/api/ai/health

# Get users
Invoke-WebRequest -Uri http://localhost:5000/api/users

# Get works
Invoke-WebRequest -Uri http://localhost:5000/api/works
```

### Django Backend

```powershell
# Login và lấy token
$body = @{username="admin";password="your-password"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/auth/login/ `
    -Method POST -Body $body -ContentType "application/json"
$token = ($response.Content | ConvertFrom-Json).access

# Get works
$headers = @{Authorization="Bearer $token"}
Invoke-WebRequest -Uri http://localhost:8000/api/v1/works/ -Headers $headers
```

---

## Troubleshooting

### Database Connection Error

**Lỗi:** `DATABASE_URL must be set` hoặc `connection refused`

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy:
   ```powershell
   Get-Service -Name postgresql*
   ```
2. Kiểm tra database đã được tạo
3. Kiểm tra `.env` file có đúng credentials
4. Test connection:
   ```bash
   psql -U postgres -d translation_db
   ```

### Port Already in Use

**Lỗi:** `Port 5000/8000 already in use`

**Giải pháp:**
```powershell
# Tìm process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Environment Variables Not Loading

**Lỗi:** `NODE_ENV is not recognized` (Windows)

**Giải pháp:**
- Đã cài đặt `cross-env` và `dotenv`
- Đảm bảo `import "dotenv/config"` ở đầu `server/index.ts`

### Django Migration Errors

**Lỗi:** `relation "users" already exists`

**Giải pháp:**
```bash
# Fake initial migrations nếu tables đã tồn tại từ Express
python manage.py migrate --fake users 0001
python manage.py migrate --fake works 0001
python manage.py migrate
```

### CORS Errors

**Giải pháp:**
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong Django settings
- Đảm bảo frontend URL (http://localhost:5173) được thêm vào

---

## Quick Commands

### Express Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Push database schema
npm run db:seed      # Seed database
```

### Django Backend
```bash
python manage.py runserver          # Start server
python manage.py makemigrations    # Create migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin user
python manage.py shell              # Django shell
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run check        # TypeScript check
```

---

## Next Steps

Sau khi setup thành công:

1. ✅ Test API endpoints
2. ✅ Tạo superuser/admin account
3. ✅ Seed database với sample data
4. ⏳ Bắt đầu phát triển features

---

**Xem thêm:**
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API documentation

