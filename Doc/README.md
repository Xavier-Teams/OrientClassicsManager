# 📚 OrientClassicsManager Documentation

> **Tài liệu tổng hợp** cho hệ thống quản lý dự án dịch thuật OrientClassicsManager

## 🎯 Tổng quan dự án

OrientClassicsManager là hệ thống quản lý dự án dịch thuật được phát triển với:

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Express.js + Drizzle ORM
- **Database**: PostgreSQL
- **Architecture**: Full-stack TypeScript

---

## 📋 Cấu trúc tài liệu

### 🚀 Setup

- Hướng dẫn cài đặt và triển khai hệ thống cho Developer

- [COMPLETE_SETUP_GUIDE.md](Setup/COMPLETE_SETUP_GUIDE.md) — Cài đặt hoàn chỉnh
- [QUICK_START.md](Setup/QUICK_START.md) — Khởi động nhanh
- [SETUP_GUIDE.md](Setup/SETUP_GUIDE.md) — Setup chi tiết

### 🗄️ Database

- Tài liệu PostgreSQL, schema, backup/restore

- [DATABASE_COMPLETE_GUIDE.md](Database/DATABASE_COMPLETE_GUIDE.md) — Hướng dẫn database toàn diện
- [DATABASE_DOCUMENTATION.md](Database/DATABASE_DOCUMENTATION.md) — Tài liệu schema
- [QUICK_START_DATABASE.md](Database/QUICK_START_DATABASE.md) — Khởi tạo database nhanh
- [PGADMIN4_SETUP_GUIDE.md](Database/PGADMIN4_SETUP_GUIDE.md) — Cài đặt pgAdmin4

### 🌐 API

- Tài liệu API và tích hợp

- [API_COMPLETE_GUIDE.md](API/API_COMPLETE_GUIDE.md) — Hướng dẫn API toàn diện
- [API_DOCUMENTATION.md](API/API_DOCUMENTATION.md) — Chi tiết endpoints
- [API_CONNECTION_GUIDE.md](API/API_CONNECTION_GUIDE.md) — Hướng dẫn kết nối

### 🔧 Development

- Quy trình phát triển, debug, kết nối FE/BE

- [DEVELOPMENT_GUIDE.md](Development/DEVELOPMENT_GUIDE.md) — Hướng dẫn phát triển
- [FE_BE_CONNECTION_SUMMARY.md](Development/FE_BE_CONNECTION_SUMMARY.md) — Kết nối Frontend-Backend

### 🏗️ Architecture

- Kiến trúc hệ thống và quyết định thiết kế

- [SYSTEM_ARCHITECTURE.md](Architecture/SYSTEM_ARCHITECTURE.md) — Tổng quan kiến trúc
- [ARCHITECTURE_DECISION.md](Architecture/ARCHITECTURE_DECISION.md) — Quyết định kiến trúc
- [PAYMENT_ARCHITECTURE.md](Architecture/PAYMENT_ARCHITECTURE.md) — Kiến trúc thanh toán

### � Integrations

- Tài liệu tích hợp hệ thống bên ngoài (tùy chọn)

- [MATTERMOST_INTEGRATION.md](Integration/MATTERMOST_INTEGRATION.md) — Tích hợp Mattermost
- [MATTERMOST_QUICK_START.md](Integration/MATTERMOST_QUICK_START.md) — Quick start Mattermost

### 🤖 N8N (tùy chọn)

- Hệ thống tự động hóa và Multi-Level Approval

- [README.md](N8N/README.md) — Tổng quan
- [COMPLETE_SETUP_GUIDE.md](N8N/COMPLETE_SETUP_GUIDE.md) — Setup hoàn chỉnh
- [SETUP_APPROVAL_TABLES.md](N8N/SETUP_APPROVAL_TABLES.md) — Schema setup

### � Feature Guides

- Hướng dẫn nghiệp vụ/tính năng cho Developer

- [ASSIGNMENT_FEATURES.md](Manuals/ASSIGNMENT_FEATURES.md) — Tính năng giao việc
- [EVALUATION_REDO_FEATURES.md](Manuals/EVALUATION_REDO_FEATURES.md) — Tính năng đánh giá
- [VALIDATION_FIX.md](Manuals/VALIDATION_FIX.md) — Sửa lỗi validation

### 📝 Forms

- Mẫu biểu phục vụ phát triển/kiểm thử

- [hop_dong.md](Forms/hop_dong.md)

---

## ⚡ Quick Start

### 1. Cài đặt nhanh

```bash
# Clone repository
git clone <repository-url>
cd OrientClassicsManager

# Setup database
scripts\setup_database_orient.bat

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Truy cập ứng dụng

- **Application**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Database**: localhost:5432

---

## 🔧 Development Workflow

### 1. Setup môi trường

```bash
# Cài đặt PostgreSQL
# Tạo database và user
# Cấu hình .env file
```

### 2. Development

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:push

# Seed sample data
npm run db:seed
```

### 3. Testing nhanh

```bash
curl http://localhost:5000/api/health
```

---

## 📊 System Overview

### Core Modules

- **👥 User Management**: Quản lý người dùng và phân quyền
- **📄 Contract Management**: Quản lý hợp đồng dịch thuật
- **🔤 Translation Workflow**: Quy trình dịch thuật
- **💰 Payment System**: Hệ thống thanh toán
- **📝 Work Management**: Quản lý công việc
- **⭐ Review System**: Hệ thống đánh giá

### User Roles

- **chu_nhiem**: Chủ nhiệm (Full access)
- **pho_chu_nhiem**: Phó Chủ nhiệm
- **truong_ban_thu_ky**: Trưởng ban Thư ký
- **thu_ky_hop_phan**: Thư ký hợp phần
- **dich_gia**: Dịch giả
- **bien_tap_vien**: Biên tập viên
- **ky_thuat_vien**: Kỹ thuật viên

---

## 🛠️ Maintenance

### Database Backup/Restore

- Xem hướng dẫn trong [DATABASE_COMPLETE_GUIDE.md](Database/DATABASE_COMPLETE_GUIDE.md) — mục Backup & Restore.

### System Updates

```bash
# Update dependencies
npm update

# Database migration
npm run db:push

# Restart services
pm2 restart all
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**:

- Kiểm tra PostgreSQL service
- Xác minh DATABASE_URL trong .env
- Kiểm tra kết nối bằng psql/pgAdmin

**Module Not Found**:

- Chạy `npm install`
- Xóa node_modules và cài lại

**Permission Denied**:

- Kiểm tra user roles
- Xác minh database permissions

### Getting Help

1. Kiểm tra tài liệu trong thư mục tương ứng
2. Chạy health check scripts
3. Xem logs trong console/file
4. Liên hệ team development

---

## 📈 Roadmap

### Version 1.0 (Current)

- ✅ Core user management
- ✅ Contract management
- ✅ Basic translation workflow
- ✅ Payment tracking

### Version 1.1 (Planned)

- 🔄 Advanced workflow automation
- 🔄 Real-time notifications
- 🔄 Advanced reporting
- 🔄 Mobile app support

### Version 2.0 (Future)

- 📋 AI-powered translation assistance
- 📋 Advanced analytics
- 📋 Multi-language support
- 📋 Third-party integrations

---

## 🤝 Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Follow Git commit conventions

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for functions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

_Documentation for OrientClassicsManager v1.0 - Last updated: 2024-11-27_
