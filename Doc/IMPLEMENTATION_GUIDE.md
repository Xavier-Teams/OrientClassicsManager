# 🚀 HƯỚNG DẪN TRIỂN KHAI
## HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG

---

## 📋 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Setup môi trường](#2-setup-môi-trường)
3. [Cấu trúc dự án](#3-cấu-trúc-dự-án)
4. [Triển khai AI Integration](#4-triển-khai-ai-integration)
5. [Testing](#5-testing)
6. [Deployment](#6-deployment)

---

## 1. TỔNG QUAN

Dự án đã được setup với:
- ✅ Backend: Express + TypeScript + Drizzle ORM
- ✅ Frontend: React + TypeScript + Vite
- ✅ Database: PostgreSQL (Neon)
- ✅ AI Integration: OpenAI GPT-4 (có thể mở rộng)

---

## 2. SETUP MÔI TRƯỜNG

### 2.1. Prerequisites

```bash
# Node.js 18+
node --version

# npm hoặc yarn
npm --version
```

### 2.2. Environment Variables

Tạo file `.env` trong root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# OpenAI API (cho AI features)
OPENAI_API_KEY=sk-...

# Server
PORT=5000
NODE_ENV=development
```

### 2.3. Install Dependencies

```bash
npm install
```

### 2.4. Database Setup

```bash
# Push schema to database
npm run db:push
```

---

## 3. CẤU TRÚC DỰ ÁN

```
OrientClassicsManager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── lib/            # Utilities
│   └── index.html
│
├── server/                  # Express backend
│   ├── ai/                 # AI services (MỚI)
│   │   ├── adapters/       # AI provider adapters
│   │   ├── services/       # AI feature services
│   │   ├── routes.ts       # AI API routes
│   │   └── types.ts        # TypeScript types
│   ├── db.ts              # Database connection
│   ├── routes.ts          # Main API routes
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
│
├── shared/                 # Shared code
│   └── schema.ts          # Database schema
│
└── Doc/                    # Documentation
    ├── AI_INTEGRATION_PLAN.md
    ├── CREATIVE_IDEAS.md
    └── IMPLEMENTATION_GUIDE.md
```

---

## 4. TRIỂN KHAI AI INTEGRATION

### 4.1. Cấu trúc AI Services

#### Base Adapter Pattern

```typescript
// server/ai/adapters/base-adapter.ts
export abstract class BaseAIAdapter {
  abstract chatCompletion(messages: AIMessage[]): Promise<string>;
  abstract embedding(text: string): Promise<number[]>;
  abstract getCostEstimate(tokens: number): number;
}
```

#### OpenAI Adapter

```typescript
// server/ai/adapters/openai-adapter.ts
export class OpenAIAdapter extends BaseAIAdapter {
  // Implementation với OpenAI SDK
}
```

### 4.2. AI Services

#### Smart Query Service

**Mục đích:** Cho phép truy vấn dữ liệu bằng ngôn ngữ tự nhiên

**API Endpoint:**
```http
POST /api/ai/query
Content-Type: application/json

{
  "query": "Cho tôi xem các tác phẩm đang dịch của dịch giả Nguyễn Văn A",
  "context": {
    "userId": "user_123",
    "role": "thu_ky"
  }
}
```

**Response:**
```json
{
  "queryType": "list_work",
  "results": [...],
  "explanation": "Tìm thấy 3 tác phẩm đang dịch...",
  "metadata": {
    "intent": {...},
    "resultCount": 3
  }
}
```

#### Translation Assistant Service

**Mục đích:** Kiểm tra chất lượng bản dịch

**API Endpoint:**
```http
POST /api/ai/translation/check
Content-Type: application/json

{
  "sourceText": "原文",
  "translatedText": "Bản dịch",
  "domain": "Buddhism",
  "workId": "work_123"
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
      "text": "建议修改",
      "suggestion": "Có thể dịch thành 'Đề xuất chỉnh sửa'",
      "reason": "Thuật ngữ chuyên ngành phù hợp hơn"
    }
  ],
  "terminologyIssues": [...]
}
```

### 4.3. Thêm AI Provider mới

Để thêm provider mới (ví dụ: Claude, Ollama):

1. Tạo adapter mới:
```typescript
// server/ai/adapters/claude-adapter.ts
export class ClaudeAdapter extends BaseAIAdapter {
  // Implement methods
}
```

2. Update AI routes để chọn adapter:
```typescript
const adapter = process.env.AI_PROVIDER === 'claude' 
  ? new ClaudeAdapter() 
  : new OpenAIAdapter();
```

---

## 5. TESTING

### 5.1. Test AI Health Check

```bash
curl http://localhost:5000/api/ai/health
```

Expected response:
```json
{
  "status": "healthy",
  "adapter": "OpenAI",
  "testResponse": "OK if you can hear me."
}
```

### 5.2. Test Smart Query

```bash
curl -X POST http://localhost:5000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Cho tôi xem tất cả các tác phẩm",
    "context": {
      "userId": "test_user",
      "role": "thu_ky"
    }
  }'
```

### 5.3. Test Translation Check

```bash
curl -X POST http://localhost:5000/api/ai/translation/check \
  -H "Content-Type: application/json" \
  -d '{
    "sourceText": "原文",
    "translatedText": "Bản dịch",
    "domain": "Buddhism"
  }'
```

---

## 6. DEPLOYMENT

### 6.1. Environment Variables cho Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PORT=5000
```

### 6.2. Build Frontend

```bash
npm run build
```

### 6.3. Build Backend

```bash
npm run build
```

### 6.4. Run Production Server

```bash
npm start
```

---

## 7. NEXT STEPS

### Phase 1: Foundation (Tuần 1-2)
- [x] Setup AI infrastructure
- [x] Implement base adapters
- [x] Create Smart Query service
- [x] Create Translation Assistant service
- [ ] Add error handling & logging
- [ ] Add rate limiting
- [ ] Add caching

### Phase 2: Frontend Integration (Tuần 3-4)
- [ ] Create Smart Query UI component
- [ ] Create Translation Check UI component
- [ ] Add AI Assistant page
- [ ] Integrate với existing pages

### Phase 3: Advanced Features (Tuần 5-6)
- [ ] Document Intelligence
- [ ] Workflow Automation
- [ ] Predictive Analytics
- [ ] Cost tracking & monitoring

---

## 8. TROUBLESHOOTING

### Issue: OpenAI API Key không hoạt động

**Solution:**
1. Kiểm tra API key trong `.env`
2. Verify API key có credit
3. Check rate limits

### Issue: Database connection error

**Solution:**
1. Verify `DATABASE_URL` trong `.env`
2. Check database accessibility
3. Run `npm run db:push` để sync schema

### Issue: AI responses không chính xác

**Solution:**
1. Improve prompts trong services
2. Add more context trong requests
3. Implement fallback logic

---

## 9. RESOURCES

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

**Chúc bạn thành công với dự án! 🎉**

