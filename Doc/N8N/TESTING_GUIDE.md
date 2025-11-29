# 🧪 N8N Workflow Testing Guide - OrientClassicsManager

> **Hướng dẫn test** contract approval workflow với contract_id thực tế

## 📋 Mục lục

- [Prerequisites](#prerequisites)
- [Step 1: Get Contract ID](#step-1-get-contract-id)
- [Step 2: Test Webhook](#step-2-test-webhook)
- [Step 3: Verify Results](#step-3-verify-results)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ N8N container đang chạy
- ✅ Workflow đã được **Activate**
- ✅ PostgreSQL credentials đã setup trong N8N
- ✅ Database `translation_db` accessible
- ✅ Table `translation_contracts` tồn tại

---

## Step 1: Get Contract ID

### **Option A: Using pgAdmin**

1. **Connect to `translation_db`** trong pgAdmin
2. **Run query**:
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
   ORDER BY created_at DESC
   LIMIT 10;
   ```
3. **Copy `id`** (BIGINT format, ví dụ: `3`) để test

**Lưu ý**: `translation_contracts.id` là **BIGINT** (BIGSERIAL), không phải UUID

### **Option B: Using Script**

Chạy file `scripts/get_contract_ids.sql` trong pgAdmin

---

## Step 2: Test Webhook

### **Webhook URL:**

```
http://localhost:5678/webhook/contract-approval
```

### **Method 1: PowerShell Script (Khuyến nghị)**

```powershell
# Test với contract_id thực tế
.\scripts\test_contract_approval_webhook.ps1 -ContractId "3"
```

**Ví dụ:**

```powershell
.\scripts\test_contract_approval_webhook.ps1 -ContractId "3"
```

**Lưu ý**: Contract ID là **BIGINT** (số nguyên), không phải UUID

### **Method 2: Manual PowerShell**

```powershell
$webhookUrl = "http://localhost:5678/webhook/contract-approval"
$body = @{
    contract_id = "your-contract-uuid-here"
} | ConvertTo-Json

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
```

### **Method 3: Using curl (if available)**

```bash
curl -X POST http://localhost:5678/webhook/contract-approval \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "your-contract-uuid-here"}'
```

---

## Step 3: Verify Results

### **3.1. Check N8N Execution**

1. **Mở N8N**: http://localhost:5678
2. **Click "Executions"** (clock icon) ở menu
3. **Xem execution mới nhất**
4. **Click vào execution** để xem chi tiết

### **3.2. Verify Each Node**

- ✅ **Contract Submitted**: Should show received data
- ✅ **Get Contract Details**: Should return contract data
- ✅ **Check Status**: Should evaluate condition
- ✅ **Get Manager**: Should return manager user
- ✅ **Send Approval Email**: Should send email (if configured)
- ✅ **Respond to Webhook**: Should return success response

### **3.3. Check Database**

```sql
-- Verify contract status updated (if workflow updates it)
SELECT id, contract_number, status
FROM translation_contracts
WHERE id = 'your-contract-uuid-here';

-- Check approval workflow created (if using multi-level)
SELECT * FROM approval_workflows
WHERE document_id = 'your-contract-uuid-here';
```

---

## Troubleshooting

### **Error: "Waiting for trigger event"**

**Nguyên nhân**: Workflow chưa được activate hoặc webhook chưa ready

**Giải pháp**:

1. Verify workflow toggle **ON** (Active)
2. Save workflow lại
3. Wait 5-10 seconds sau khi activate
4. Check webhook URL format

### **Error: "Database connection failed"**

**Nguyên nhân**: PostgreSQL credentials chưa setup

**Giải pháp**:

1. Go to **Credentials** trong N8N
2. Setup PostgreSQL credential với:
   - Host: `host.docker.internal`
   - Port: `5432`
   - Database: `translation_db`
   - User: `n8n_user`
   - Password: `n8n_secure_password_2024`
3. Test connection
4. Update workflow nodes với credential này

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

### **Error: "No rows returned"**

**Nguyên nhân**: Contract ID không tồn tại hoặc format sai

**Giải pháp**:

1. Verify contract_id format (BIGINT - số nguyên)
2. Check contract exists:
   ```sql
   SELECT * FROM translation_contracts WHERE id = 3;
   ```
3. Verify contract_id trong request body đúng format (có thể là string "3" hoặc số 3)

### **Email Not Sending**

**Nguyên nhân**: Email credentials chưa setup

**Giải pháp**:

1. Update `.env.n8n`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
2. Restart N8N:
   ```bash
   docker-compose -f docker-compose.n8n.yml restart
   ```

---

## 📊 Expected Results

### **Success Response:**

```json
{
  "success": true,
  "message": "Contract approval request sent",
  "contract_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Error Response:**

```json
{
  "success": false,
  "message": "Contract status must be 'draft' to submit for approval",
  "current_status": "pending"
}
```

---

## 🎯 Next Steps

Sau khi test thành công:

1. **Setup email notifications** (Gmail SMTP)
2. **Implement multi-level approval** (director, CEO)
3. **Add approval tokens** với expiry
4. **Create audit logs** cho compliance
5. **Integrate với OrientClassicsManager API**

---

**Happy Testing! 🚀**
