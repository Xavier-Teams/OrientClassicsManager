# 🚀 HƯỚNG DẪN SETUP DỰ ÁN

## Bước 1: Setup Backend (Django)

### 1.1. Tạo virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 1.2. Cài đặt dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.3. Cấu hình database

1. Tạo file `.env` trong thư mục `backend/`:

```bash
cp .env.example .env
```

2. Chỉnh sửa file `.env` với thông tin database của bạn:

```env
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

3. Tạo database PostgreSQL:

```sql
CREATE DATABASE translation_db;
```

### 1.4. Chạy migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 1.5. Tạo superuser

```bash
python manage.py createsuperuser
```

### 1.6. Chạy server

```bash
python manage.py runserver
```

Backend sẽ chạy tại: http://localhost:8000

## Bước 2: Setup Frontend (React)

### 2.1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2.2. Tạo file `.env` (nếu cần)

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

### 2.3. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## Bước 3: Kiểm tra

1. Truy cập http://localhost:8000/admin để vào Django admin
2. Truy cập http://localhost:8000/api/docs để xem API documentation
3. Truy cập http://localhost:5173 để vào ứng dụng frontend

## Lưu ý

- Đảm bảo PostgreSQL đang chạy
- Đảm bảo Redis đang chạy (nếu sử dụng Celery)
- Kiểm tra file `.env` đã được cấu hình đúng

## Troubleshooting

### Lỗi kết nối database

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra thông tin trong file `.env`
- Kiểm tra database đã được tạo

### Lỗi CORS

- Kiểm tra `CORS_ALLOWED_ORIGINS` trong `settings.py`
- Đảm bảo frontend URL được thêm vào danh sách

### Lỗi import module

- Đảm bảo virtual environment đã được kích hoạt
- Chạy lại `pip install -r requirements.txt`

