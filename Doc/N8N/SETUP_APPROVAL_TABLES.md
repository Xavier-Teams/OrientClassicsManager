# 🔧 Setup Approval Tables - Fixed Version

> **Hướng dẫn setup** approval workflow tables với đúng data types

## ⚠️ **VẤN ĐỀ ĐÃ FIX:**

- ❌ **Lỗi cũ**: `users.id` là UUID nhưng thực tế là `BIGINT`
- ❌ **Lỗi cũ**: `translation_contracts.id` là UUID nhưng thực tế là `BIGINT`
- ✅ **Đã fix**: Tất cả foreign keys sử dụng `BIGINT` để match với schema thực tế

## 📋 **DATA TYPES CHÍNH XÁC:**

- `users.id`: **BIGINT** (Django model)
- `translation_contracts.id`: **BIGINT** (BIGSERIAL)
- `approval_workflows.id`: **UUID** (internal ID)
- `approval_workflows.document_id`: **BIGINT** (references translation_contracts.id)
- `approval_workflows.created_by_id`: **BIGINT** (references users.id)
- `approval_workflows.assigned_to_id`: **BIGINT** (references users.id)
- `approval_history.approver_id`: **BIGINT** (references users.id)
- `approval_tokens.approver_id`: **BIGINT** (references users.id)

## 🚀 **SETUP INSTRUCTIONS:**

### **Option 1: Chạy toàn bộ file (Khuyến nghị)**

1. **Mở pgAdmin**
2. **Connect to `translation_db`**
3. **Open file**: `scripts/setup_approval_tables_fixed.sql`
4. **Run toàn bộ file** (pgAdmin sẽ tự động handle transactions)

### **Option 2: Chạy từng phần (Nếu Option 1 lỗi)**

#### **Part 1: Enum Types**
```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM (
            'pending', 'in_progress', 'approved', 'rejected', 
            'cancelled', 'expired', 'on_hold'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_action') THEN
        CREATE TYPE approval_action AS ENUM (
            'submit', 'approve', 'reject', 'request_changes', 
            'delegate', 'escalate', 'cancel'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
    END IF;
END $$;
```

#### **Part 2: Approval Workflows Table**
```sql
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    document_id BIGINT NOT NULL,
    workflow_name VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status approval_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    deadline TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by_id BIGINT REFERENCES users(id),
    assigned_to_id BIGINT REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_document ON approval_workflows(document_type, document_id);
```

#### **Part 3: Approval History Table**
```sql
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id BIGINT REFERENCES users(id),
    action approval_action NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_history_workflow ON approval_history(workflow_id);
```

#### **Part 4: Approval Tokens Table**
```sql
CREATE TABLE IF NOT EXISTS approval_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) UNIQUE NOT NULL,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    approver_id BIGINT REFERENCES users(id),
    step_number INTEGER NOT NULL,
    decision VARCHAR(20) DEFAULT 'pending',
    expiry_date TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_tokens_token ON approval_tokens(token);
```

#### **Part 5: Grant Permissions**
```sql
GRANT SELECT, INSERT, UPDATE ON approval_workflows TO n8n_user;
GRANT SELECT, INSERT, UPDATE ON approval_history TO n8n_user;
GRANT SELECT, INSERT, UPDATE ON approval_tokens TO n8n_user;
```

## ✅ **VERIFICATION:**

Sau khi setup, chạy query này để verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('approval_workflows', 'approval_history', 'approval_tokens');

-- Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('approval_workflows', 'approval_history', 'approval_tokens');
```

## 🎯 **NEXT STEPS:**

Sau khi setup thành công:

1. ✅ **Import workflow** vào N8N
2. ✅ **Setup PostgreSQL credentials**
3. ✅ **Test với contract_id = 3**

**Happy Setup! 🚀**
