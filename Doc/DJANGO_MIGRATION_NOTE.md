# ⚠️ DJANGO MIGRATION NOTE

## Vấn đề

Khi chạy migrations, Django có thể gặp lỗi `relation "users" already exists` vì:
- Database đã có tables từ Express backend (Drizzle ORM)
- Django migrations cố gắng tạo lại các tables đã tồn tại

## Giải pháp

### Option 1: Fake Migrations (Khuyến nghị)

Nếu tables đã tồn tại từ Express backend:

```powershell
# Fake initial migrations
python manage.py migrate --fake users 0001
python manage.py migrate --fake works 0001
python manage.py migrate --fake contracts 0001

# Sau đó chạy migrations bình thường
python manage.py migrate
```

### Option 2: Sử dụng Database Riêng

Tạo database riêng cho Django:

```sql
CREATE DATABASE translation_db_django;
```

Và cập nhật `.env`:
```env
DB_NAME=translation_db_django
```

### Option 3: Sử dụng Cùng Schema

Nếu muốn Django và Express share cùng database:
- Đảm bảo Django models match với Drizzle schema
- Sử dụng `--fake` cho initial migrations
- Chỉ chạy migrations cho các thay đổi mới

## Lưu ý

- Django và Express có thể share cùng database PostgreSQL
- Cần đảm bảo models match với schema hiện có
- Sử dụng `python manage.py showmigrations` để xem trạng thái migrations

