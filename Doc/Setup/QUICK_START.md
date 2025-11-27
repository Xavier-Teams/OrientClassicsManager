# 🚀 Quick Start - Khởi động ứng dụng

## ⚠️ Lỗi thường gặp: `ERR_CONNECTION_REFUSED`

Nếu bạn gặp lỗi `Failed to load resource: net::ERR_CONNECTION_REFUSED` tại `localhost:8000`, điều này có nghĩa là **Django backend chưa được khởi động**.

## 📋 Các bước khởi động

### Bước 1: Khởi động Django Backend

Mở terminal mới và chạy:

```bash
cd backend-django
python manage.py runserver
```

**Hoặc nếu dùng Python 3:**

```bash
cd backend-django
python3 manage.py runserver
```

✅ Django sẽ chạy tại: **http://localhost:8000**

Bạn sẽ thấy output tương tự:

```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Bước 2: Khởi động Frontend (Terminal khác)

Mở terminal mới và chạy:

```bash
cd client
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 3: Kiểm tra kết nối

1. Mở trình duyệt: http://localhost:5173/works
2. Mở Browser DevTools (F12) → Network tab
3. Kiểm tra xem API requests có thành công không

## 🔍 Kiểm tra Django đang chạy

### Test API trực tiếp trong trình duyệt:

1. Mở: http://localhost:8000/api/v1/works/board/
2. Nếu thấy JSON data → Django đang chạy ✅
3. Nếu thấy "This site can't be reached" → Django chưa chạy ❌

### Test bằng cURL:

```bash
curl http://localhost:8000/api/v1/works/board/
```

Nếu thành công → Django đang chạy ✅

## ⚠️ Troubleshooting

### Lỗi: `python: command not found`

**Giải pháp:**

- Windows: Sử dụng `py` thay vì `python`
  ```bash
  py manage.py runserver
  ```
- Hoặc cài đặt Python từ https://www.python.org/

### Lỗi: `ModuleNotFoundError: No module named 'django'`

**Giải pháp:** Cài đặt dependencies

```bash
cd backend-django
pip install -r requirements.txt
```

### Lỗi: `django.db.utils.OperationalError: could not connect to server`

**Giải pháp:** PostgreSQL chưa chạy hoặc database chưa được tạo

1. Khởi động PostgreSQL service
2. Tạo database `translation_db` (xem [QUICK_START_DATABASE.md](./QUICK_START_DATABASE.md))
3. Chạy migrations:
   ```bash
   python manage.py migrate
   ```

### Lỗi: Port 8000 đã được sử dụng

**Giải pháp:** Sử dụng port khác

```bash
python manage.py runserver 8001
```

Sau đó cập nhật `client/.env`:

```env
VITE_API_URL=http://localhost:8001
```

### Lỗi: CORS policy blocked

**Giải pháp:** Kiểm tra `CORS_ALLOWED_ORIGINS` trong `backend-django/config/settings.py`

Đảm bảo có:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",   # React dev server
]
```

## 🔐 Tạo tài khoản Admin

Để đăng nhập vào Django Admin (`http://127.0.0.1:8000/admin/`), bạn cần tạo superuser:

```bash
cd backend-django
python manage.py createsuperuser
```

Nhập thông tin:

- Username: `admin` (hoặc username khác)
- Email: `admin@orientclassics.vn`
- Password: [nhập password bạn muốn]

**Lưu ý**: Password trong SQL seed data là placeholder, không thể dùng để đăng nhập. Bạn **phải** tạo superuser mới hoặc reset password.

📚 Xem chi tiết: [ADMIN_LOGIN_GUIDE.md](./ADMIN_LOGIN_GUIDE.md)

## ✅ Checklist

Trước khi chạy ứng dụng, đảm bảo:

- [ ] PostgreSQL đang chạy
- [ ] Database `translation_db` đã được tạo
- [ ] Django migrations đã chạy (`python manage.py migrate`)
- [ ] Dữ liệu seed đã được insert (xem [SQL_SEED_DATA_README.md](./SQL_SEED_DATA_README.md))
- [ ] Django dependencies đã được cài (`pip install -r requirements.txt`)
- [ ] Frontend dependencies đã được cài (`npm install`)
- [ ] **Đã tạo superuser để đăng nhập Admin** (`python manage.py createsuperuser`)

## 🎯 Quy trình khởi động đầy đủ

```bash
# Terminal 1: Django Backend
cd backend-django
python manage.py runserver

# Terminal 2: Frontend
cd client
npm run dev

# Terminal 3: (Optional) Express Server cho AI services
cd server
npm run dev
```

## 📚 Tài liệu liên quan

- [API_CONNECTION_GUIDE.md](./API_CONNECTION_GUIDE.md) - Hướng dẫn kết nối API
- [TEST_API.md](./TEST_API.md) - Hướng dẫn test API
- [QUICK_START_DATABASE.md](./QUICK_START_DATABASE.md) - Quick start database

---

**Lưu ý**: Luôn đảm bảo Django backend đang chạy trước khi mở frontend!
