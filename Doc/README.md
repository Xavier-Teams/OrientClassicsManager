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

### 🚀 [Setup](Setup/)

Hướng dẫn cài đặt và triển khai hệ thống

- **[COMPLETE_SETUP_GUIDE.md](Setup/COMPLETE_SETUP_GUIDE.md)** - Hướng dẫn cài đặt hoàn chỉnh
- **[QUICK_START.md](Setup/QUICK_START.md)** - Khởi động nhanh
- **[SETUP_GUIDE.md](Setup/SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết
- **[FASTAPI_SETUP.md](Setup/FASTAPI_SETUP.md)** - Setup FastAPI (legacy)

### 🗄️ [Database](Database/)

Tài liệu về database và quản lý dữ liệu

- **[DATABASE_COMPLETE_GUIDE.md](Database/DATABASE_COMPLETE_GUIDE.md)** - Hướng dẫn database toàn diện
- **[DATABASE_DOCUMENTATION.md](Database/DATABASE_DOCUMENTATION.md)** - Tài liệu schema
- **[QUICK_START_DATABASE.md](Database/QUICK_START_DATABASE.md)** - Khởi tạo database nhanh
- **[PGADMIN4_SETUP_GUIDE.md](Database/PGADMIN4_SETUP_GUIDE.md)** - Cài đặt pgAdmin4
- **SQL Files**: Schema và seed data

### 🌐 [API](API/)

Tài liệu API và integration

- **[API_COMPLETE_GUIDE.md](API/API_COMPLETE_GUIDE.md)** - Hướng dẫn API toàn diện
- **[API_DOCUMENTATION.md](API/API_DOCUMENTATION.md)** - Chi tiết API endpoints
- **[API_CONNECTION_GUIDE.md](API/API_CONNECTION_GUIDE.md)** - Hướng dẫn kết nối API
- **[TEST_API.md](API/TEST_API.md)** - Testing API

### 🔧 [Development](Development/)

Hướng dẫn phát triển và debugging

- **[DEVELOPMENT_GUIDE.md](Development/DEVELOPMENT_GUIDE.md)** - Hướng dẫn phát triển
- **[DJANGO_SERVER_LOGS_EXPLAINED.md](Development/DJANGO_SERVER_LOGS_EXPLAINED.md)** - Giải thích logs
- **[FE_BE_CONNECTION_SUMMARY.md](Development/FE_BE_CONNECTION_SUMMARY.md)** - Kết nối Frontend-Backend

### 🏗️ [Architecture](Architecture/)

Kiến trúc hệ thống và thiết kế

- **[SYSTEM_ARCHITECTURE.md](Architecture/SYSTEM_ARCHITECTURE.md)** - Tổng quan kiến trúc hệ thống
- **[ARCHITECTURE_DECISION.md](Architecture/ARCHITECTURE_DECISION.md)** - Quyết định kiến trúc
- **[PAYMENT_ARCHITECTURE.md](Architecture/PAYMENT_ARCHITECTURE.md)** - Kiến trúc thanh toán

### 📋 [BA](BA/)

Tài liệu phân tích nghiệp vụ

- **[BA_PM_Quan_ly_Du_an_dich_thuat.md](BA/BA_PM_Quan_ly_Du_an_dich_thuat.md)** - Phân tích dự án
- **[KE_HOACH_TRIEN_KHAI_CHI_TIET.md](BA/KE_HOACH_TRIEN_KHAI_CHI_TIET.md)** - Kế hoạch triển khai
- **[Quy_trinh_quan_ly_hop_phan_dich_thuat.md](BA/Quy_trinh_quan_ly_hop_phan_dich_thuat.md)** - Quy trình quản lý
- **[TOM_TAT_KE_HOACH.md](BA/TOM_TAT_KE_HOACH.md)** - Tóm tắt kế hoạch

### 🤖 [N8N](N8N/)

Hệ thống tự động hóa và Multi-Level Approval Workflow

- **[README.md](N8N/README.md)** ⭐ - Tổng quan N8N documentation
- **[COMPLETE_SETUP_GUIDE.md](N8N/COMPLETE_SETUP_GUIDE.md)** - Hướng dẫn setup hoàn chỉnh
- **[WORKFLOW_SUGGESTIONS.md](N8N/WORKFLOW_SUGGESTIONS.md)** ⭐ NEW - Đề xuất workflows
- **[QUICK_START_MULTILEVEL.md](N8N/QUICK_START_MULTILEVEL.md)** - Quick start multi-level approval
- **[TESTING_GUIDE.md](N8N/TESTING_GUIDE.md)** - Hướng dẫn testing workflow
- **[SETUP_APPROVAL_TABLES.md](N8N/SETUP_APPROVAL_TABLES.md)** - Database schema setup
- **[IMPLEMENTATION_STATUS.md](N8N/IMPLEMENTATION_STATUS.md)** - Trạng thái triển khai

### 🔄 [Automation](Automation/) ⭐ NEW

Chiến lược và kế hoạch triển khai automation toàn diện

- **[README.md](Automation/README.md)** ⭐ - Tổng quan automation
- **[COMPREHENSIVE_AUTOMATION_STRATEGY.md](Automation/COMPREHENSIVE_AUTOMATION_STRATEGY.md)** - Chiến lược toàn diện
- **[IMPLEMENTATION_PLAN.md](Automation/IMPLEMENTATION_PLAN.md)** - Kế hoạch triển khai 10 tuần

### 💬 [Integration](Integration/) ⭐ NEW

Tích hợp với các hệ thống bên ngoài

- **[MATTERMOST_INTEGRATION.md](Integration/MATTERMOST_INTEGRATION.md)** ⭐ - Hướng dẫn tích hợp Mattermost
- **[MATTERMOST_QUICK_START.md](Integration/MATTERMOST_QUICK_START.md)** - Quick start Mattermost

### 📝 [Forms](Forms/)

Mẫu biểu và forms

- **[hop_dong.md](Forms/hop_dong.md)** - Mẫu hợp đồng

### 📖 [Manuals](Manuals/)

Hướng dẫn sử dụng và tính năng

- **[ASSIGNMENT_FEATURES.md](Manuals/ASSIGNMENT_FEATURES.md)** - Tính năng giao việc
- **[EVALUATION_REDO_FEATURES.md](Manuals/EVALUATION_REDO_FEATURES.md)** - Tính năng đánh giá
- **[HUONG_DAN_CAI_DAT_VA_TRIEN_KHAI.md](Manuals/HUONG_DAN_CAI_DAT_VA_TRIEN_KHAI.md)** - Hướng dẫn cài đặt
- **[VALIDATION_FIX.md](Manuals/VALIDATION_FIX.md)** - Sửa lỗi validation
- **DB Backup**: Hướng dẫn backup database

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

### 3. Testing

```bash
# Run tests
npm test

# Check API endpoints
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

### Database Backup

```bash
# Backup database
scripts\backup_database_orient.bat

# Restore database
scripts\restore_database_orient.bat

# Health check
scripts\check_database_orient.bat
```

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
- Chạy health check script

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
