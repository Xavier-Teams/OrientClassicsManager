# 🛠️ HƯỚNG DẪN PHÁT TRIỂN

## 📋 Mục lục

1. [Định hướng dự án](#định-hướng-dự-án)
2. [Nguyên tắc phát triển](#nguyên-tắc-phát-triển)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Workflow Development](#workflow-development)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Định hướng dự án

### Mục tiêu

Xây dựng một **phần mềm quản lý Dự án và quản lý tài liệu độc lập**, không phụ thuộc vào Odoo hay bất kỳ framework nào khác.

### Kiến trúc

- **Backend**: Express.js (Node.js) + Drizzle ORM
- **Frontend**: React 18+ với TypeScript
- **Database**: PostgreSQL
- **AI**: OpenAI API integration

### Vai trò của HRMS

- ✅ **Tham khảo workflow** - Hiểu quy trình nghiệp vụ
- ✅ **Best practices** - Học hỏi cách tổ chức code và data
- ✅ **UI/UX patterns** - Tham khảo giao diện
- ❌ **KHÔNG copy code** - Không copy trực tiếp từ Odoo
- ❌ **KHÔNG migrate** - Không chuyển sang kiến trúc Odoo

---

## Nguyên tắc phát triển

### 1. Độc lập hoàn toàn

- ✅ Không có dependency vào Odoo
- ✅ Tự xây dựng từ đầu với Express/React
- ✅ Database schema tự thiết kế

### 2. Code Quality

- ✅ Clean code principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Proper error handling
- ✅ Comprehensive documentation

### 3. Tập trung mục tiêu

- ✅ Quản lý Dự án dịch thuật
- ✅ Quản lý tài liệu
- ✅ Workflow management
- ❌ Không cần các tính năng HR phức tạp không liên quan

---

## Cấu trúc dự án

```
OrientClassicsManager/
├── server/                 # Express backend
│   ├── ai/                 # AI services
│   ├── routes.ts           # API routes
│   ├── db.ts               # Database connection (pg pool)
│   └── storage.ts          # Data access
│
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities
│   └── ...
│
├── shared/                 # Shared code
│   └── schema.ts           # Drizzle schema
│
└── Doc/                    # Documentation
```

---

## Workflow Development

### Translation Workflow

```
draft → approved → translator_assigned → trial_translation → 
trial_reviewed → contract_signed → in_progress → 
progress_checked → final_translation → expert_reviewed → 
project_accepted → completed
```

**Implementation:** Express + Drizzle, lưu trạng thái qua bảng workflow/status

### Document Routing Workflow

```
sent → received → processed → approved/rejected
```

**Implementation:** Express middleware/services và logic nghiệp vụ

---

## Development Workflow

### 1. Feature Development

1. **Phân tích yêu cầu** - Hiểu nghiệp vụ/tính năng
2. **Thiết kế database** - Cập nhật Drizzle schema
3. **Implement Backend** - Express routes/services
4. **Implement Frontend** - React components/pages
5. **Test** - Unit/integration tests
6. **Documentation** - Cập nhật docs

### 2. Code Standards

- **Backend**: ESLint + Prettier (TypeScript)
- **Frontend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branching**: Git Flow

### 3. Testing

```bash
# Server tests (when implemented)
npm test

# Frontend tests (when implemented)
npm run test
```

---

## API Development

### Best Practices (Express)

- Tách routes → controllers/services → data access (storage)
- Xác thực và phân quyền qua middleware
- Dùng Drizzle để truy cập DB, tránh raw SQL nếu không cần

### Express.js APIs

```typescript
// Example: Works API
app.get('/api/works', async (req, res) => {
  const works = await db.select().from(schema.works);
  res.json(works);
});
```

---

## Frontend Development

### Component Structure

```typescript
// Example: WorkCard component
export const WorkCard = ({ work }: { work: Work }) => {
  const { data, isLoading } = useQuery(['work', work.id], () => 
    api.getWork(work.id)
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{work.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
};
```

### State Management

- **React Query** - Server state
- **Zustand** - Client state (nếu cần)
- **Context API** - Theme, auth context

---

## Database Development

### Schema Changes

1. **Update schema** (`shared/schema.ts`)
2. **Apply migrations** (`npm run db:push`)
3. **Seed data** (nếu cần) (`npm run db:seed`)

### Best Practices

- ✅ Sử dụng migrations thay vì raw SQL
- ✅ Backup database trước khi migrate
- ✅ Test migrations trên dev environment trước
- ✅ Document schema changes

---

## AI Integration

### Smart Query

```typescript
// Example usage
const response = await fetch('/api/ai/query', {
  method: 'POST',
  body: JSON.stringify({
    query: "Cho tôi xem các tác phẩm đang dịch",
    context: { userId: user.id, role: user.role }
  })
});
```

### Translation Assistant

```typescript
// Quality check
const result = await fetch('/api/ai/translation/check', {
  method: 'POST',
  body: JSON.stringify({
    sourceText: "原文",
    translatedText: "Bản dịch",
    domain: "Buddhism"
  })
});
```

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Static files collected (Django)
- [ ] Frontend built (`npm run build`)
- [ ] Server configured (Nginx/Apache)
- [ ] SSL certificates installed
- [ ] Monitoring setup
- [ ] Backup strategy

### Docker (Future)

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Best Practices

### Backend

- ✅ Use Django ORM thay vì raw SQL
- ✅ Validate input với serializers
- ✅ Handle errors properly
- ✅ Use pagination cho list APIs
- ✅ Cache expensive queries

### Frontend

- ✅ Use React Query cho data fetching
- ✅ Memoize expensive components
- ✅ Lazy load routes
- ✅ Optimize bundle size
- ✅ Handle loading và error states

### Database

- ✅ Add indexes cho foreign keys
- ✅ Use transactions cho operations phức tạp
- ✅ Avoid N+1 queries
- ✅ Regular backups

---

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [React Query](https://tanstack.com/query/latest)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Xem thêm:**
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn setup
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API docs
- [HRMS_REFERENCE.md](./HRMS_REFERENCE.md) - Tham khảo HRMS

