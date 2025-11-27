# 🧪 Test API - Hướng dẫn nhanh

## 🚀 Khởi động Services

### 1. Start Django Backend
```bash
cd backend-django
python manage.py runserver
```
✅ Django chạy tại: http://localhost:8000

### 2. Start Frontend
```bash
cd client
npm run dev
```
✅ Frontend chạy tại: http://localhost:5173

## 📡 Test API Endpoints

### Test Board API
```bash
curl http://localhost:8000/api/v1/works/board/
```

**Kết quả mong đợi:**
```json
{
  "draft": [...],
  "approved": [...],
  "in_progress": [...],
  "progress_checked": [...],
  "completed": [...]
}
```

### Test Works List API
```bash
curl http://localhost:8000/api/v1/works/
```

**Kết quả mong đợi:**
```json
{
  "count": 17,
  "next": null,
  "previous": null,
  "results": [...]
}
```

### Test Translators API
```bash
curl http://localhost:8000/api/v1/auth/users/translators/
```

**Kết quả mong đợi:**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "username": "nguyen_van_a",
      "full_name": "Nguyễn Văn A",
      "role": "dich_gia",
      ...
    }
  ]
}
```

### Test với Filters
```bash
# Filter by status
curl "http://localhost:8000/api/v1/works/?status=draft"

# Filter by priority
curl "http://localhost:8000/api/v1/works/?priority=1"

# Search
curl "http://localhost:8000/api/v1/works/?search=Luận"
```

## 🌐 Test trong Browser

1. Mở trình duyệt
2. Truy cập: http://localhost:8000/api/v1/works/board/
3. Kiểm tra JSON response

## ✅ Checklist

- [ ] Django server đang chạy
- [ ] Frontend server đang chạy
- [ ] API `/board/` trả về dữ liệu
- [ ] API `/works/` trả về dữ liệu
- [ ] API `/translators/` trả về dữ liệu
- [ ] Frontend hiển thị dữ liệu từ API
- [ ] Không có lỗi CORS
- [ ] Không có lỗi trong console

