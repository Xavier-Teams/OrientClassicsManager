# 🔄 Migration từ FastAPI sang Django REST Framework

## Tóm tắt

FastAPI backend đã được thay thế bằng Django REST Framework để phù hợp với hướng đi ban đầu của dự án: **Django + React**.

## Thay đổi

### 1. ✅ API Endpoints

**FastAPI** (đã xóa):
- `GET /api/v1/works/board` (Port 8001)

**Django REST Framework** (đang sử dụng):
- `GET /api/v1/works/board/` (Port 8000)
- `GET /api/v1/works/` - List works
- `GET /api/v1/works/{id}/` - Get work detail
- `POST /api/v1/works/` - Create work
- `PATCH /api/v1/works/{id}/` - Update work
- `DELETE /api/v1/works/{id}/` - Delete work

### 2. ✅ Frontend

Đã cập nhật `client/src/lib/api.ts`:
- API base URL: `http://localhost:8000` (Django) thay vì `http://localhost:8001` (FastAPI)
- Endpoint `/board` đã được cập nhật để sử dụng Django API

### 3. ✅ Django Backend

Đã thêm endpoint `/board` vào `TranslationWorkViewSet`:
```python
@action(detail=False, methods=['get'], url_path='board')
def board(self, request):
    """Get works organized by status for board view"""
    ...
```

## Cách sử dụng

### 1. Chạy Django Backend

```bash
cd backend-django
python manage.py runserver
```

Django sẽ chạy tại: **http://localhost:8000**

### 2. Chạy Frontend

```bash
npm run dev
```

Frontend sẽ tự động kết nối với Django API tại `http://localhost:8000`

### 3. Test API

```bash
# Get works board
curl http://localhost:8000/api/v1/works/board/

# List works
curl http://localhost:8000/api/v1/works/
```

## Xử lý FastAPI Backend

FastAPI backend (`backend-fastapi/`) có thể được:
- **Xóa hoàn toàn** (khuyến nghị)
- **Archive** vào `archive/backend-fastapi/` để tham khảo

## Lợi ích

✅ **Thống nhất**: Một backend framework duy nhất (Django)
✅ **Đơn giản**: Không cần maintain nhiều backend
✅ **Phù hợp**: Đúng với hướng đi Django + React
✅ **Tận dụng**: Sử dụng models và serializers đã có sẵn
✅ **Authentication**: JWT authentication đã có sẵn
✅ **Admin**: Django admin panel để quản lý dữ liệu

---

**Xem thêm**: [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md)

