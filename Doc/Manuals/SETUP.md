# 🚀 HƯỚNG DẪN SETUP NHANH

## Bước 1: Kiểm tra Database

Đảm bảo PostgreSQL đang chạy và database `translation_db` đã được tạo:

```sql
-- Kết nối PostgreSQL
psql -U postgres

-- Tạo database nếu chưa có
CREATE DATABASE translation_db;

-- Kiểm tra
\l
```

## Bước 2: File .env đã được tạo

File `.env` đã được tạo với thông tin:
- Database: `postgresql://postgres:01092016@localhost:5432/translation_db`
- OpenAI API Key: đã được cấu hình

## Bước 3: Push Database Schema

Khi chạy `npm run db:push`, nếu được hỏi về các tables:

**Chọn: `+ create table`** cho tất cả các tables mới:
- administrative_tasks
- ai_interactions
- contracts
- council_memberships
- documents
- editing_tasks
- form_templates
- payment_milestones
- payments
- review_councils
- review_evaluations
- reviews
- users
- workflow_audit_log
- works

Hoặc chạy với force mode:
```bash
npm run db:push -- --force
```

## Bước 4: Start Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## Bước 5: Test AI Endpoints

### Test Health Check:
```bash
curl http://localhost:5000/api/ai/health
```

### Test Smart Query:
```bash
curl -X POST http://localhost:5000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Cho tôi xem tất cả các tác phẩm"}'
```

### Test Translation Check:
```bash
curl -X POST http://localhost:5000/api/ai/translation/check \
  -H "Content-Type: application/json" \
  -d '{
    "sourceText": "原文",
    "translatedText": "Bản dịch",
    "domain": "Buddhism"
  }'
```

## Troubleshooting

### Database connection error:
- Kiểm tra PostgreSQL đang chạy: `pg_isready`
- Kiểm tra credentials trong `.env`
- Kiểm tra database đã được tạo

### OpenAI API error:
- Kiểm tra API key trong `.env`
- Verify API key có credit
- Check rate limits

### Port already in use:
- Thay đổi PORT trong `.env`
- Hoặc kill process đang dùng port 5000

