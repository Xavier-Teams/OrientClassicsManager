# 🚀 Complete Setup Guide - N8N Multi-Level Approval System

> **Hướng dẫn hoàn chỉnh** setup N8N với Multi-Level Approval cho OrientClassicsManager

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [✅ Prerequisites](#-prerequisites)
- [📦 Step 1: N8N Installation](#-step-1-n8n-installation)
- [🗄️ Step 2: Database Setup](#️-step-2-database-setup)
- [⚙️ Step 3: N8N Configuration](#️-step-3-n8n-configuration)
- [📋 Step 4: Import Workflow](#-step-4-import-workflow)
- [🧪 Step 5: Testing](#-step-5-testing)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng quan

### **Hệ thống đã setup:**

- ✅ **N8N**: Running on Docker (http://localhost:5678)
- ✅ **Database**: PostgreSQL với `translation_db`
- ✅ **Workflow**: Multi-level approval với approval tokens
- ✅ **Features**: Email notifications, Approve/Reject links, Audit trail

### **Kiến trúc:**

```
OrientClassicsManager API
    ↓ (POST webhook)
N8N Workflow Engine
    ↓ (Query/Update)
PostgreSQL (translation_db)
    ├── translation_contracts (BIGINT id)
    ├── users (BIGINT id)
    ├── approval_workflows (UUID id, BIGINT document_id)
    ├── approval_history
    └── approval_tokens
```

### **Data Types quan trọng:**

- `users.id`: **BIGINT** (Django model)
- `translation_contracts.id`: **BIGINT** (BIGSERIAL)
- `approval_workflows.id`: **UUID** (internal)
- `approval_workflows.document_id`: **BIGINT** (FK to translation_contracts)
- All user foreign keys: **BIGINT** (FK to users)

---

## ✅ Prerequisites

### **Đã có sẵn:**

- ✅ Docker Desktop installed và running
- ✅ PostgreSQL 18 running (service: postgresql-x64-18)
- ✅ Database `translation_db` exists
- ✅ Table `translation_contracts` exists
- ✅ Table `users` exists
- ✅ User `n8n_user` created với permissions

### **Kiểm tra:**

```powershell
# Check Docker
docker --version
docker ps

# Check PostgreSQL
Get-Service -Name "*postgres*"

# Check N8N
docker ps --filter "name=orient-n8n-dev"
```

---

## 📦 Step 1: N8N Installation

### **1.1. N8N đã được cài đặt**

N8N đã được setup với Docker Compose:

- **Container**: `orient-n8n-dev`
- **Port**: `5678`
- **URL**: http://localhost:5678
- **Credentials**: admin / orient2024
- **Database**: SQLite (development) hoặc PostgreSQL (production)

### **1.2. Verify N8N Status**

```powershell
# Check container status
docker ps --filter "name=orient-n8n-dev"

# Check logs
docker logs orient-n8n-dev --tail 20

# Test web interface
Start-Process "http://localhost:5678"
```

### **1.3. Restart N8N (nếu cần)**

```powershell
docker-compose -f docker-compose.n8n.yml restart
```

---

## 🗄️ Step 2: Database Setup

### **2.1. Setup N8N Database**

**File**: `scripts/setup_n8n_database_simple.sql`

Chạy trong pgAdmin (connected to `postgres` database):

```sql
-- Part 1: Create N8N database
CREATE DATABASE n8n_database
  WITH ENCODING 'UTF8'
  TEMPLATE template0;

-- Part 2: Create N8N user
CREATE USER n8n_user WITH PASSWORD 'n8n_secure_password_2024';

-- Part 3: Grant permissions
GRANT ALL PRIVILEGES ON DATABASE n8n_database TO n8n_user;
GRANT CONNECT ON DATABASE translation_db TO n8n_user;
```

**Sau đó**, connect to `translation_db` và chạy:

**File**: `scripts/setup_n8n_permissions_translation_db.sql`

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO n8n_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
```

### **2.2. Setup Approval Workflow Tables**

**File**: `scripts/setup_approval_tables_fixed.sql`

**⚠️ QUAN TRỌNG**: File này đã được fix với đúng data types:

- `document_id`: BIGINT (not UUID)
- `created_by_id`: BIGINT (not UUID)
- `assigned_to_id`: BIGINT (not UUID)
- `approver_id`: BIGINT (not UUID)

**Chạy trong pgAdmin** (connected to `translation_db`):

1. **Mở file**: `scripts/setup_approval_tables_fixed.sql`
2. **Run toàn bộ file** (pgAdmin sẽ handle transactions)
3. **Verify** bằng query:

```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('approval_workflows', 'approval_history', 'approval_tokens');
```

### **2.3. Verify Database Schema**

```sql
-- Check column types
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('approval_workflows', 'approval_history', 'approval_tokens')
  AND column_name IN ('id', 'document_id', 'created_by_id', 'assigned_to_id', 'approver_id')
ORDER BY table_name, column_name;
```

**Expected Results:**

- `approval_workflows.id`: uuid
- `approval_workflows.document_id`: bigint
- `approval_workflows.created_by_id`: bigint
- `approval_workflows.assigned_to_id`: bigint
- `approval_history.approver_id`: bigint
- `approval_tokens.approver_id`: bigint

---

## ⚙️ Step 3: N8N Configuration

### **3.1. Update N8N Docker Compose**

**File**: `docker-compose.n8n.yml`

Đảm bảo cấu hình PostgreSQL:

```yaml
environment:
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=host.docker.internal
  - DB_POSTGRESDB_PORT=5432
  - DB_POSTGRESDB_DATABASE=n8n_database
  - DB_POSTGRESDB_USER=n8n_user
  - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
```

### **3.2. Update Environment File**

**File**: `.env.n8n`

```env
DB_PASSWORD=your_postgres_password_here
N8N_DB_PASSWORD=n8n_secure_password_2024
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### **3.3. Restart N8N với PostgreSQL**

```powershell
# Stop current container
docker-compose -f docker-compose.n8n.yml down

# Start with new config
docker-compose -f docker-compose.n8n.yml up -d

# Check logs
docker logs orient-n8n-dev --tail 30
```

### **3.4. Setup PostgreSQL Credential trong N8N**

1. **Mở N8N**: http://localhost:5678
2. **Login**: admin / orient2024
3. **Credentials** → **Add New** → **PostgreSQL**
4. **Cấu hình**:
   ```
   Name: Translation DB Connection
   Host: host.docker.internal
   Port: 5432
   Database: translation_db
   User: n8n_user
   Password: n8n_secure_password_2024
   ```
5. **Test Connection** → **Save**

---

## 📋 Step 4: Import Workflow

### **4.1. Import Multi-Level Approval Workflow**

1. **Mở N8N**: http://localhost:5678
2. **Click "+"** → **"Import from file"**
3. **Chọn file**: `n8n-workflows/contract-approval-multilevel-ready.json`
4. **Save workflow**

### **4.2. Configure Workflow Nodes**

Cập nhật tất cả PostgreSQL nodes với credential:

1. **Get Contract Details** → Select "Translation DB Connection"
2. **Create Approval Workflow** → Select "Translation DB Connection"
3. **Get Level 1 Approver (Manager)** → Select "Translation DB Connection"
4. **Save Approval Token** → Select "Translation DB Connection"
5. **Validate Token** → Select "Translation DB Connection"
6. **Update Token Decision** → Select "Translation DB Connection"
7. **Update Contract Approved** → Select "Translation DB Connection"
8. **Update Contract Rejected** → Select "Translation DB Connection"

### **4.3. Activate Workflow**

1. **Toggle "Active"** switch (góc trên bên phải)
2. **Save workflow**

### **4.4. Get Webhook URLs**

1. **Click node "Contract Submitted"**
2. **Copy Production URL**: `http://localhost:5678/webhook/contract-approval`
3. **Click node "Approval Decision Webhook"**
4. **Copy Production URL**: `http://localhost:5678/webhook/contract-approval-decision`

---

## 🧪 Step 5: Testing

### **5.1. Get Contract ID**

Chạy query trong pgAdmin (connected to `translation_db`):

```sql
-- Get contract with ID = 3 or similar
SELECT
    id,
    contract_number,
    status,
    total_amount,
    created_at
FROM translation_contracts
WHERE id = 3
   OR id::text LIKE '%3%'
   OR contract_number LIKE '%3%'
ORDER BY created_at DESC
LIMIT 5;
```

**Copy `id`** (sẽ là BIGINT, ví dụ: `3`)

### **5.2. Test Webhook**

**Option A: PowerShell Script**

```powershell
.\scripts\test_contract_approval_webhook.ps1 -ContractId "3"
```

**Option B: Manual PowerShell**

```powershell
$webhookUrl = "http://localhost:5678/webhook/contract-approval"
$body = @{ contract_id = "3" } | ConvertTo-Json

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
```

### **5.3. Verify Results**

#### **Check N8N Execution:**

1. **Executions** → Xem execution mới nhất
2. **Click vào execution** → Xem chi tiết từng node

#### **Check Database:**

```sql
-- Check approval workflow created
SELECT * FROM approval_workflows
WHERE document_id = 3
ORDER BY created_at DESC;

-- Check approval token created
SELECT * FROM approval_tokens
WHERE workflow_id IN (
    SELECT id FROM approval_workflows WHERE document_id = 3
);
```

#### **Check Email:**

- Manager sẽ nhận email với **Approve/Reject links**
- Creator sẽ nhận confirmation email

### **5.4. Test Approval Decision**

Khi manager click **Approve** hoặc **Reject** link trong email:

1. **Browser sẽ mở URL**:

   ```
   http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved
   ```

2. **Verify contract status updated**:
   ```sql
   SELECT id, contract_number, status
   FROM translation_contracts
   WHERE id = 3;
   ```

---

## 🔧 Troubleshooting

### **Error: "Waiting for trigger event"**

**Nguyên nhân**: Workflow chưa được activate

**Giải pháp**:

1. Verify workflow toggle **ON** (Active)
2. Save workflow lại
3. Wait 5-10 seconds
4. Check webhook URL format

### **Error: "Database connection failed"**

**Nguyên nhân**: PostgreSQL credentials chưa setup

**Giải pháp**:

1. Go to **Credentials** trong N8N
2. Setup PostgreSQL credential với đúng thông tin
3. Test connection
4. Update tất cả workflow nodes với credential này

### **Error: "Table does not exist"**

**Nguyên nhân**: Approval tables chưa được tạo

**Giải pháp**:

1. Run `scripts/setup_approval_tables_fixed.sql` trong pgAdmin
2. Verify tables exist:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name IN ('approval_workflows', 'approval_history', 'approval_tokens');
   ```

### **Error: "Foreign key constraint cannot be implemented"**

**Nguyên nhân**: Data types không match

**Giải pháp**:

- ✅ Đảm bảo sử dụng `scripts/setup_approval_tables_fixed.sql` (đã fix data types)
- ✅ Verify `users.id` là BIGINT
- ✅ Verify `translation_contracts.id` là BIGINT
- ✅ Verify foreign keys sử dụng BIGINT

### **Error: "No approver found"**

**Nguyên nhân**: Không có user với role manager

**Giải pháp**:

```sql
-- Check users with manager roles
SELECT id, email, full_name, role
FROM users
WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem');
```

### **Error: "Contract not found"**

**Nguyên nhân**: Contract ID không tồn tại

**Giải pháp**:

```sql
-- Verify contract exists
SELECT * FROM translation_contracts WHERE id = 3;
```

### **Email Not Sending**

**Nguyên nhân**: Email credentials chưa setup

**Giải pháp**:

1. Update `.env.n8n`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
2. Restart N8N:
   ```powershell
   docker-compose -f docker-compose.n8n.yml restart
   ```

---

## 📊 Workflow Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Contract Submitted (contract_id = 3)                     │
│    POST /webhook/contract-approval                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Get Contract Details                                      │
│    Query: translation_contracts WHERE id = 3                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Create Approval Workflow                                  │
│    Insert into approval_workflows                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Get Level 1 Approver (Manager)                            │
│    Query: users WHERE role IN ('manager', ...)               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Generate Approval Token                                   │
│    Create unique token với 48h expiry                        │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Save Approval Token                                       │
│    Insert into approval_tokens                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Send Approval Email to Manager                            │
│    Email với Approve/Reject links                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Send Confirmation to Creator                              │
│    Email thông báo đã submit                                │
└─────────────────────────────────────────────────────────────┘

[Manager clicks Approve/Reject link]

┌─────────────────────────────────────────────────────────────┐
│ 9. Approval Decision Webhook                                 │
│    GET /webhook/contract-approval-decision?token=xxx&decision │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. Validate Token                                           │
│     Check token exists, not expired, not used                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. Update Token Decision                                    │
│     Update approval_tokens SET decision, used_at             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. Check Decision (IF node)                                 │
│     If approved → Update Contract Approved                   │
│     If rejected → Update Contract Rejected                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 13. Update Contract Status                                  │
│     UPDATE translation_contracts SET status = 'approved'       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### **Webhook URLs:**

- **Submit Contract**: `http://localhost:5678/webhook/contract-approval`
- **Approval Decision**: `http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved`

### **Database Tables:**

- `approval_workflows` - Main workflow tracking
- `approval_history` - Approval action history
- `approval_tokens` - Approval tokens với expiry

### **Key Files:**

- `docker-compose.n8n.yml` - N8N Docker configuration
- `scripts/setup_approval_tables_fixed.sql` - Database schema
- `n8n-workflows/contract-approval-multilevel-ready.json` - Workflow file
- `scripts/test_contract_approval_webhook.ps1` - Test script

### **Credentials:**

- **N8N Login**: admin / orient2024
- **PostgreSQL User**: n8n_user / n8n_secure_password_2024
- **Database**: translation_db

---

## ✅ Success Checklist

- [ ] N8N container running
- [ ] N8N accessible at http://localhost:5678
- [ ] n8n_database created
- [ ] n8n_user có permissions
- [ ] approval_workflows table created
- [ ] approval_history table created
- [ ] approval_tokens table created
- [ ] PostgreSQL credential setup trong N8N
- [ ] Workflow imported và activated
- [ ] All nodes configured với credentials
- [ ] Test webhook successful
- [ ] Email notifications working
- [ ] Approval decision updates contract status

---

**Last Updated**: 27/11/2024  
**Version**: 1.0  
**Status**: Production Ready ✅
