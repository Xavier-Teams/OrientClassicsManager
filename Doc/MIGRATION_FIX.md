# 🔧 HƯỚNG DẪN SỬA LỖI MIGRATIONS

## Vấn đề

Lỗi `relation "users" does not exist` xảy ra vì Django admin migrations đang cố gắng chạy trước khi migrations của users app được tạo.

## Giải pháp

Đã tạo migrations files cho các apps cần thiết:

1. ✅ `users/migrations/0001_initial.py` - Migration cho User và Role models
2. ✅ `works/migrations/0001_initial.py` - Migration cho TranslationWork và TranslationPart models
3. ✅ Các migrations folders cho các apps khác

## Các bước tiếp theo

### 1. Kích hoạt virtual environment

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Chạy migrations theo thứ tự

```bash
cd backend

# Tạo migrations (nếu cần)
python manage.py makemigrations

# Chạy migrations
python manage.py migrate
```

### 3. Nếu vẫn gặp lỗi

Nếu vẫn gặp lỗi về thứ tự migrations, có thể cần fake migrations ban đầu:

```bash
# Fake initial migrations cho users (nếu đã có bảng)
python manage.py migrate users 0001 --fake

# Sau đó chạy migrate bình thường
python manage.py migrate
```

### 4. Tạo superuser

```bash
python manage.py createsuperuser
```

## Lưu ý

- Đảm bảo PostgreSQL đang chạy
- Đảm bảo database đã được tạo
- Kiểm tra file `.env` có cấu hình đúng database

## Kiểm tra

Sau khi migrations thành công, bạn có thể:

1. Truy cập Django admin: http://localhost:8000/admin
2. Kiểm tra API: http://localhost:8000/api/docs
3. Tạo user và role để test

