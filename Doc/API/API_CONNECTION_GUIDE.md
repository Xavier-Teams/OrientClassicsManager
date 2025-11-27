# 🔗 Hướng dẫn kết nối Frontend với Backend API

## 📋 Tổng quan

Hướng dẫn này giúp bạn kết nối Frontend (React) với Backend API (Django REST Framework) để hiển thị dữ liệu từ PostgreSQL database.

## 🚀 Các bước thực hiện

### ⚠️ QUAN TRỌNG: Luôn khởi động Django Backend TRƯỚC khi mở Frontend!

Nếu bạn gặp lỗi `ERR_CONNECTION_REFUSED`, điều này có nghĩa là Django backend chưa được khởi động.

### BƯỚC 1: Khởi động Django Backend

**Cách 1: Sử dụng script (Khuyến nghị)**

**Windows:**
```bash
start-backend.bat
```

**Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Cách 2: Chạy thủ công**

```bash
cd backend-django
python manage.py runserver
```

**Hoặc nếu dùng Python 3:**
```bash
cd backend-django
python3 manage.py runserver
```

**Windows với py launcher:**
```bash
cd backend-django
py manage.py runserver
```

Django sẽ chạy tại: **http://localhost:8000**

✅ Bạn sẽ thấy output:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### BƯỚC 2: Khởi động Frontend

```bash
cd client
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### BƯỚC 3: Kiểm tra kết nối

Mở trình duyệt và truy cập:
- Frontend: http://localhost:5173/works
- API Board: http://localhost:8000/api/v1/works/board/
- API Works List: http://localhost:8000/api/v1/works/

## 📡 API Endpoints có sẵn

### Works API

#### 1. Get Works Board
```
GET /api/v1/works/board/
```
Trả về works được nhóm theo status:
```json
{
  "draft": [...],
  "approved": [...],
  "in_progress": [...],
  "progress_checked": [...],
  "completed": [...]
}
```

#### 2. List Works
```
GET /api/v1/works/
```
Query parameters:
- `page`: Số trang (default: 1)
- `page_size`: Số items mỗi trang (default: 20)
- `status`: Lọc theo state (draft, approved, in_progress, etc.)
- `priority`: Lọc theo priority (0, 1, 2)
- `translator_id`: Lọc theo translator ID
- `part_id`: Lọc theo translation_part ID
- `search`: Tìm kiếm theo name, author, name_original

#### 3. Get Work Detail
```
GET /api/v1/works/{id}/
```

#### 4. Create Work
```
POST /api/v1/works/
Content-Type: application/json

{
  "name": "Tên tác phẩm",
  "author": "Tác giả",
  "source_language": "Hán văn",
  "target_language": "Tiếng Việt",
  "page_count": 100,
  "state": "draft",
  "priority": "0"
}
```

#### 5. Update Work
```
PATCH /api/v1/works/{id}/
Content-Type: application/json

{
  "translation_progress": 50,
  "state": "in_progress"
}
```

#### 6. Delete Work
```
DELETE /api/v1/works/{id}/
```

#### 7. Work Actions
```
POST /api/v1/works/{id}/approve/
POST /api/v1/works/{id}/assign_translator/
POST /api/v1/works/{id}/start_trial/
```

### Users API

#### 1. Get Translators
```
GET /api/v1/auth/users/translators/
```
Trả về danh sách translators (users với role='dich_gia'):
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "username": "nguyen_van_a",
      "email": "nguyen.van.a@orientclassics.vn",
      "full_name": "Nguyễn Văn A",
      "role": "dich_gia",
      ...
    }
  ]
}
```

#### 2. Get Current User
```
GET /api/v1/auth/users/me/
```

### Translation Parts API

#### 1. List Parts
```
GET /api/v1/works/parts/
```

#### 2. Get Part Detail
```
GET /api/v1/works/parts/{id}/
```

#### 3. Get Part Works
```
GET /api/v1/works/parts/{id}/works/
```

#### 4. Get Part Statistics
```
GET /api/v1/works/parts/{id}/statistics/
```

## 🔧 Cấu hình Frontend

### API Base URL

File `client/src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

Để thay đổi API URL, tạo file `.env` trong thư mục `client/`:
```env
VITE_API_URL=http://localhost:8000
```

### CORS Configuration

Django đã được cấu hình CORS để cho phép requests từ:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (React dev server)
- http://localhost:5000 (Express server)

## 🧪 Test API

### Sử dụng cURL

```bash
# Test Board API
curl http://localhost:8000/api/v1/works/board/

# Test Works List
curl http://localhost:8000/api/v1/works/

# Test Translators
curl http://localhost:8000/api/v1/auth/users/translators/

# Test với query parameters
curl "http://localhost:8000/api/v1/works/?status=draft&priority=1"
```

### Sử dụng Browser

Mở trình duyệt và truy cập:
- http://localhost:8000/api/v1/works/board/
- http://localhost:8000/api/v1/works/
- http://localhost:8000/api/v1/auth/users/translators/

### Sử dụng Postman/Insomnia

1. Tạo request mới
2. Method: GET
3. URL: `http://localhost:8000/api/v1/works/board/`
4. Headers: `Content-Type: application/json`
5. Send

## 📊 Kiểm tra dữ liệu trong Frontend

### 1. Mở Browser Console

Trong trang `/works`, mở Developer Tools (F12) và kiểm tra:
- Network tab: Xem các API requests
- Console tab: Xem lỗi nếu có

### 2. Kiểm tra React Query

Frontend sử dụng React Query để cache và fetch data:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["works", "board"],
  queryFn: () => apiClient.getWorksBoard(),
});
```

### 3. Debug API Response

Thêm console.log vào `client/src/lib/api.ts`:
```typescript
private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;
  console.log('API Request:', url); // Debug log
  const response = await fetch(url, {...});
  const data = await response.json();
  console.log('API Response:', data); // Debug log
  return data;
}
```

## ⚠️ Troubleshooting

### Lỗi: CORS policy blocked

**Nguyên nhân**: Django CORS chưa được cấu hình đúng

**Giải pháp**:
1. Kiểm tra `CORS_ALLOWED_ORIGINS` trong `settings.py`
2. Đảm bảo frontend URL đã được thêm vào danh sách
3. Restart Django server

### Lỗi: 404 Not Found

**Nguyên nhân**: API endpoint không tồn tại hoặc URL sai

**Giải pháp**:
1. Kiểm tra `backend-django/config/urls.py`
2. Kiểm tra `backend-django/works/urls.py`
3. Đảm bảo Django server đang chạy

### Lỗi: 500 Internal Server Error

**Nguyên nhân**: Lỗi trong Django backend

**Giải pháp**:
1. Kiểm tra Django console logs
2. Kiểm tra database connection
3. Kiểm tra migrations đã chạy chưa: `python manage.py migrate`

### Dữ liệu không hiển thị trong Frontend

**Nguyên nhân**: API trả về format không đúng hoặc frontend không parse đúng

**Giải pháp**:
1. Kiểm tra API response trong Network tab
2. Kiểm tra `WorkBoardResponse` interface trong `api.ts`
3. Đảm bảo serializer trả về đúng format

### ID là số nhưng Frontend expect string

**Nguyên nhân**: Django trả về integer ID, nhưng TypeScript interface định nghĩa là string

**Giải pháp**:
- Cập nhật interface trong `api.ts`:
```typescript
export interface Work {
  id: number; // Thay vì string
  ...
}
```

Hoặc convert trong frontend:
```typescript
work.id.toString()
```

## ✅ Checklist kết nối

- [ ] Django server đang chạy tại http://localhost:8000
- [ ] Frontend server đang chạy tại http://localhost:5173
- [ ] Database đã có dữ liệu (đã chạy SQL_SEED_DATA.sql)
- [ ] API endpoint `/api/v1/works/board/` trả về dữ liệu
- [ ] Frontend có thể fetch data từ API
- [ ] Dữ liệu hiển thị đúng trong UI
- [ ] Không có lỗi CORS
- [ ] Không có lỗi trong Browser Console

## 📚 Tài liệu liên quan

- [SQL_SEED_DATA_README.md](./SQL_SEED_DATA_README.md) - Hướng dẫn seed data
- [PGADMIN4_SETUP_GUIDE.md](./PGADMIN4_SETUP_GUIDE.md) - Hướng dẫn setup database
- [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md) - Kiến trúc hệ thống

---

**Lưu ý**: Nếu gặp vấn đề, hãy kiểm tra logs trong Django console và Browser Developer Tools để xem chi tiết lỗi.

