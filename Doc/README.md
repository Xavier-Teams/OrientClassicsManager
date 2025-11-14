# 🚀 HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG

Hệ thống phần mềm quản lý toàn diện cho Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [API Documentation](#api-documentation)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

## ✨ Tính năng

- ✅ **Quản lý Tác phẩm & Dịch thuật** - Quản lý toàn bộ vòng đời tác phẩm
- ✅ **Quản lý Hợp đồng & Thanh toán** - Theo dõi hợp đồng và thanh toán
- ✅ **Thẩm định & Nghiệm thu** - Quản lý hội đồng thẩm định
- ✅ **Biên tập & Xuất bản** - Quản lý quy trình biên tập
- ✅ **Quản lý Hành chính** - Biểu mẫu và quy trình
- ✅ **AI Integration** - Smart queries và translation assistant

## 🛠️ Tech Stack

### Backend
- Python 3.11+
- Django 4.2+
- Django REST Framework
- PostgreSQL
- Redis
- Celery

### Frontend
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Query

## 📦 Cài đặt

### Backend

```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Cài đặt dependencies
cd backend
pip install -r requirements.txt

# Copy file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Chạy migrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 🚀 Chạy dự án

### Backend
```bash
cd backend
python manage.py runserver
```
Backend sẽ chạy tại: http://localhost:8000

### Frontend
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

## 📚 API Documentation

Sau khi chạy backend, truy cập:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## 📁 Cấu trúc dự án

```
.
├── backend/                 # Django backend
│   ├── config/             # Django settings
│   ├── core/               # Core utilities
│   ├── users/              # User management
│   ├── works/              # Works management
│   ├── contracts/          # Contracts & Payments
│   ├── reviews/            # Reviews & Acceptance
│   ├── editing/            # Editing & Publication
│   ├── administration/     # Administration
│   ├── documents/          # Document management
│   ├── ai/                 # AI services
│   └── notifications/      # Notifications
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── store/         # State management
│   └── public/
│
└── Doc/                    # Documentation
```

## 📝 Tài liệu

- [Kế hoạch triển khai chi tiết](./KE_HOACH_TRIEN_KHAI_CHI_TIET.md)
- [Database Schema](./Doc/DATABASE_SCHEMA.md)
- [API Specification](./Doc/API_SPECIFICATION.md)
- [Django Setup Guide](./Doc/DJANGO_SETUP_GUIDE.md)

## 🤝 Đóng góp

Dự án đang trong giai đoạn phát triển. Mọi đóng góp đều được chào đón!

## 📄 License

Copyright © 2024 Dự án Kinh điển Phương Đông

