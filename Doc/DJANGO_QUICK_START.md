# 🚀 DJANGO BACKEND - QUICK START

## ✅ Đã Setup

Django backend đã được cài đặt và cấu hình thành công!

## 🏃 Chạy Django Server

### Windows (PowerShell):
```powershell
# Cách 1: Sử dụng batch file
cd backend-django
.\run.bat

# Cách 2: Manual
.\venv-django\Scripts\activate
cd backend-django
python manage.py runserver
```

### Linux/Mac:
```bash
source venv-django/bin/activate
cd backend-django
python manage.py runserver
```

Server sẽ chạy tại: **http://localhost:8000**

## 👤 Tạo Superuser

```powershell
cd backend-django
.\createsuperuser.bat
```

Hoặc manual:
```powershell
.\venv-django\Scripts\activate
cd backend-django
python manage.py createsuperuser
```

## 🔌 Test API Endpoints

### 1. Login và lấy JWT Token

```powershell
$body = @{
    username = "admin"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/auth/login/ `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = ($response.Content | ConvertFrom-Json).access
```

### 2. Get Works List

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-WebRequest -Uri http://localhost:8000/api/v1/works/ `
    -Headers $headers | 
    Select-Object -ExpandProperty Content | 
    ConvertFrom-Json | 
    ConvertTo-Json -Depth 10
```

### 3. Get Current User

```powershell
Invoke-WebRequest -Uri http://localhost:8000/api/v1/auth/users/me/ `
    -Headers $headers | 
    Select-Object -ExpandProperty Content | 
    ConvertFrom-Json | 
    ConvertTo-Json -Depth 10
```

## 📋 API Endpoints

### Authentication (`/api/v1/auth/`)
- `POST /login/` - Login
- `POST /refresh/` - Refresh token
- `GET /users/` - List users
- `GET /users/me/` - Current user
- `POST /users/` - Create user

### Works (`/api/v1/works/`)
- `GET /` - List works
  - Query params: `?status=draft&translator_id=1&priority=1`
- `POST /` - Create work
- `GET /{id}/` - Get work
- `PATCH /{id}/` - Update work
- `POST /{id}/approve/` - Approve work
- `POST /{id}/assign_translator/` - Assign translator
- `POST /{id}/start_trial/` - Start trial

### Contracts (`/api/v1/contracts/`)
- `GET /` - List contracts
  - Query params: `?status=signed&work_id=1`
- `POST /` - Create contract
- `GET /{id}/` - Get contract
- `PATCH /{id}/` - Update contract

### AI (`/api/v1/ai/`)
- `POST /query/` - Smart query
- `POST /translation/check/` - Translation check

## 🗄️ Database

Django backend sử dụng cùng PostgreSQL database với Express backend:
- Database: `translation_db`
- Tables đã được tạo từ migrations
- Có thể share data giữa Django và Express

## 🔐 Authentication Flow

1. **Login** tại `/api/v1/auth/login/` với username/password
2. Nhận **access_token** và **refresh_token**
3. Include token trong header: `Authorization: Bearer <access_token>`
4. Khi token hết hạn, dùng **refresh_token** tại `/api/v1/auth/refresh/`

## 📝 Admin Panel

Truy cập Django Admin tại: **http://localhost:8000/admin/**

Login với superuser credentials để quản lý:
- Users
- Works
- Contracts
- Reviews
- Documents

## 🛠️ Useful Commands

```powershell
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Check migrations status
python manage.py showmigrations

# Django shell
python manage.py shell
```

## 📁 Project Structure

```
backend-django/
├── config/          # Django settings
├── users/           # User management
├── works/           # Translation works
├── contracts/       # Contracts
├── reviews/         # Reviews (to be completed)
├── editing/         # Editing tasks (to be completed)
├── administration/  # Admin tasks (to be completed)
├── documents/       # Documents (to be completed)
├── ai/              # AI services
├── manage.py        # Django CLI
├── run.bat          # Quick start script
├── migrate.bat      # Migration script
└── requirements.txt # Dependencies
```

## ⚠️ Notes

- Django backend chạy trên port **8000**
- Express backend chạy trên port **5000**
- Cả hai có thể chạy đồng thời
- Cả hai share cùng database PostgreSQL
- CORS đã được cấu hình cho frontend (port 5173)

## 🚀 Next Steps

1. ✅ Start Django server
2. ✅ Create superuser
3. ✅ Test API endpoints
4. ⏳ Complete remaining models (reviews, editing, etc.)
5. ⏳ Implement AI services
6. ⏳ Add file uploads
7. ⏳ Add comprehensive tests

---

**Django backend sẵn sàng! 🎉**

