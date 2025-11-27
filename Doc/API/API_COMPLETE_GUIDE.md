# 🌐 API Complete Guide - OrientClassicsManager

> **Hướng dẫn toàn diện** về API endpoints và integration cho OrientClassicsManager

## 📋 Mục lục

- [🎯 API Overview](#-api-overview)
- [🔐 Authentication](#-authentication)
- [📊 Core Endpoints](#-core-endpoints)
- [🔌 Integration Guide](#-integration-guide)
- [🧪 Testing](#-testing)
- [📚 Examples](#-examples)

---

## 🎯 API Overview

### Base Information
- **Base URL**: `http://localhost:5000/api`
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **Authentication**: Session-based + JWT (optional)

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "timestamp": "2024-11-27T10:30:00Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  },
  "timestamp": "2024-11-27T10:30:00Z"
}
```

---

## 🔐 Authentication

### Session-based Authentication
```javascript
// Login
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "role": "dich_gia"
    },
    "sessionId": "sess_123456"
  }
}
```

### JWT Authentication (Optional)
```javascript
// Headers
Authorization: Bearer <jwt_token>
```

---

## 📊 Core Endpoints

### 👥 Users API

#### Get All Users
```http
GET /api/users
```

#### Get User by ID
```http
GET /api/users/:id
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "dich_gia"
}
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "username": "john_doe_updated",
  "role": "bien_tap_vien"
}
```

#### Delete User
```http
DELETE /api/users/:id
```

### 📄 Contracts API

#### Get All Contracts
```http
GET /api/contracts
Query Parameters:
- status: draft|approved|in_progress|completed
- page: number (default: 1)
- limit: number (default: 10)
```

#### Get Contract by ID
```http
GET /api/contracts/:id
```

#### Create Contract
```http
POST /api/contracts
Content-Type: application/json

{
  "contract_number": "CT2024001",
  "title": "Dịch tài liệu kỹ thuật",
  "client_name": "Công ty ABC",
  "total_amount": 5000000,
  "description": "Mô tả chi tiết contract"
}
```

#### Update Contract Status
```http
PATCH /api/contracts/:id/status
Content-Type: application/json

{
  "status": "approved"
}
```

### 🔤 Translations API

#### Get All Translations
```http
GET /api/translations
Query Parameters:
- status: draft|approved|in_progress|completed
- translator_id: number
- contract_id: number
```

#### Assign Translator
```http
POST /api/translations/:id/assign
Content-Type: application/json

{
  "translator_id": 5
}
```

#### Update Translation Status
```http
PATCH /api/translations/:id/status
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Bắt đầu dịch"
}
```

### 💰 Payments API

#### Get Payments
```http
GET /api/payments
Query Parameters:
- translation_id: number
- status: pending|paid|overdue
```

#### Create Payment
```http
POST /api/payments
Content-Type: application/json

{
  "translation_id": 1,
  "amount": 1000000,
  "due_date": "2024-12-31",
  "description": "Thanh toán dịch thuật"
}
```

---

## 🔌 Integration Guide

### Frontend Integration

#### React/TypeScript Example
```typescript
// api.ts
const API_BASE = 'http://localhost:5000/api';

export class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include', // For session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Users
  async getUsers() {
    return this.request<User[]>('/users');
  }

  async createUser(userData: CreateUserData) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Contracts
  async getContracts(params?: ContractFilters) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Contract[]>(`/contracts?${query}`);
  }
}

// Usage
const api = new ApiClient();

// In component
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  api.getUsers().then(setUsers);
}, []);
```

### Backend Integration

#### Express.js Routes Example
```typescript
// routes/users.ts
import { Router } from 'express';
import { db } from '../db';
import { users } from '../schema';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json({
      success: true,
      data: allUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: error.message,
      },
    });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const newUser = await db.insert(users).values({
      username,
      email,
      password_hash: await hashPassword(password),
      role,
    }).returning();

    res.status(201).json({
      success: true,
      data: newUser[0],
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
```

---

## 🧪 Testing

### Manual Testing with cURL

#### Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# Use session for subsequent requests
curl -X GET http://localhost:5000/api/users \
  -b cookies.txt
```

#### Test CRUD Operations
```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "role": "dich_gia"
  }'

# Get users
curl -X GET http://localhost:5000/api/users \
  -b cookies.txt

# Update user
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"role": "bien_tap_vien"}'
```

### Automated Testing

#### Jest + Supertest Example
```typescript
// tests/api/users.test.ts
import request from 'supertest';
import { app } from '../../server';

describe('Users API', () => {
  let authCookie: string;

  beforeAll(async () => {
    // Login to get session
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password',
      });
    
    authCookie = loginResponse.headers['set-cookie'][0];
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'test_user',
        email: 'test@example.com',
        password: 'password123',
        role: 'dich_gia',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', authCookie)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
    });
  });
});
```

---

## 📚 Examples

### Complete Workflow Example

#### 1. Create Contract
```javascript
const contract = await api.createContract({
  contract_number: 'CT2024001',
  title: 'Dịch tài liệu kỹ thuật',
  client_name: 'Công ty ABC',
  total_amount: 5000000,
});
```

#### 2. Create Translation
```javascript
const translation = await api.createTranslation({
  contract_id: contract.id,
  source_language: 'en',
  target_language: 'vi',
  word_count: 1000,
  deadline: '2024-12-31',
});
```

#### 3. Assign Translator
```javascript
await api.assignTranslator(translation.id, {
  translator_id: 5,
});
```

#### 4. Update Progress
```javascript
await api.updateTranslationStatus(translation.id, {
  status: 'in_progress',
  notes: 'Đã bắt đầu dịch',
});
```

#### 5. Complete Translation
```javascript
await api.updateTranslationStatus(translation.id, {
  status: 'completed',
  notes: 'Hoàn thành dịch thuật',
});
```

### Error Handling Example

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission error
      toast.error('Bạn không có quyền thực hiện thao tác này');
    } else {
      // Show general error
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
    return null;
  }
}

// Usage
const users = await handleApiCall(() => api.getUsers());
if (users) {
  setUsers(users);
}
```

---

## 🔧 Development Tools

### Postman Collection
Import collection từ: `docs/postman/OrientClassicsManager.postman_collection.json`

### OpenAPI/Swagger Documentation
Access tại: `http://localhost:5000/api-docs`

### API Testing Tools
- **Postman**: GUI testing
- **Insomnia**: Alternative to Postman  
- **cURL**: Command line testing
- **HTTPie**: User-friendly HTTP client

---

## 📞 Support

### Common Issues

**CORS Errors**:
```javascript
// Add to server configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));
```

**Session Issues**:
```javascript
// Ensure cookies are sent
fetch('/api/endpoint', {
  credentials: 'include',
});
```

**Rate Limiting**:
```javascript
// Handle rate limit responses
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Wait and retry
}
```

---

*API Documentation for OrientClassicsManager v1.0 - Updated: 2024-11-27*
