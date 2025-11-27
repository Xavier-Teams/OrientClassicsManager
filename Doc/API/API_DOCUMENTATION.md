# 🔌 API DOCUMENTATION

## 📋 Mục lục

1. [Authentication](#authentication)
2. [Works API](#works-api)
3. [Contracts API](#contracts-api)
4. [Reviews API](#reviews-api)
5. [Documents API](#documents-api)
6. [AI API](#ai-api)
7. [Dashboard API](#dashboard-api)

---

## Authentication

### Login (Django)

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "chu_nhiem"
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Current User

```http
GET /api/v1/auth/users/me/
Authorization: Bearer {access_token}
```

---

## Works API

### List Works

```http
GET /api/v1/works/?page=1&page_size=20&state=in_progress&translator_id=1&part_id=1&priority=1
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)
- `state`: Filter by state (draft, approved, in_progress, etc.)
- `translator_id`: Filter by translator
- `part_id`: Filter by translation part
- `priority`: Filter by priority (0, 1, 2)
- `search`: Search in name/author
- `ordering`: Sort field (default: `-created_at`)

**Response:**
```json
{
  "count": 150,
  "next": "http://api.example.com/api/v1/works/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Kinh Kim Cương",
      "author": "Phật Thích Ca",
      "state": "in_progress",
      "progress": 50,
      "translator": {
        "id": 1,
        "full_name": "Nguyễn Văn A"
      },
      "translation_part": {
        "id": 1,
        "name": "Phật giáo",
        "code": "PG"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Work Detail

```http
GET /api/v1/works/{id}/
Authorization: Bearer {access_token}
```

### Create Work

```http
POST /api/v1/works/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Tác phẩm mới",
  "author": "Tác giả",
  "source_language": "Hán văn",
  "target_language": "Tiếng Việt",
  "translation_part": 1,
  "page_count": 100,
  "word_count": 50000
}
```

### Update Work

```http
PATCH /api/v1/works/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "state": "approved",
  "translator": 1
}
```

### Workflow Actions

#### Approve Work

```http
POST /api/v1/works/{id}/approve/
Authorization: Bearer {access_token}
```

#### Assign Translator

```http
POST /api/v1/works/{id}/assign_translator/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "translator_id": 1
}
```

#### Start Trial

```http
POST /api/v1/works/{id}/start_trial/
Authorization: Bearer {access_token}
```

---

## Translation Parts API

### List Parts

```http
GET /api/v1/works/parts/?manager_id=1&team_leader_id=2&search=keyword
Authorization: Bearer {access_token}
```

### Get Part Detail

```http
GET /api/v1/works/parts/{id}/
Authorization: Bearer {access_token}
```

### Get Part Works

```http
GET /api/v1/works/parts/{id}/works/?status=in_progress
Authorization: Bearer {access_token}
```

### Get Part Statistics

```http
GET /api/v1/works/parts/{id}/statistics/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "part": {
    "id": 1,
    "name": "Phật giáo",
    "code": "PG"
  },
  "statistics": {
    "total_works": 50,
    "in_progress": 20,
    "completed": 25,
    "average_progress": 65.5,
    "by_status": [
      {"state": "in_progress", "count": 20},
      {"state": "completed", "count": 25}
    ],
    "by_priority": [
      {"priority": "0", "count": 30},
      {"priority": "1", "count": 15}
    ]
  }
}
```

---

## Contracts API

### List Contracts

```http
GET /api/v1/contracts/?status=signed&work_id=1
Authorization: Bearer {access_token}
```

### Get Contract Detail

```http
GET /api/v1/contracts/{id}/
Authorization: Bearer {access_token}
```

### Create Contract

```http
POST /api/v1/contracts/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "contract_number": "HD-2024-001",
  "work": 1,
  "translator": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "total_amount": "10000000"
}
```

---

## AI API

### Smart Query

```http
POST /api/v1/ai/query/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "query": "Cho tôi xem các tác phẩm đang dịch của dịch giả Nguyễn Văn A",
  "context": {
    "userId": 1,
    "role": "thu_ky"
  }
}
```

**Response:**
```json
{
  "query": "Cho tôi xem các tác phẩm đang dịch...",
  "interpretation": {
    "type": "works",
    "filters": {
      "translator_id": 1,
      "state": "in_progress"
    }
  },
  "results": [
    {
      "id": 1,
      "name": "Kinh Kim Cương",
      "state": "in_progress"
    }
  ]
}
```

### Translation Quality Check

```http
POST /api/v1/ai/translation/check/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sourceText": "原文",
  "translatedText": "Bản dịch tiếng Việt",
  "domain": "Buddhism"
}
```

**Response:**
```json
{
  "qualityScore": 8.5,
  "accuracyScore": 9.0,
  "styleScore": 8.0,
  "suggestions": [
    {
      "type": "terminology",
      "original": "từ A",
      "suggestion": "từ B",
      "reason": "Thuật ngữ chuẩn hơn"
    }
  ]
}
```

---

## Dashboard API

### Overall Statistics

```http
GET /api/v1/dashboard/stats/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "works": {
    "total": 150,
    "by_status": {
      "draft": 10,
      "in_progress": 50,
      "completed": 80
    }
  },
  "contracts": {
    "total": 100,
    "total_budget": 1000000000,
    "paid_amount": 500000000
  },
  "progress": {
    "average": 65.5,
    "on_time": 120,
    "overdue": 30
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication credentials were not provided."
}
```

### 404 Not Found

```json
{
  "error": "Not found."
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## Rate Limiting

- **Default**: 100 requests per minute per user
- **AI endpoints**: 10 requests per minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Pagination

Tất cả list endpoints hỗ trợ pagination:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Response includes:
- `count`: Total number of items
- `next`: URL to next page
- `previous`: URL to previous page
- `results`: Array of items

---

**Xem thêm:**
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development guide
- [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) - Database schema

