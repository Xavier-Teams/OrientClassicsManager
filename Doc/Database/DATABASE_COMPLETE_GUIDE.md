# 🗄️ Database Complete Guide - OrientClassicsManager

> **Hướng dẫn toàn diện** về Database PostgreSQL cho OrientClassicsManager

## 📋 Mục lục

- [🎯 Database Overview](#-database-overview)
- [📊 Schema Documentation](#-schema-documentation)
- [🔧 Setup và Configuration](#-setup-và-configuration)
- [💾 Backup và Restore](#-backup-và-restore)
- [🔍 Queries và Operations](#-queries-và-operations)
- [🚀 Performance Optimization](#-performance-optimization)

---

## 🎯 Database Overview

### Thông tin cơ bản
- **Database Name**: `orient_classics_manager`
- **DBMS**: PostgreSQL 12+
- **ORM**: Drizzle ORM
- **Connection Pool**: node-postgres (pg)

### Cấu trúc chính
```
OrientClassicsManager Database:
├── 👥 Users & Authentication
├── 📄 Contracts Management  
├── 🔤 Translation Workflow
├── 💰 Payments & Billing
├── 📝 Works & Tasks
├── ⭐ Reviews & Evaluations
└── 📁 File Management
```

---

## 📊 Schema Documentation

### Core Tables

#### 👥 Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Roles (user_role enum)**:
- `chu_nhiem` - Chủ nhiệm
- `pho_chu_nhiem` - Phó Chủ nhiệm  
- `truong_ban_thu_ky` - Trưởng ban Thư ký
- `thu_ky_hop_phan` - Thư ký hợp phần
- `van_phong` - Văn phòng
- `ke_toan` - Kế toán
- `van_thu` - Văn thư
- `bien_tap_vien` - Biên tập viên (BTV)
- `ky_thuat_vien` - Kỹ thuật viên (KTV)
- `dich_gia` - Dịch giả
- `chuyen_gia` - Chuyên gia

#### 📄 Contracts Table
```sql
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  contract_number VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Contract Status (contract_status enum)**:
- `draft` - Dự thảo
- `pending_approval` - Chờ phê duyệt
- `approved` - Đã phê duyệt
- `in_progress` - Đang thực hiện
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

#### 🔤 Translations Table
```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER REFERENCES contracts(id),
  translator_id INTEGER REFERENCES users(id),
  status translation_status NOT NULL DEFAULT 'draft',
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  word_count INTEGER,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Translation Status (translation_status enum)**:
- `draft` - Dự kiến
- `approved` - Đã duyệt
- `translator_assigned` - Đã gán dịch giả
- `trial_translation` - Dịch thử
- `trial_reviewed` - Đã thẩm định dịch thử
- `in_progress` - Đang dịch
- `progress_checked` - Đã kiểm tra tiến độ (KTTĐ)
- `completed` - Hoàn thành dịch
- `cancelled` - Đã hủy

### Relationships

```mermaid
erDiagram
    USERS ||--o{ CONTRACTS : manages
    CONTRACTS ||--o{ TRANSLATIONS : contains
    USERS ||--o{ TRANSLATIONS : translates
    TRANSLATIONS ||--o{ PAYMENTS : generates
    CONTRACTS ||--o{ WORKS : includes
    USERS ||--o{ REVIEWS : creates
```

---

## 🔧 Setup và Configuration

### 1. Database Creation

#### Automatic Setup (Khuyến nghị)
```bash
scripts\setup_database_orient.bat
```

#### Manual Setup
```sql
-- 1. Tạo database
CREATE DATABASE orient_classics_manager 
  WITH ENCODING 'UTF8' 
  TEMPLATE template0
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- 2. Tạo user
CREATE USER orient_user WITH 
  PASSWORD 'orient_password_2024'
  CREATEDB
  LOGIN;

-- 3. Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE orient_classics_manager TO orient_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO orient_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO orient_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO orient_user;
```

### 2. Environment Configuration

```bash
# .env file
DATABASE_URL=postgresql://orient_user:orient_password_2024@localhost:5432/orient_classics_manager
NODE_ENV=development
PORT=5000
```

### 3. Schema Migration

```bash
# Tạo/cập nhật schema
npm run db:push

# Tạo dữ liệu mẫu
npm run db:seed
```

---

## 💾 Backup và Restore

### Backup Database

#### Automatic Backup
```bash
scripts\backup_database_orient.bat
```

#### Manual Backup
```bash
# Full backup
pg_dump -h localhost -U postgres -d orient_classics_manager -Fc > backup.dump

# Schema only
pg_dump -h localhost -U postgres -d orient_classics_manager -s > schema.sql

# Data only
pg_dump -h localhost -U postgres -d orient_classics_manager -a > data.sql
```

### Restore Database

#### Automatic Restore
```bash
scripts\restore_database_orient.bat
```

#### Manual Restore
```bash
# From custom format
pg_restore -h localhost -U postgres -d orient_classics_manager -v backup.dump

# From SQL file
psql -h localhost -U postgres -d orient_classics_manager < backup.sql
```

### Migration to New Server

1. **Backup on old server**:
   ```bash
   scripts\backup_database_orient.bat
   ```

2. **Setup new server**:
   ```bash
   scripts\setup_database_orient.bat
   ```

3. **Restore on new server**:
   ```bash
   scripts\restore_database_orient.bat
   ```

---

## 🔍 Queries và Operations

### Common Queries

#### User Management
```sql
-- Tạo user mới
INSERT INTO users (username, email, password_hash, role) 
VALUES ('john_doe', 'john@example.com', 'hashed_password', 'dich_gia');

-- Lấy danh sách dịch giả
SELECT * FROM users WHERE role = 'dich_gia';

-- Cập nhật role user
UPDATE users SET role = 'bien_tap_vien' WHERE id = 1;
```

#### Contract Management
```sql
-- Tạo contract mới
INSERT INTO contracts (contract_number, title, client_name, status, total_amount)
VALUES ('CT2024001', 'Dịch tài liệu kỹ thuật', 'Công ty ABC', 'draft', 5000000);

-- Lấy contracts đang active
SELECT * FROM contracts WHERE status IN ('approved', 'in_progress');

-- Cập nhật status contract
UPDATE contracts SET status = 'approved' WHERE id = 1;
```

#### Translation Workflow
```sql
-- Gán dịch giả cho translation
UPDATE translations 
SET translator_id = 5, status = 'translator_assigned' 
WHERE id = 1;

-- Lấy translations của dịch giả
SELECT t.*, c.title as contract_title 
FROM translations t
JOIN contracts c ON t.contract_id = c.id
WHERE t.translator_id = 5;

-- Cập nhật tiến độ translation
UPDATE translations 
SET status = 'in_progress', updated_at = NOW() 
WHERE id = 1;
```

### Analytics Queries

#### Dashboard Statistics
```sql
-- Tổng số contracts theo status
SELECT status, COUNT(*) as count 
FROM contracts 
GROUP BY status;

-- Tổng số translations theo status
SELECT status, COUNT(*) as count 
FROM translations 
GROUP BY status;

-- Top dịch giả theo số lượng translations
SELECT u.username, COUNT(t.id) as translation_count
FROM users u
JOIN translations t ON u.id = t.translator_id
WHERE u.role = 'dich_gia'
GROUP BY u.id, u.username
ORDER BY translation_count DESC
LIMIT 10;
```

#### Performance Metrics
```sql
-- Thời gian trung bình hoàn thành translation
SELECT AVG(EXTRACT(DAY FROM (updated_at - created_at))) as avg_days
FROM translations 
WHERE status = 'completed';

-- Tỷ lệ hoàn thành đúng hạn
SELECT 
  COUNT(CASE WHEN updated_at <= deadline THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM translations 
WHERE status = 'completed' AND deadline IS NOT NULL;
```

---

## 🚀 Performance Optimization

### Indexing Strategy

```sql
-- Indexes for common queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_translations_status ON translations(status);
CREATE INDEX idx_translations_translator ON translations(translator_id);
CREATE INDEX idx_translations_contract ON translations(contract_id);

-- Composite indexes
CREATE INDEX idx_translations_status_translator ON translations(status, translator_id);
CREATE INDEX idx_contracts_status_created ON contracts(status, created_at);
```

### Query Optimization

#### Use EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE 
SELECT t.*, c.title 
FROM translations t
JOIN contracts c ON t.contract_id = c.id
WHERE t.status = 'in_progress';
```

#### Connection Pooling
```typescript
// server/db.ts
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000, // Connection timeout
});
```

### Monitoring

#### Database Size
```sql
SELECT pg_size_pretty(pg_database_size('orient_classics_manager'));
```

#### Active Connections
```sql
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'orient_classics_manager';
```

#### Slow Queries
```sql
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 🔧 Maintenance

### Regular Tasks

#### Daily
- Monitor active connections
- Check error logs
- Verify backup completion

#### Weekly  
- Analyze query performance
- Update table statistics: `ANALYZE;`
- Clean up old log files

#### Monthly
- Full database backup
- Review and optimize indexes
- Update PostgreSQL if needed

### Health Check

```bash
# Automated health check
scripts\check_database_orient.bat
```

### Troubleshooting

#### Common Issues

**High CPU Usage**:
```sql
-- Find expensive queries
SELECT query, total_time, mean_time, calls 
FROM pg_stat_statements 
ORDER BY total_time DESC;
```

**Lock Issues**:
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;
```

**Connection Issues**:
```sql
-- Check connection limits
SELECT * FROM pg_stat_activity;
SHOW max_connections;
```

---

## 📚 References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Database Migration Guide](DATABASE_MIGRATION_GUIDE.md)
- [Backup & Restore Guide](BACKUP_RESTORE_GUIDE.md)

---

*Database Documentation for OrientClassicsManager v1.0 - Updated: 2024-11-27*
