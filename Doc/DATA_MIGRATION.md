# 📊 Migration Dữ liệu từ Frontend sang Database

## Mục tiêu

Chuyển toàn bộ dữ liệu mock hiển thị ở frontend sang PostgreSQL database và đảm bảo frontend hiển thị chính xác dữ liệu từ database.

## Dữ liệu cần migrate

### Works (Tác phẩm)

Từ mock data trong frontend, có **17 works** được phân bổ theo các trạng thái:

- **draft** (Dự kiến): 3 works
- **approved** (Đã duyệt): 2 works
- **in_progress** (Đang dịch): 5 works
- **progress_checked** (Đã kiểm tra TD): 3 works
- **completed** (Hoàn thành): 4 works

### Users (Dịch giả)

Có **15 dịch giả** được tạo từ tên trong mock data:
- Nguyễn Văn A, Trần Thị B, Lê Văn C, Phạm Thị D, Hoàng Văn E, Võ Thị F, Đặng Văn G, Bùi Thị H, Mai Văn I, Đinh Thị K, Lý Văn L, Phan Thị M, Tạ Văn N, Vũ Thị O, Dương Văn P

## Cách thực hiện

### 1. Seed Database

```bash
cd backend-django
python manage.py seed_all --clear
```

Hoặc sử dụng batch file:

```bash
cd backend-django
.\seed.bat
```

Script sẽ:
- ✅ Tạo 15 users (dịch giả) với password: `password123`
- ✅ Tạo 17 works với đầy đủ thông tin từ mock data
- ✅ Gán translator cho các works
- ✅ Set đúng state và priority cho mỗi work

### 2. Kiểm tra dữ liệu

```bash
# Django shell
python manage.py shell

# Kiểm tra số lượng works
from works.models import TranslationWork
TranslationWork.objects.count()  # Should be 17

# Kiểm tra theo status
TranslationWork.objects.filter(state='draft').count()  # Should be 3
TranslationWork.objects.filter(state='in_progress').count()  # Should be 5
```

### 3. Test API Endpoints

```bash
# Get works board (organized by status)
curl http://localhost:8000/api/v1/works/board/

# List all works
curl http://localhost:8000/api/v1/works/

# Get works by status
curl http://localhost:8000/api/v1/works/?status=draft
```

### 4. Kiểm tra Frontend

```bash
# Start Django server
cd backend-django
python manage.py runserver

# Start Frontend (in another terminal)
npm run dev
```

Frontend sẽ tự động fetch data từ Django API và hiển thị chính xác như mock data trước đây.

## Mapping dữ liệu

### Priority Mapping

Frontend mock data → Django model:
- `"low"` → `"0"` (Bình thường)
- `"normal"` → `"0"` (Bình thường)
- `"high"` → `"1"` (Cao)
- `"urgent"` → `"2"` (Khẩn)

### Status Mapping

Frontend status → Django state:
- `"draft"` → `"draft"`
- `"approved"` → `"approved"`
- `"in_progress"` → `"in_progress"`
- `"progress_checked"` → `"progress_checked"`
- `"completed"` → `"completed"`

## Đảm bảo tính chính xác

### 1. Serializer đã được cập nhật

- ✅ `translator_name` được trả về từ `translator.full_name`
- ✅ `state` được map đúng với frontend
- ✅ `priority` được format đúng
- ✅ `translation_progress` được trả về chính xác

### 2. API Endpoint `/board`

- ✅ Trả về works được group theo status
- ✅ Chỉ include các status có works
- ✅ Format đúng với frontend expectation

### 3. Frontend Integration

- ✅ API client đã được cập nhật để sử dụng Django API
- ✅ Interface đã được cập nhật để match với Django serializer
- ✅ Filter và search hoạt động với dữ liệu từ database

## Troubleshooting

### Dữ liệu không hiển thị

1. Kiểm tra Django server đang chạy:
   ```bash
   python manage.py runserver
   ```

2. Kiểm tra database có dữ liệu:
   ```bash
   python manage.py shell
   >>> from works.models import TranslationWork
   >>> TranslationWork.objects.count()
   ```

3. Kiểm tra API endpoint:
   ```bash
   curl http://localhost:8000/api/v1/works/board/
   ```

### Lỗi CORS

Đảm bảo `CORS_ALLOWED_ORIGINS` trong `settings.py` bao gồm frontend URL.

### Lỗi Authentication

Tạm thời đã set `AllowAny` permission cho development. Trong production, cần enable authentication.

## Kết quả mong đợi

Sau khi seed và chạy frontend:
- ✅ Board view hiển thị đúng 5 columns với số lượng works chính xác
- ✅ Mỗi work card hiển thị đúng thông tin: tên, tác giả, dịch giả, tiến độ, số trang
- ✅ Priority badges hiển thị đúng màu sắc
- ✅ Search và filter hoạt động với dữ liệu từ database

---

**Xem thêm**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

