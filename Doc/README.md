# 🚀 HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG

Hệ thống phần mềm quản lý toàn diện cho Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tài liệu](#tài-liệu)

## 📌 Tổng quan

Dự án được xây dựng như một **phần mềm độc lập**, không phụ thuộc vào Odoo hay bất kỳ framework nào khác. HRMS chỉ được sử dụng như **nguồn tham khảo** để học hỏi workflow và best practices.

### Kiến trúc

- **Backend**: Django 4.2+ REST Framework + Express.js (Node.js)
- **Frontend**: React 18+ với TypeScript
- **Database**: PostgreSQL
- **AI**: OpenAI API integration
- **Authentication**: JWT

## ✨ Tính năng

- ✅ **Quản lý Tác phẩm & Dịch thuật** - Quản lý toàn bộ vòng đời tác phẩm
- ✅ **Quản lý Hợp đồng & Thanh toán** - Theo dõi hợp đồng và thanh toán
- ✅ **Thẩm định & Nghiệm thu** - Quản lý hội đồng thẩm định
- ✅ **Biên tập & Xuất bản** - Quản lý quy trình biên tập
- ✅ **Quản lý Hành chính** - Biểu mẫu và quy trình
- ✅ **AI Integration** - Smart queries và translation assistant
- ⏳ **Quản lý Tài liệu** - Document management với workflow routing
- ⏳ **Dashboard & Analytics** - Thống kê và báo cáo
- ⏳ **Quản lý Nhân sự** - Employee và department management

## 🛠️ Tech Stack

### Backend
- **Django 4.2+** với Django REST Framework
- **Express.js** với TypeScript
- **PostgreSQL** database
- **Django FSM** cho workflow management
- **JWT** authentication

### Frontend
- **React 18+** với TypeScript
- **Vite** build tool
- **Tailwind CSS** + **shadcn/ui**
- **React Query** cho data fetching

### AI Integration
- **OpenAI API** (GPT-4)
- Smart Query System
- Translation Assistant

## 🚀 Quick Start

### 1. Setup Backend (Express)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Chỉnh sửa .env với thông tin database

# Push database schema
npm run db:push

# Seed database (optional)
npm run db:seed

# Start server
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

### 2. Setup Backend (Django)

```bash
# Activate virtual environment
.\venv-django\Scripts\activate  # Windows
source venv-django/bin/activate  # Linux/Mac

# Navigate to backend-django
cd backend-django

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Django server sẽ chạy tại: **http://localhost:8000**

### 3. Setup Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 📁 Cấu trúc dự án

```
OrientClassicsManager/
├── backend-django/      # Django backend
│   ├── config/         # Django settings
│   ├── users/         # User management
│   ├── works/         # Works & Parts management
│   ├── contracts/     # Contracts management
│   └── ...
│
├── server/             # Express backend
│   ├── ai/            # AI services
│   ├── routes.ts      # API routes
│   └── ...
│
├── client/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── ...
│
├── shared/            # Shared code
│   └── schema.ts     # Database schema
│
└── Doc/              # Documentation
    ├── README.md     # This file
    ├── SETUP_GUIDE.md
    ├── DEVELOPMENT_GUIDE.md
    └── ...
```

## 📚 Tài liệu

### Hướng dẫn Setup
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn setup chi tiết

### Hướng dẫn Phát triển
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển và triển khai

### Tham khảo HRMS
- [HRMS_REFERENCE.md](./HRMS_REFERENCE.md) - Phân tích và tham khảo từ HRMS

### Tài liệu Kỹ thuật
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API Specification
- [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) - Database Schema & Seed
- [AI_PLAN.md](./AI_PLAN.md) - Kế hoạch tích hợp AI

## 🔐 Authentication

Hệ thống sử dụng JWT authentication:
1. Login tại `/api/v1/auth/login/` (Django) hoặc `/api/auth/login` (Express)
2. Nhận access token và refresh token
3. Include token trong header: `Authorization: Bearer <token>`

## 🎯 Định hướng

- ✅ **Độc lập hoàn toàn** - Không phụ thuộc vào Odoo
- ✅ **Tự xây dựng** - Mọi tính năng được implement từ đầu
- ✅ **Tham khảo có chọn lọc** - HRMS chỉ để học hỏi workflow
- ✅ **Tập trung mục tiêu** - Quản lý Dự án và tài liệu

## 🤝 Đóng góp

Dự án đang trong giai đoạn phát triển. Mọi đóng góp đều được chào đón!

## 📄 License

Copyright © 2024 Dự án Kinh điển Phương Đông
