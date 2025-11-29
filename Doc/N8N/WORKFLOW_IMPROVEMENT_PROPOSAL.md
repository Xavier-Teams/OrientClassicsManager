# 🚀 Đề Xuất Cải Tiến Workflow - Theo Hướng N8N Template

> **Phân tích workflow mẫu từ [n8n.io](https://n8n.io/workflows/8174-automate-document-approvals-with-multi-level-workflows-using-supabase-and-gmail/)** và đề xuất cải tiến cho hệ thống hiện tại

---

## 📊 So Sánh Kiến Trúc

### **Workflow Mẫu (N8N Template)**

**Database Schema:**
- `documents` - Lưu thông tin document
- `workflow_levels` - Định nghĩa các level approval (dynamic)
- `approvals` - Lưu approval requests với tokens
- `audit_logs` - Lưu tất cả actions
- `users` - User management

**Đặc điểm:**
- ✅ **Dynamic workflow levels** - Levels được định nghĩa trong database
- ✅ **Level progression** - Tự động chuyển level khi approved
- ✅ **Comprehensive audit logging** - Mọi action đều được log
- ✅ **Supabase integration** - PostgreSQL + Storage + Real-time

### **Workflow Hiện Tại**

**Database Schema:**
- `translation_contracts` - Contracts (tương đương documents)
- `approval_workflows` - Workflow tracking với `current_step` và `total_steps` (hardcoded = 2)
- `approval_tokens` - Approval tokens
- `approval_history` - Approval history (tương đương audit_logs)
- `users` - User management

**Đặc điểm:**
- ⚠️ **Hardcoded 2 levels** - `total_steps = 2` cố định
- ⚠️ **No workflow_levels table** - Không có table để quản lý levels
- ✅ **PostgreSQL trực tiếp** - Không cần Supabase (đã có PostgreSQL)
- ✅ **Token system** - Đã có approval tokens
- ✅ **History tracking** - Đã có approval_history

---

## 🎯 Đề Xuất Cải Tiến

### **1. Thêm `workflow_levels` Table** ⭐ (Quan trọng nhất)

Tạo table để quản lý dynamic approval levels:

```sql
-- ============================================================================
-- WORKFLOW LEVELS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,  -- 'contract', 'document', etc.
    level_number INTEGER NOT NULL,         -- 1, 2, 3, ...
    level_name VARCHAR(100) NOT NULL,      -- 'Manager Approval', 'Director Approval', etc.
    role_id VARCHAR(50) NOT NULL,          -- 'manager', 'truong_ban_thu_ky', 'pho_chu_nhiem', 'chu_nhiem'
    is_required BOOLEAN DEFAULT TRUE,       -- Level có bắt buộc không
    timeout_hours INTEGER DEFAULT 48,      -- Thời gian timeout
    reminder_hours INTEGER DEFAULT 24,    -- Thời gian nhắc nhở
    auto_approve_conditions JSONB DEFAULT '{}',  -- Điều kiện auto-approve
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_type, level_number)
);

CREATE INDEX IF NOT EXISTS idx_workflow_levels_document_type ON workflow_levels(document_type);
CREATE INDEX IF NOT EXISTS idx_workflow_levels_level_number ON workflow_levels(level_number);
```

**Lợi ích:**
- ✅ Dynamic levels - Có thể thêm/bớt levels mà không cần sửa code
- ✅ Flexible configuration - Mỗi document type có thể có levels khác nhau
- ✅ Easy maintenance - Quản lý levels qua database

---

### **2. Cải Tiến Workflow Logic**

**Thay đổi từ:**
```javascript
// Hardcoded
total_steps: 2
```

**Thành:**
```javascript
// Dynamic - Query từ workflow_levels
const levels = await query(`
  SELECT level_number, level_name, role_id 
  FROM workflow_levels 
  WHERE document_type = 'contract' 
  ORDER BY level_number
`);
total_steps: levels.length
```

---

### **3. Thêm Level Progression Logic**

Khi một level được approved, tự động chuyển sang level tiếp theo:

```javascript
// Sau khi approved
const currentLevel = workflow.current_step;
const nextLevel = await query(`
  SELECT * FROM workflow_levels 
  WHERE document_type = 'contract' 
    AND level_number = ${currentLevel + 1}
`);

if (nextLevel) {
  // Tạo approval request cho level tiếp theo
  // Generate token, send email, etc.
} else {
  // Đã đến level cuối - Final approval
  // Update contract status to 'approved'
}
```

---

### **4. Cải Tiến Audit Logging**

Thêm `audit_logs` table (hoặc mở rộng `approval_history`):

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    document_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,  -- 'approval_sent', 'approved', 'rejected', 'level_progressed'
    actor_email VARCHAR(255),      -- Email của người thực hiện
    actor_id BIGINT REFERENCES users(id),
    details JSONB DEFAULT '{}',    -- Thông tin chi tiết (level, role, etc.)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_document ON audit_logs(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
```

---

### **5. Supabase vs PostgreSQL Trực Tiếp**

**Workflow mẫu dùng Supabase:**
- PostgreSQL database
- Supabase Storage (cho files)
- Real-time subscriptions
- Built-in authentication

**Hệ thống hiện tại:**
- ✅ PostgreSQL trực tiếp - Đã có, không cần thay đổi
- ⚠️ File storage - Có thể dùng local storage hoặc S3
- ⚠️ Real-time - Có thể thêm WebSocket nếu cần
- ✅ Authentication - Đã có Django/Express auth

**Kết luận:** Không cần chuyển sang Supabase, giữ PostgreSQL trực tiếp là tốt nhất.

---

## 📋 Implementation Plan

### **Phase 1: Database Schema** (Ưu tiên cao)

1. ✅ Tạo `workflow_levels` table
2. ✅ Tạo `audit_logs` table (hoặc mở rộng `approval_history`)
3. ✅ Seed data cho workflow levels:
   ```sql
   INSERT INTO workflow_levels (document_type, level_number, level_name, role_id) VALUES
   ('contract', 1, 'Manager Approval', 'truong_ban_thu_ky'),
   ('contract', 2, 'Director Approval', 'pho_chu_nhiem'),
   ('contract', 3, 'CEO Approval', 'chu_nhiem');
   ```

### **Phase 2: Workflow Logic** (Ưu tiên cao)

1. ✅ Update "Format Approval Data" node:
   - Query `workflow_levels` để lấy `total_steps` dynamic
   - Set `current_step = 1` (level đầu tiên)

2. ✅ Update "Decision Approved?" logic:
   - Check nếu có level tiếp theo
   - Nếu có → Tạo approval request cho level tiếp theo
   - Nếu không → Final approval

3. ✅ Add "Level Progression" node:
   - Query next level từ `workflow_levels`
   - Generate token cho level mới
   - Send email notification
   - Update `current_step` trong `approval_workflows`

### **Phase 3: Audit Logging** (Ưu tiên trung bình)

1. ✅ Add audit log entries:
   - Khi gửi approval request
   - Khi approved/rejected
   - Khi chuyển level
   - Khi final approval

### **Phase 4: Testing & Documentation** (Ưu tiên thấp)

1. ✅ Test với multiple levels
2. ✅ Test level progression
3. ✅ Update documentation

---

## 🔄 Workflow Flow Mới

```
1. Contract Submitted
   ↓
2. Get Contract Details
   ↓
3. Query workflow_levels (get total_steps dynamically)
   ↓
4. Create Approval Workflow (current_step = 1, total_steps = from DB)
   ↓
5. Get Level 1 Approver (from workflow_levels)
   ↓
6. Generate Token & Send Email
   ↓
7. Wait for Decision
   ↓
8. If Approved:
   - Check if next level exists
   - If YES → Create approval for next level (current_step++)
   - If NO → Final approval (update contract status)
   ↓
9. If Rejected:
   - Update contract status to 'rejected'
   - Stop workflow
```

---

## ✅ Lợi Ích

1. **Flexibility** - Có thể thay đổi số lượng levels mà không cần sửa code
2. **Maintainability** - Quản lý levels qua database, dễ maintain
3. **Scalability** - Dễ dàng thêm levels mới cho các document types khác
4. **Compliance** - Audit logging đầy đủ cho compliance requirements
5. **User Experience** - Workflow rõ ràng, dễ theo dõi

---

## 🚀 Next Steps

1. **Review proposal** - Xem xét và phê duyệt
2. **Create migration script** - Tạo SQL script để thêm tables
3. **Update workflow** - Cập nhật N8N workflow với logic mới
4. **Test** - Test với multiple levels
5. **Deploy** - Deploy lên production

---

## 📚 References

- [N8N Template](https://n8n.io/workflows/8174-automate-document-approvals-with-multi-level-workflows-using-supabase-and-gmail/)
- Current workflow: `n8n-workflows/contract-approval-multilevel-ready.json`
- Database schema: `scripts/setup_approval_tables_fixed.sql`

---

_Last Updated: 2024-11-28_
_Status: 📋 Proposal - Awaiting Review_

