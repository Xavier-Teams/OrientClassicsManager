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

- **Backend**: Django 4.2+ REST Framework + Express.js (Node.js)
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
- ✅ Tự xây dựng từ đầu với Django/React
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
├── backend-django/          # Django backend
│   ├── config/             # Django settings
│   ├── users/              # User management
│   ├── works/              # Works & Parts
│   ├── contracts/          # Contracts
│   ├── reviews/            # Reviews
│   ├── editing/            # Editing tasks
│   ├── administration/    # Admin tasks
│   ├── documents/          # Document management
│   └── ai/                 # AI services
│
├── server/                 # Express backend
│   ├── ai/                 # AI services
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Data access
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
│   └── ...
│
├── shared/                 # Shared code
│   └── schema.ts         # Database schema
│
└── Doc/                   # Documentation
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

**Implementation:** Django FSM (không dùng Odoo workflow engine)

### Document Routing Workflow

```
sent → received → processed → approved/rejected
```

**Implementation:** Django models và custom logic

---

## Development Workflow

### 1. Feature Development

1. **Phân tích yêu cầu** - Hiểu nghiệp vụ từ HRMS (nếu có)
2. **Thiết kế database** - Tự thiết kế schema phù hợp
3. **Implement Backend** - Django models và APIs
4. **Implement Frontend** - React components
5. **Test** - Unit tests và integration tests
6. **Documentation** - Update docs

### 2. Code Standards

- **Backend**: PEP 8 (Python), ESLint (TypeScript)
- **Frontend**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branching**: Git Flow

### 3. Testing

```bash
# Django tests
cd backend-django
python manage.py test

# Express tests (when implemented)
npm test

# Frontend tests (when implemented)
npm run test
```

---

## API Development

### Django REST Framework

```python
# Example: Works API
class TranslationWorkViewSet(viewsets.ModelViewSet):
    queryset = TranslationWork.objects.filter(active=True)
    serializer_class = TranslationWorkSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        work = self.get_object()
        work.approve()
        work.save()
        return Response({'status': 'approved'})
```

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

1. **Update schema** (`shared/schema.ts` cho Express)
2. **Create migrations** (`python manage.py makemigrations` cho Django)
3. **Apply migrations** (`npm run db:push` hoặc `python manage.py migrate`)
4. **Update seed script** (nếu cần)

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

