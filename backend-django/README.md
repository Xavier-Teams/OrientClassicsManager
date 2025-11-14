# 🐍 Django Backend - OrientClassicsManager

## 📋 Setup Instructions

### 1. Activate Virtual Environment

**Windows:**
```powershell
.\venv-django\Scripts\activate
```

**Linux/Mac:**
```bash
source venv-django/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=01092016
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your-openai-api-key
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

Server will run at: **http://localhost:8000**

## 📁 Project Structure

```
backend-django/
├── config/          # Django project settings
├── users/           # User management app
├── works/           # Translation works app
├── contracts/       # Contracts app
├── reviews/         # Reviews app
├── editing/         # Editing tasks app
├── administration/  # Administrative tasks app
├── documents/       # Documents app
├── ai/              # AI services app
└── manage.py        # Django management script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - Login (get JWT token)
- `POST /api/v1/auth/refresh/` - Refresh JWT token
- `GET /api/v1/auth/users/` - List users
- `GET /api/v1/auth/users/me/` - Get current user

### Works
- `GET /api/v1/works/` - List works
- `POST /api/v1/works/` - Create work
- `GET /api/v1/works/{id}/` - Get work detail
- `PATCH /api/v1/works/{id}/` - Update work
- `POST /api/v1/works/{id}/approve/` - Approve work
- `POST /api/v1/works/{id}/assign_translator/` - Assign translator

### Contracts
- `GET /api/v1/contracts/` - List contracts
- `POST /api/v1/contracts/` - Create contract
- `GET /api/v1/contracts/{id}/` - Get contract detail

### AI Services
- `POST /api/v1/ai/query/` - Smart query
- `POST /api/v1/ai/translation/check/` - Translation quality check

## 🗄️ Database

Django backend uses the same PostgreSQL database as Express backend:
- Database: `translation_db`
- User: `postgres`
- Port: `5432`

## 🔐 Authentication

API uses JWT (JSON Web Tokens) for authentication:
1. Login at `/api/v1/auth/login/` with username/password
2. Receive access token and refresh token
3. Include token in header: `Authorization: Bearer <token>`

## 📝 Notes

- Django backend runs on port **8000** (default)
- Express backend runs on port **5000**
- Both backends can share the same database
- CORS is configured to allow requests from frontend (port 5173)

## 🚀 Next Steps

1. Complete models for reviews, editing, administration, documents
2. Implement AI services integration
3. Add file upload handling
4. Implement workflow state transitions
5. Add comprehensive tests

