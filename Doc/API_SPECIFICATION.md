# 🔌 API SPECIFICATION
## HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG

---

## 📋 MỤC LỤC

1. [Authentication](#1-authentication)
2. [Works API](#2-works-api)
3. [Contracts API](#3-contracts-api)
4. [Reviews API](#4-reviews-api)
5. [Editing API](#5-editing-api)
6. [Administration API](#6-administration-api)
7. [Documents API](#7-documents-api)
8. [AI API](#8-ai-api)

---

## 1. AUTHENTICATION

### 1.1. Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
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
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "thư_ký"
  }
}
```

### 1.2. Refresh Token

```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 1.3. Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
```

---

## 2. WORKS API

### 2.1. List Works

```http
GET /api/v1/works/?page=1&page_size=20&state=in_progress&translator_id=1
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)
- `state`: Filter by state
- `translator_id`: Filter by translator
- `translation_part_id`: Filter by part
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
      "name": "Tác phẩm 1",
      "author": "Tác giả A",
      "state": "in_progress",
      "progress": 50,
      "translator": {
        "id": 1,
        "full_name": "Nguyễn Văn A"
      },
      "translation_part": {
        "id": 1,
        "name": "Phật giáo"
      },
      "priority": "1",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T15:30:00Z"
    }
  ]
}
```

### 2.2. Get Work Detail

```http
GET /api/v1/works/{id}/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": 1,
  "name": "Tác phẩm 1",
  "author": "Tác giả A",
  "source_language": "Hán văn",
  "target_language": "Tiếng Việt",
  "page_count": 500,
  "word_count": 100000,
  "description": "Mô tả tác phẩm",
  "state": "in_progress",
  "progress": 50,
  "translator": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "translator@example.com"
  },
  "translation_part": {
    "id": 1,
    "name": "Phật giáo",
    "code": "PG"
  },
  "contract": {
    "id": 1,
    "contract_number": "HD-2024-001",
    "status": "signed",
    "total_amount": "50000000.00"
  },
  "documents": [
    {
      "id": 1,
      "document_type": "source",
      "file_name": "ban_nen.pdf",
      "file_size": 1024000,
      "uploaded_at": "2024-01-15T10:00:00Z"
    }
  ],
  "history": [
    {
      "id": 1,
      "action": "state_changed",
      "old_value": "draft",
      "new_value": "approved",
      "changed_by": {
        "id": 2,
        "full_name": "Trưởng ban Thư ký"
      },
      "changed_at": "2024-01-16T09:00:00Z"
    }
  ],
  "priority": "1",
  "notes": "",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T15:30:00Z"
}
```

### 2.3. Create Work

```http
POST /api/v1/works/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Tác phẩm mới",
  "author": "Tác giả B",
  "source_language": "Hán văn",
  "target_language": "Tiếng Việt",
  "page_count": 300,
  "word_count": 60000,
  "description": "Mô tả",
  "translation_part_id": 1,
  "priority": "0"
}
```

### 2.4. Update Work

```http
PATCH /api/v1/works/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Tác phẩm đã cập nhật",
  "priority": "1"
}
```

### 2.5. Work State Transitions

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

#### Start Trial Translation
```http
POST /api/v1/works/{id}/start_trial/
Authorization: Bearer {access_token}
```

### 2.6. Upload Document

```http
POST /api/v1/works/{id}/documents/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [file]
document_type: "source"
description: "Bản nền"
```

---

## 3. CONTRACTS API

### 3.1. List Contracts

```http
GET /api/v1/contracts/?status=signed&translator_id=1
Authorization: Bearer {access_token}
```

### 3.2. Get Contract Detail

```http
GET /api/v1/contracts/{id}/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": 1,
  "contract_number": "HD-2024-001",
  "work": {
    "id": 1,
    "name": "Tác phẩm 1"
  },
  "translator": {
    "id": 1,
    "full_name": "Nguyễn Văn A"
  },
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "total_amount": "50000000.00",
  "advance_payment_1": "15000000.00",
  "advance_payment_2": "20000000.00",
  "final_payment": "15000000.00",
  "status": "signed",
  "signed_at": "2024-01-15T10:00:00Z",
  "payments": [
    {
      "id": 1,
      "payment_type": "advance_1",
      "amount": "15000000.00",
      "status": "completed",
      "requested_at": "2024-01-16T09:00:00Z",
      "completed_at": "2024-01-18T14:00:00Z"
    }
  ],
  "created_at": "2024-01-10T08:00:00Z"
}
```

### 3.3. Create Contract

```http
POST /api/v1/contracts/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "work_id": 1,
  "translator_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "total_amount": "50000000.00",
  "advance_payment_1": "15000000.00",
  "advance_payment_2": "20000000.00",
  "final_payment": "15000000.00"
}
```

### 3.4. Sign Contract

```http
POST /api/v1/contracts/{id}/sign/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

contract_file: [file]
```

---

## 4. REVIEWS API

### 4.1. List Councils

```http
GET /api/v1/reviews/councils/?council_type=expert_review&work_id=1
Authorization: Bearer {access_token}
```

### 4.2. Create Council

```http
POST /api/v1/reviews/councils/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "council_type": "expert_review",
  "name": "Hội đồng thẩm định Tác phẩm 1",
  "work_id": 1,
  "chairman_id": 2,
  "secretary_id": 3,
  "members": [
    {"member_id": 4, "role": "member"},
    {"member_id": 5, "role": "expert"}
  ],
  "meeting_date": "2024-02-15T10:00:00Z",
  "meeting_type": "in_person",
  "meeting_location": "Phòng họp A"
}
```

### 4.3. Submit Review Form

```http
POST /api/v1/reviews/forms/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

council_id: 1
work_id: 1
quality_score: 8
accuracy_score: 9
style_score: 8
overall_score: 8.33
conclusion: "pass"
comments: "Bản dịch chất lượng tốt"
review_file: [file]
track_changes_file: [file]
```

### 4.4. Get Review Form

```http
GET /api/v1/reviews/forms/{id}/
Authorization: Bearer {access_token}
```

---

## 5. EDITING API

### 5.1. List Editing Tasks

```http
GET /api/v1/editing/tasks/?work_id=1&status=pending
Authorization: Bearer {access_token}
```

### 5.2. Create Editing Task

```http
POST /api/v1/editing/tasks/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "work_id": 1,
  "task_type": "proof_1",
  "assigned_to_id": 6,
  "title": "Biên tập bông 1 - Tác phẩm 1",
  "description": "Kiểm tra và chỉnh sửa bản dịch",
  "due_date": "2024-03-01T17:00:00Z"
}
```

### 5.3. Update Task Status

```http
PATCH /api/v1/editing/tasks/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "completed",
  "output_file_id": 10
}
```

---

## 6. ADMINISTRATION API

### 6.1. List Form Templates

```http
GET /api/v1/administration/form_templates/?is_active=true
Authorization: Bearer {access_token}
```

### 6.2. Upload Form Template

```http
POST /api/v1/administration/form_templates/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

name: "Phiếu thẩm định dịch thử"
code: "BM.TK-03"
description: "Biểu mẫu thẩm định bản dịch thử"
template_file: [file]
template_type: "word"
version: "1.0"
```

### 6.3. Generate Document from Template

```http
POST /api/v1/administration/form_templates/{id}/generate/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "data": {
    "work_name": "Tác phẩm 1",
    "translator_name": "Nguyễn Văn A",
    "review_date": "2024-02-15"
  },
  "output_format": "word"  // word, pdf, excel
}
```

### 6.4. List Administrative Tasks

```http
GET /api/v1/administration/tasks/?assigned_to_id=1&status=pending
Authorization: Bearer {access_token}
```

---

## 7. DOCUMENTS API

### 7.1. Upload Document

```http
POST /api/v1/documents/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [file]
name: "Tài liệu mới"
category: "contract"
description: "Mô tả"
is_public: false
```

### 7.2. Download Document

```http
GET /api/v1/documents/{id}/download/
Authorization: Bearer {access_token}
```

### 7.3. List Documents

```http
GET /api/v1/documents/?category=contract&search=tài liệu
Authorization: Bearer {access_token}
```

---

## 8. AI API

### 8.1. Smart Query

```http
POST /api/v1/ai/query/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "query": "Cho tôi xem các tác phẩm đang dịch của dịch giả Nguyễn Văn A",
  "context": {
    "user_id": 1,
    "role": "thư_ký"
  }
}
```

**Response:**
```json
{
  "query_type": "list_works",
  "results": [
    {
      "id": 1,
      "name": "Tác phẩm 1",
      "state": "in_progress",
      "progress": 50
    }
  ],
  "explanation": "Tìm thấy 3 tác phẩm đang dịch của dịch giả Nguyễn Văn A"
}
```

### 8.2. Translation Quality Check

```http
POST /api/v1/ai/translation/check/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "source_text": "原文",
  "translated_text": "Bản dịch",
  "domain": "Buddhism"
}
```

**Response:**
```json
{
  "quality_score": 8.5,
  "accuracy_score": 9.0,
  "style_score": 8.0,
  "suggestions": [
    {
      "text": "建议修改",
      "suggestion": "Có thể dịch thành 'Đề xuất chỉnh sửa'",
      "reason": "Thuật ngữ chuyên ngành phù hợp hơn"
    }
  ],
  "terminology_issues": [
    {
      "term": "术语",
      "current": "Thuật ngữ hiện tại",
      "suggested": "Thuật ngữ đề xuất",
      "consistency": 0.85
    }
  ]
}
```

### 8.3. Document Summarization

```http
POST /api/v1/ai/documents/summarize/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "document_id": 1,
  "max_length": 500
}
```

### 8.4. Chatbot

```http
POST /api/v1/ai/chat/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "Tôi cần làm gì tiếp theo?",
  "conversation_id": "conv_123",  // Optional
  "context": {
    "user_id": 1,
    "current_page": "dashboard"
  }
}
```

**Response:**
```json
{
  "response": "Bạn có 3 công việc cần xử lý:\n1. Duyệt hợp đồng Tác phẩm X\n2. Gửi tài liệu thẩm định\n3. Chuẩn bị hồ sơ thanh toán",
  "actions": [
    {
      "type": "navigate",
      "url": "/contracts/123"
    },
    {
      "type": "create_task",
      "task": {
        "title": "Gửi tài liệu thẩm định",
        "priority": "high"
      }
    }
  ],
  "conversation_id": "conv_123"
}
```

---

## 📝 ERROR RESPONSES

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["Error message"]
    }
  }
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 🔐 AUTHENTICATION

All API endpoints (except login/register) require JWT authentication:

```http
Authorization: Bearer {access_token}
```

---

## 📊 PAGINATION

All list endpoints support pagination:

```json
{
  "count": 150,
  "next": "http://api.example.com/api/v1/works/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## 🔍 FILTERING & SEARCHING

Most list endpoints support:
- **Filtering**: `?field=value`
- **Search**: `?search=keyword`
- **Ordering**: `?ordering=field` or `?ordering=-field` (descending)

---

**Lưu ý:** API này sẽ được cập nhật và mở rộng trong quá trình phát triển.

