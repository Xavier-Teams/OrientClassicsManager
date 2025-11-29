# 🚀 Quick Start - Multi-Level Approval với Contract ID = 3

> **Hướng dẫn nhanh** setup và test multi-level approval workflow

## 📋 Checklist Setup

### **1. Setup Database Tables**

**⚠️ QUAN TRỌNG**: Sử dụng file đã được fix data types!

**File**: `scripts/setup_approval_tables_fixed.sql`

**Chạy trong pgAdmin** (connected to `translation_db`):

1. **Mở file**: `scripts/setup_approval_tables_fixed.sql`
2. **Run toàn bộ file** (pgAdmin sẽ handle transactions)
3. **Verify**:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name IN ('approval_workflows', 'approval_history', 'approval_tokens');
   ```

**Lưu ý Data Types:**

- `document_id`: **BIGINT** (not UUID) - matches `translation_contracts.id`
- `created_by_id`: **BIGINT** (not UUID) - matches `users.id`
- `assigned_to_id`: **BIGINT** (not UUID) - matches `users.id`
- `approver_id`: **BIGINT** (not UUID) - matches `users.id`

### **2. Verify Contract ID = 3**

Chạy query này để kiểm tra contract:

```sql
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

**Lưu ý**:

- `translation_contracts.id` là **BIGINT** (BIGSERIAL)
- Contract ID = 3 là số nguyên, không phải UUID
- Copy `id` chính xác để test

### **3. Import Workflow vào N8N**

1. **Mở N8N**: http://localhost:5678
2. **Login**: admin / orient2024
3. **Click "+"** → **"Import from file"**
4. **Chọn file**: `n8n-workflows/contract-approval-multilevel-ready.json`
5. **Save workflow**
6. **Activate workflow** (toggle ON)

### **4. Setup PostgreSQL Credentials**

1. **Credentials** → **Add New** → **PostgreSQL**
2. **Cấu hình**:
   ```
   Name: Translation DB Connection
   Host: host.docker.internal
   Port: 5432
   Database: translation_db
   User: n8n_user
   Password: n8n_secure_password_2024
   ```
3. **Test Connection** → **Save**

### **5. Update Workflow Nodes với Credentials**

1. **Click node "Get Contract Details"**
   - Chọn credential: "Translation DB Connection"
2. **Click node "Create Approval Workflow"**
   - Chọn credential: "Translation DB Connection"
3. **Click node "Get Level 1 Approver (Manager)"**
   - Chọn credential: "Translation DB Connection"
4. **Click node "Save Approval Token"**
   - Chọn credential: "Translation DB Connection"
5. **Click node "Validate Token"**
   - Chọn credential: "Translation DB Connection"
6. **Click node "Update Token Decision"**
   - Chọn credential: "Translation DB Connection"
7. **Click node "Update Contract Approved"**
   - Chọn credential: "Translation DB Connection"
8. **Click node "Update Contract Rejected"**
   - Chọn credential: "Translation DB Connection"
9. **Save workflow**

### **6. Test Workflow**

#### **Option A: Sử dụng PowerShell Script**

```powershell
.\scripts\setup_and_test_contract_3.ps1
```

#### **Option B: Manual Test**

```powershell
$webhookUrl = "http://localhost:5678/webhook/contract-approval"
$body = @{ contract_id = "3" } | ConvertTo-Json

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
```

**Lưu ý**:

- Contract ID là **BIGINT** (số nguyên)
- Có thể dùng `"3"` hoặc số trực tiếp
- Workflow sẽ tự động convert sang BIGINT trong query

### **7. Verify Results**

#### **Check N8N Execution:**

1. **Executions** → Xem execution mới nhất
2. **Click vào execution** → Xem chi tiết từng node

#### **Check Email:**

- Manager sẽ nhận email với **Approve/Reject links**
- Creator sẽ nhận confirmation email

#### **Check Database:**

```sql
-- Check approval workflow created
SELECT * FROM approval_workflows
WHERE document_id::text LIKE '%3%'
ORDER BY created_at DESC;

-- Check approval token created
SELECT * FROM approval_tokens
WHERE workflow_id IN (
    SELECT id FROM approval_workflows
    WHERE document_id::text LIKE '%3%'
);
```

### **8. Test Approval Decision**

Khi manager click **Approve** hoặc **Reject** link trong email:

1. **Browser sẽ mở URL** như:

   ```
   http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved
   ```

2. **Workflow sẽ tự động**:

   - Validate token
   - Update token decision
   - Update contract status
   - Return success message

3. **Verify contract status**:
   ```sql
   SELECT id, contract_number, status
   FROM translation_contracts
   WHERE id::text LIKE '%3%';
   ```

## 🎯 Expected Flow

```
1. Submit Contract (contract_id = 3)
   ↓
2. Create Approval Workflow
   ↓
3. Get Manager Approver
   ↓
4. Generate Approval Token
   ↓
5. Save Token to Database
   ↓
6. Send Email to Manager (with Approve/Reject links)
   ↓
7. Send Confirmation to Creator
   ↓
8. [Manager clicks Approve/Reject]
   ↓
9. Validate Token
   ↓
10. Update Contract Status
    ↓
11. Return Success Response
```

## ⚠️ Troubleshooting

### **Error: "Table approval_tokens does not exist"**

→ Run `scripts/setup_approval_tables_fixed.sql` trong pgAdmin (file đã fix data types)

### **Error: "Foreign key constraint cannot be implemented"**

→ Đảm bảo sử dụng `scripts/setup_approval_tables_fixed.sql` (đã fix BIGINT cho foreign keys)

### **Error: "No approver found"**

→ Verify có user với role 'manager', 'truong_ban_thu_ky', hoặc 'pho_chu_nhiem':

```sql
SELECT id, email, full_name, role
FROM users
WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem');
```

### **Error: "Contract not found"**

→ Verify contract với ID = 3 tồn tại:

```sql
SELECT * FROM translation_contracts WHERE id = 3;
```

### **Email not sending**

→ Check email credentials trong `.env.n8n` và restart N8N

## 🎉 Success Criteria

- ✅ Workflow executes without errors
- ✅ Approval workflow created in database
- ✅ Approval token generated and saved
- ✅ Email sent to manager with links
- ✅ Email sent to creator
- ✅ Approval decision updates contract status

**Happy Testing! 🚀**
