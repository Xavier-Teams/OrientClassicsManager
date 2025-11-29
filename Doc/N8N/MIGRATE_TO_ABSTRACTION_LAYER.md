# 🔄 Hướng Dẫn Migrate N8N Workflow sang Abstraction Layer

> **Cách update N8N workflow để sử dụng views và functions thay vì query tables trực tiếp**

---

## 📋 Tổng Quan

### **Mục Tiêu:**
- ✅ Giảm database coupling
- ✅ Dễ maintain khi schema thay đổi
- ✅ Centralized business logic

---

## 🔄 CÁC THAY ĐỔI CẦN THỰC HIỆN

### **1. Get Contract Details**

**Trước (Hardcode table):**
```sql
SELECT c.*, COALESCE(u.email, '') as creator_email, 
       COALESCE(u.full_name, 'Unknown') as creator_name, 
       COALESCE(u.id, c.created_by_id) as creator_id 
FROM translation_contracts c 
LEFT JOIN users u ON c.created_by_id = u.id 
WHERE c.id = CAST('{{ $json.contract_id }}' AS BIGINT)
```

**Sau (Dùng view):**
```sql
SELECT * FROM v_contracts_for_approval 
WHERE id = CAST('{{ $json.contract_id }}' AS BIGINT)
```

**Lợi ích:**
- ✅ Đơn giản hơn
- ✅ Schema changes không break workflow
- ✅ Tự động có approval info

---

### **2. Create Approval Workflow**

**Trước (Direct insert):**
```sql
INSERT INTO approval_workflows (
    document_type, document_id, workflow_name, 
    total_steps, created_by_id, assigned_to_id, status
) VALUES (
    'contract', {{ $json.document_id }}, 
    'Contract Approval - {{ $json.contract_number }}', 
    2, {{ $json.created_by_id }}, {{ $json.created_by_id }}, 'in_progress'
) RETURNING id
```

**Sau (Dùng function):**
```sql
SELECT * FROM submit_contract_for_approval(
    CAST('{{ $json.document_id }}' AS BIGINT),
    CAST('{{ $json.created_by_id }}' AS BIGINT)
)
```

**Lợi ích:**
- ✅ Business logic trong database
- ✅ Tự động lấy total_steps từ workflow_levels
- ✅ Validation built-in

---

### **3. Get Approver**

**Trước (Hardcode roles):**
```sql
SELECT id, email, full_name, role 
FROM users 
WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem') 
ORDER BY CASE role 
    WHEN 'truong_ban_thu_ky' THEN 1 
    WHEN 'pho_chu_nhiem' THEN 2 
    WHEN 'manager' THEN 3 
END 
LIMIT 1
```

**Sau (Dùng function):**
```sql
SELECT * FROM get_approver_for_level(
    'contract',
    {{ $json.current_level_number }}
)
```

**Lợi ích:**
- ✅ Dynamic level support
- ✅ Logic trong database
- ✅ Dễ thay đổi priority

---

### **4. Process Approval Decision**

**Trước (Multiple queries):**
```sql
-- Query 1: Get token
SELECT at.*, aw.document_id, aw.document_type 
FROM approval_tokens at 
LEFT JOIN approval_workflows aw ON at.workflow_id = aw.id 
WHERE at.token = '{{ $query.token }}'

-- Query 2: Update token
UPDATE approval_tokens 
SET decision = '{{ $query.decision }}', used_at = NOW() 
WHERE token = '{{ $query.token }}'

-- Query 3: Check next level
SELECT * FROM workflow_levels 
WHERE document_type = 'contract' 
  AND level_number = {{ current_step + 1 }}
```

**Sau (Dùng function):**
```sql
SELECT * FROM process_approval_decision(
    '{{ $query.token }}',
    '{{ $query.decision }}'
)
```

**Lợi ích:**
- ✅ Single query thay vì 3 queries
- ✅ Atomic operation
- ✅ Tự động return next level info

---

### **5. Check Next Level**

**Trước (Query workflow_levels):**
```sql
SELECT * FROM workflow_levels 
WHERE document_type = 'contract' 
  AND level_number = {{ current_step + 1 }}
```

**Sau (Dùng view):**
```sql
SELECT * FROM v_workflow_next_level 
WHERE workflow_id = '{{ $json.workflow_id }}'
```

**Lợi ích:**
- ✅ Đơn giản hơn
- ✅ Tự động check has_next_level

---

## 📝 WORKFLOW NODE UPDATES

### **Node: "Get Contract Details"**

**Update query:**
```sql
SELECT * FROM v_contracts_for_approval 
WHERE id = CAST('{{ $json.contract_id }}' AS BIGINT) 
   OR contract_number = '{{ $json.contract_id }}'
```

---

### **Node: "Format Approval Data"**

**Simplify - không cần query workflow_levels nữa:**
```javascript
// Function sẽ tự động lấy total_steps
// Chỉ cần format data cơ bản
const contract = $json;

return {
  json: {
    document_id: contract.id,
    created_by_id: contract.creator_user_id || contract.created_by_id,
    // Function sẽ handle phần còn lại
  }
};
```

---

### **Node: "Create Approval Workflow"**

**Thay insert bằng function call:**
```sql
SELECT * FROM submit_contract_for_approval(
    CAST('{{ $json.document_id }}' AS BIGINT),
    CAST('{{ $json.created_by_id }}' AS BIGINT)
)
```

**Output sẽ có:**
- `workflow_id`
- `total_steps`
- `current_step`
- `first_level_role`

---

### **Node: "Get Current Level Approver"**

**Dùng function:**
```sql
SELECT * FROM get_approver_for_level(
    'contract',
    {{ $json.current_step }}
)
```

**Output sẽ có:**
- `user_id`
- `email`
- `full_name`
- `role`
- `level_name`
- `timeout_hours`

---

### **Node: "Get Workflow and Next Level"**

**Dùng function:**
```sql
SELECT * FROM process_approval_decision(
    '{{ $query.token }}',
    '{{ $query.decision }}'
)
```

**Output sẽ có:**
- `workflow_id`
- `document_id`
- `current_step`
- `total_steps`
- `has_next_level`
- `next_level_number`
- `next_level_name`
- `next_role_id`
- `next_timeout_hours`

---

### **Node: "Has Next Level?"**

**Simplify condition:**
```javascript
// Thay vì check length và level_number
// Chỉ cần check has_next_level
{{ $json.has_next_level }} === true
```

---

## 🧪 TESTING CHECKLIST

### **Before Migration:**
- [ ] Backup current workflow
- [ ] Run `setup_n8n_abstraction_layer.sql`
- [ ] Verify views và functions created
- [ ] Test views với sample data
- [ ] Test functions với sample data

### **After Migration:**
- [ ] Test workflow với contract_id = 3
- [ ] Verify logs trong `n8n_workflow_logs`
- [ ] Check execution history
- [ ] Test với multiple levels
- [ ] Test error cases

---

## 📊 COMPARISON

### **Before (Hardcoded):**
- ❌ 5+ direct table queries
- ❌ Hardcoded business logic
- ❌ Schema changes break workflows
- ❌ Difficult to maintain

### **After (Abstraction Layer):**
- ✅ 2-3 function calls
- ✅ Business logic in database
- ✅ Schema changes don't break workflows
- ✅ Easy to maintain

---

## 🚀 MIGRATION STEPS

1. **Run SQL script:**
   ```sql
   -- Run in pgAdmin
   scripts/setup_n8n_abstraction_layer.sql
   ```

2. **Update workflow nodes:**
   - Replace table queries với views
   - Replace inserts với functions
   - Simplify logic nodes

3. **Test thoroughly:**
   - Test với existing contracts
   - Test với new contracts
   - Test error cases

4. **Monitor:**
   - Check logs
   - Monitor performance
   - Review execution history

---

## ⚠️ ROLLBACK PLAN

Nếu có vấn đề:

1. **Keep old workflow version** trong Git
2. **Views và functions** có thể drop nếu cần
3. **Revert workflow** về version cũ
4. **No data loss** - chỉ thay đổi cách query

---

_Last Updated: 2024-11-28_
_Status: 📋 Migration Guide - Ready for Implementation_

