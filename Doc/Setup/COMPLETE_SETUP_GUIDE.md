# 🚀 Hướng dẫn Cài đặt Hoàn chỉnh - OrientClassicsManager

> **Hướng dẫn tổng hợp** cài đặt và triển khai hệ thống OrientClassicsManager từ A-Z

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [📦 Prerequisites](#-prerequisites)
- [🗄️ Cài đặt Database](#️-cài-đặt-database)
- [🔧 Cài đặt Backend](#-cài-đặt-backend)
- [🎨 Cài đặt Frontend](#-cài-đặt-frontend)
- [⚡ Quick Start](#-quick-start)
- [🔍 Kiểm tra và Test](#-kiểm-tra-và-test)
- [🆘 Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng quan

OrientClassicsManager là hệ thống quản lý dự án dịch thuật với:
- **Backend**: Express.js + Drizzle ORM
- **Database**: PostgreSQL
- **Frontend**: React + TypeScript + TailwindCSS
- **Architecture**: Full-stack TypeScript

---

## 📦 Prerequisites

### Phần mềm cần thiết:
- **Node.js** 20.11.1+ và npm
- **PostgreSQL** 12+
- **Git**
- **Code Editor** (VS Code khuyến nghị)

### Kiểm tra version:
```bash
node --version    # >= 20.11.1
npm --version     # >= 10.2.4
psql --version    # >= 12
```

---

## 🗄️ Cài đặt Database

### 1. Cài đặt PostgreSQL

#### Windows:
1. Tải từ: https://www.postgresql.org/download/windows/
2. Chạy installer, ghi nhớ password cho user `postgres`
3. Cấu hình port: 5432 (default)

#### Kiểm tra cài đặt:
```bash
psql -U postgres -c "SELECT version();"
```

### 2. Tạo Database

#### Cách 1: Sử dụng Script (Khuyến nghị)
```bash
# Chạy script setup tự động
scripts\setup_database_orient.bat
```

#### Cách 2: Thủ công
```sql
-- Tạo database
CREATE DATABASE orient_classics_manager 
  WITH ENCODING 'UTF8' 
  TEMPLATE template0;

-- Tạo user ứng dụng
CREATE USER orient_user WITH PASSWORD 'orient_password_2024';

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE orient_classics_manager TO orient_user;
```

### 3. Cấu hình Environment
```bash
# Copy template
copy scripts\env.template .env

# Cập nhật DATABASE_URL trong .env
DATABASE_URL=postgresql://orient_user:orient_password_2024@localhost:5432/orient_classics_manager
```

---

## 🔧 Cài đặt Backend

### 1. Clone và Setup
```bash
# Clone repository
git clone <repository-url>
cd OrientClassicsManager

# Cài đặt dependencies
npm install
```

### 2. Database Schema
```bash
# Tạo schema và tables
npm run db:push

# Tạo dữ liệu mẫu (optional)
npm run db:seed
```

### 3. Khởi động Backend
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

**Server sẽ chạy tại**: http://localhost:5000

---

## 🎨 Cài đặt Frontend

Frontend đã được tích hợp trong cùng dự án với Vite.

### Cấu trúc:
```
client/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities
│   └── main.tsx       # Entry point
└── index.html         # HTML template
```

### Development:
```bash
# Frontend được serve cùng với backend
npm run dev
```

### Production Build:
```bash
npm run build
```

---

## ⚡ Quick Start

### Khởi động nhanh trong 5 phút:

1. **Cài đặt Database**:
   ```bash
   scripts\setup_database_orient.bat
   ```

2. **Cài đặt Dependencies**:
   ```bash
   npm install
   ```

3. **Tạo Schema**:
   ```bash
   npm run db:push
   ```

4. **Khởi động Server**:
   ```bash
   npm run dev
   ```

5. **Truy cập ứng dụng**: http://localhost:5000

### ⚠️ Lỗi thường gặp:

**ERR_CONNECTION_REFUSED**: 
- Kiểm tra PostgreSQL service đang chạy
- Kiểm tra DATABASE_URL trong .env

**Module not found**:
- Chạy `npm install` lại
- Xóa node_modules và cài lại

---

## 🔍 Kiểm tra và Test

### 1. Health Check Database
```bash
scripts\check_database_orient.bat
```

### 2. Test API Endpoints
```bash
# Test basic endpoint
curl http://localhost:5000/api/health

# Test với Postman hoặc Insomnia
```

### 3. Kiểm tra Frontend
- Truy cập: http://localhost:5000
- Kiểm tra console browser không có lỗi
- Test các chức năng cơ bản

---

## 🆘 Troubleshooting

### Database Issues

**Lỗi**: `FATAL: password authentication failed`
```bash
# Reset password PostgreSQL
psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
```

**Lỗi**: `database does not exist`
```bash
# Tạo database
createdb -U postgres orient_classics_manager
```

### Application Issues

**Lỗi**: `DATABASE_URL must be set`
```bash
# Kiểm tra file .env tồn tại và có DATABASE_URL
cat .env | grep DATABASE_URL
```

**Lỗi**: `Cannot find module`
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

**Server chậm**:
- Kiểm tra PostgreSQL performance
- Kiểm tra RAM và CPU usage
- Optimize database queries

**Frontend chậm**:
- Kiểm tra Network tab trong DevTools
- Optimize bundle size
- Enable caching

---

## 📚 Tài liệu tham khảo

- [Database Documentation](../Database/DATABASE_SCHEMA.md)
- [API Documentation](../API/API_DOCUMENTATION.md)
- [Development Guide](../Development/DEVELOPMENT_GUIDE.md)
- [Architecture Overview](../Architecture/ARCHITECTURE_OVERVIEW.md)

---

## 🔄 Cập nhật và Maintenance

### Backup Database
```bash
scripts\backup_database_orient.bat
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Database Migration
```bash
npm run db:push
```

---

*Tài liệu này được cập nhật cho OrientClassicsManager v1.0 - 2024-11-27*
