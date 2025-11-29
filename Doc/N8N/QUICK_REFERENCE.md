# ⚡ Quick Reference - N8N Hybrid Architecture

> **Quick reference guide cho developers và team**

---

## 🎯 CORE PRINCIPLES

1. **Hybrid Architecture** - API cho core logic, N8N cho automation
2. **Database Abstraction** - Views và Functions, không query tables trực tiếp
3. **Comprehensive Logging** - Log tất cả executions
4. **Risk Mitigation** - Giảm coupling, debugging khó, vendor lock-in

---

## 📋 QUICK CHECKLIST

### **Khi tạo N8N workflow mới:**

- [ ] ✅ Dùng views cho SELECT queries
- [ ] ✅ Dùng functions cho INSERT/UPDATE
- [ ] ❌ KHÔNG query tables trực tiếp
- [ ] ✅ Add logging nodes
- [ ] ✅ Add error handling
- [ ] ✅ Set `continueOnFail: true` cho external services
- [ ] ✅ Document workflow logic

---

## 🔍 COMMON QUERIES

### **Get Contract:**
```sql
SELECT * FROM v_contracts_for_approval 
WHERE id = CAST('{{ $json.contract_id }}' AS BIGINT)
```

### **Submit for Approval:**
```sql
SELECT * FROM submit_contract_for_approval(
    CAST('{{ $json.contract_id }}' AS BIGINT),
    CAST('{{ $json.created_by_id }}' AS BIGINT)
)
```

### **Get Approver:**
```sql
SELECT * FROM get_approver_for_level('contract', {{ level_number }})
```

### **Process Decision:**
```sql
SELECT * FROM process_approval_decision(
    '{{ $query.token }}',
    '{{ $query.decision }}'
)
```

---

## 🐛 DEBUGGING

### **Check Workflow Logs:**
```sql
SELECT * FROM n8n_workflow_logs 
WHERE execution_id = 'execution_id'
ORDER BY created_at ASC;
```

### **Check API Logs:**
```bash
GET /api/n8n/logs?execution_id=xxx
```

---

## 📁 KEY FILES

- `scripts/setup_n8n_abstraction_layer.sql` - Views & Functions
- `scripts/setup_workflow_levels.sql` - Workflow levels
- `n8n-workflows/contract-approval-multilevel-ready.json` - Main workflow
- `Doc/N8N/ARCHITECTURE_DECISIONS.md` - Full documentation

---

_For detailed information, see `ARCHITECTURE_DECISIONS.md`_

