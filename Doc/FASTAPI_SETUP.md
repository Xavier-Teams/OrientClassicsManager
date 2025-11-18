# 🚀 FastAPI Backend Setup

## Tổng quan

FastAPI backend được sử dụng để truyền dữ liệu từ PostgreSQL database sang Frontend. Backend này chạy trên port **8001**.

## Setup

### 1. Tạo Virtual Environment

```bash
python -m venv venv-fastapi
# Windows
venv-fastapi\Scripts\activate
# Linux/Mac
source venv-fastapi/bin/activate
```

### 2. Cài đặt Dependencies

```bash
cd backend-fastapi
pip install -r requirements.txt
```

### 3. Environment Variables

File `.env` đã được tạo với cấu hình:

```env
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=01092016
DB_HOST=localhost
DB_PORT=5432
PORT=8001
```

### 4. Seed Database

Chạy script để seed dữ liệu từ mock data:

```bash
python scripts/seed_works.py
```

Script này sẽ:
- Tạo các users (dịch giả) từ mock data
- Tạo các works với đầy đủ thông tin
- Gán translator cho các works

### 5. Chạy Server

```bash
# Windows
python main.py
# hoặc
.\run.bat

# Linux/Mac
uvicorn main:app --reload --port 8001
```

Server sẽ chạy tại: **http://localhost:8001**

## API Documentation

Sau khi chạy server, truy cập:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## API Endpoints

### Works

- `GET /api/v1/works/` - List works (với pagination và filters)
  - Query params: `page`, `page_size`, `status`, `priority`, `translator_id`, `search`
- `GET /api/v1/works/board` - Get works organized by status (cho board view)
- `GET /api/v1/works/{work_id}` - Get work detail
- `POST /api/v1/works/` - Create work
- `PATCH /api/v1/works/{work_id}` - Update work
- `DELETE /api/v1/works/{work_id}` - Delete work (soft delete)

### Users

- `GET /api/v1/users/` - List users
- `GET /api/v1/users/{user_id}` - Get user detail

## Frontend Integration

Frontend đã được cấu hình để sử dụng FastAPI:

- API client: `client/src/lib/api.ts`
- Works page: `client/src/pages/works.tsx`

### Environment Variable

Thêm vào `.env` của frontend (nếu cần):

```env
VITE_API_URL=http://localhost:8001
```

## Cấu trúc

```
backend-fastapi/
├── app/
│   ├── __init__.py
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── routers/
│       ├── __init__.py
│       ├── works.py         # Works endpoints
│       ├── users.py         # Users endpoints
│       └── contracts.py     # Contracts endpoints
├── scripts/
│   └── seed_works.py        # Seed script
├── main.py                  # FastAPI app
├── requirements.txt         # Dependencies
├── .env                     # Environment variables
└── README.md               # Documentation
```

## Troubleshooting

### Database Connection Error

Đảm bảo PostgreSQL đang chạy và database `translation_db` đã được tạo:

```bash
# Kiểm tra PostgreSQL
psql -U postgres -d translation_db
```

### Port Already in Use

Nếu port 8001 đã được sử dụng:

```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8001 | xargs kill
```

### Import Errors

Đảm bảo virtual environment đã được activate và dependencies đã được cài đặt:

```bash
pip install -r requirements.txt
```

## Next Steps

1. ✅ Seed database với dữ liệu
2. ✅ Start FastAPI server
3. ✅ Test API endpoints
4. ✅ Frontend sẽ tự động fetch data từ API

