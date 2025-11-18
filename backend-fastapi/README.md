# FastAPI Backend for OrientClassicsManager

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv-fastapi
# Windows
venv-fastapi\Scripts\activate
# Linux/Mac
source venv-fastapi/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

File `.env` đã được tạo với cấu hình database.

### 4. Run Server

```bash
python main.py
```

Hoặc:

```bash
uvicorn main:app --reload --port 8001
```

Server sẽ chạy tại: **http://localhost:8001**

### 5. Seed Database

```bash
python scripts/seed_works.py
```

## API Documentation

Sau khi chạy server, truy cập:

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Endpoints

### Works

- `GET /api/v1/works/` - List works (với pagination và filters)
- `GET /api/v1/works/board` - Get works organized by status
- `GET /api/v1/works/{work_id}` - Get work detail
- `POST /api/v1/works/` - Create work
- `PATCH /api/v1/works/{work_id}` - Update work
- `DELETE /api/v1/works/{work_id}` - Delete work

### Users

- `GET /api/v1/users/` - List users
- `GET /api/v1/users/{user_id}` - Get user detail
