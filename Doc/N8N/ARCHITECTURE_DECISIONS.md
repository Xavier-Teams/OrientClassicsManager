# 🏗️ Architecture Decisions - N8N Integration

> **Document ghi nhớ các quyết định kiến trúc, chiến lược, và best practices cho hệ thống Hybrid (N8N + API)**

**Last Updated:** 2024-11-28  
**Status:** 📋 Active - Reference Document

---

## 📋 TỔNG QUAN

### **Quyết Định Chính:**
- ✅ **Hybrid Architecture** - Kết hợp N8N và API
- ✅ **Database Abstraction Layer** - Views và Functions
- ✅ **Comprehensive Logging** - Audit logs cho debugging
- ✅ **Risk Mitigation** - Giảm thiểu coupling, debugging khó, vendor lock-in

---

## 🎯 1. HYBRID ARCHITECTURE DECISION

### **Kiến Trúc Được Chọn:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (API calls)
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express/Django)                   │
│  - CRUD operations                                           │
│  - Data validation                                           │
│  - Authentication/Authorization                               │
│  - Core business logic                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ↓ (Webhook)             ↓ (Direct DB)
┌──────────────────┐   ┌──────────────────┐
│   N8N Workflows   │   │   PostgreSQL     │
│  - Automation     │   │   Database       │
│  - Multi-step     │   │   - Views        │
│  - External       │   │   - Functions    │
│    integrations   │   │   - Tables       │
└──────────────────┘   └──────────────────┘
```

### **Phân Chia Trách Nhiệm:**

#### **API Layer (Core Logic):**
```typescript
// Core API endpoints
GET  /api/contracts              // List contracts
POST /api/contracts              // Create contract
GET  /api/contracts/:id          // Get contract details
PUT  /api/contracts/:id          // Update contract
GET  /api/contracts/:id/status   // Get approval status

// Logging endpoints
POST /api/n8n/logs              // Log workflow execution
GET  /api/n8n/logs              // Query logs
GET  /api/n8n/logs/execution/:id // Execution summary
```

**Trách nhiệm:**
- ✅ CRUD operations
- ✅ Data validation
- ✅ Authentication/Authorization
- ✅ Core business logic
- ✅ Logging API

#### **N8N Layer (Automation):**
```javascript
// N8N Webhooks
POST /webhook/contract-approval          // Submit for approval
GET  /webhook/contract-approval-decision // Approval decision
```

**Trách nhiệm:**
- ✅ Workflow automation
- ✅ Multi-step processes
- ✅ External integrations (Email, Slack, etc.)
- ✅ Background processing
- ✅ Event-driven workflows

---

## 🛡️ 2. RISK MITIGATION STRATEGY

### **Rủi Ro 1: Database Coupling** 🔒

**Vấn đề:** N8N hardcode table names, schema changes break workflows

**Giải pháp đã áp dụng:**

1. **Database Views** - Abstraction layer
   ```sql
   -- Views che giấu table structure
   v_contracts_for_approval
   v_approval_workflows_detail
   v_approval_tokens_detail
   v_workflow_next_level
   ```

2. **Stored Functions** - Business logic trong database
   ```sql
   -- Functions cho operations phức tạp
   submit_contract_for_approval()
   get_approver_for_level()
   process_approval_decision()
   create_approval_token()
   ```

3. **N8N Workflow Rules:**
   - ✅ **KHÔNG** query tables trực tiếp
   - ✅ **LUÔN** dùng views hoặc functions
   - ✅ **KHÔNG** hardcode column names
   - ✅ **LUÔN** dùng abstraction layer

**Files:**
- `scripts/setup_n8n_abstraction_layer.sql`
- `Doc/N8N/MIGRATE_TO_ABSTRACTION_LAYER.md`

---

### **Rủi Ro 2: Debugging Khó** 🐛

**Vấn đề:** Khó track workflow execution, khó test, error messages không rõ

**Giải pháp đã áp dụng:**

1. **Audit Logging Table:**
   ```sql
   n8n_workflow_logs (
     workflow_name,
     execution_id,
     node_name,
     status,
     input_data,
     output_data,
     error_message,
     execution_time_ms
   )
   ```

2. **Logging API Endpoints:**
   ```typescript
   POST /api/n8n/logs              // Log execution
   GET  /api/n8n/logs              // Query logs
   GET  /api/n8n/logs/execution/:id // Execution summary
   GET  /api/n8n/logs/statistics   // Workflow statistics
   ```

3. **Logging Best Practices:**
   - ✅ Log mỗi important node
   - ✅ Log errors với stack traces
   - ✅ Track execution time
   - ✅ Log input/output data

**Files:**
- `scripts/setup_n8n_abstraction_layer.sql` (logging table)
- `scripts/setup_n8n_logging_api.ts` (logging API)

---

### **Rủi Ro 3: Vendor Lock-in** 🔐

**Vấn đề:** Phụ thuộc vào N8N, khó migrate sang tool khác

**Giải pháp đã áp dụng:**

1. **Workflow Abstraction Schema:**
   - Define abstract workflow format
   - Independent of N8N
   - Can convert to/from N8N format

2. **Documentation:**
   - Document workflow logic
   - Document database operations
   - Document external services

3. **Hybrid Architecture:**
   - Core logic trong API (không phụ thuộc N8N)
   - N8N chỉ cho automation
   - Có thể thay N8N bằng tool khác

**Files:**
- `Doc/N8N/RISK_MITIGATION_STRATEGY.md`
- Workflow documentation

---

## 📊 3. DATABASE ARCHITECTURE

### **Abstraction Layer Structure:**

```
┌─────────────────────────────────────────┐
│         N8N Workflows                    │
│  (Query views/functions only)            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Database Abstraction Layer          │
│  ┌─────────────┐  ┌──────────────┐      │
│  │   Views     │  │  Functions   │      │
│  │             │  │              │      │
│  │ - v_*       │  │ - submit_*   │      │
│  │             │  │ - get_*     │      │
│  │             │  │ - process_*  │      │
│  └─────────────┘  └──────────────┘      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Database Tables                     │
│  - translation_contracts                 │
│  - approval_workflows                   │
│  - approval_tokens                      │
│  - workflow_levels                      │
│  - n8n_workflow_logs                    │
└─────────────────────────────────────────┘
```

### **Views (Read Operations):**
- `v_contracts_for_approval` - Contract với approval info
- `v_approval_workflows_detail` - Workflow với level info
- `v_approval_tokens_detail` - Tokens với context
- `v_workflow_next_level` - Next level info

### **Functions (Write Operations):**
- `submit_contract_for_approval()` - Create workflow
- `get_approver_for_level()` - Get approver
- `process_approval_decision()` - Process decision
- `create_approval_token()` - Create token
- `log_workflow_execution()` - Log execution

---

## 🔄 4. WORKFLOW PATTERNS

### **Pattern 1: Submit for Approval**

```
Frontend → API → N8N Webhook
                ↓
         Get Contract (view)
                ↓
         Submit Workflow (function)
                ↓
         Get Approver (function)
                ↓
         Generate Token (function)
                ↓
         Send Email
```

### **Pattern 2: Process Decision**

```
User clicks link → N8N Webhook
                    ↓
         Process Decision (function)
                    ↓
         Has Next Level? (view)
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
Next Level                    Final Approval
    ↓                               ↓
Progress Workflow            Update Contract
```

### **Pattern 3: Error Handling**

```
Node Execution
    ↓
Try/Catch
    ↓
┌───┴───┐
↓       ↓
Success Error
    ↓
Log Error
    ↓
Continue on Fail
    ↓
Return Error Response
```

---

## 📝 5. CODING STANDARDS & BEST PRACTICES

### **N8N Workflow Rules:**

1. **Database Queries:**
   - ✅ **LUÔN** dùng views cho SELECT
   - ✅ **LUÔN** dùng functions cho INSERT/UPDATE
   - ❌ **KHÔNG** query tables trực tiếp
   - ❌ **KHÔNG** hardcode column names

2. **Error Handling:**
   - ✅ **LUÔN** có error handling nodes
   - ✅ **LUÔN** log errors
   - ✅ **LUÔN** return error response (không throw)
   - ✅ **LUÔN** set `continueOnFail: true` cho external services

3. **Logging:**
   - ✅ **LUÔN** log important nodes
   - ✅ **LUÔN** log errors với stack traces
   - ✅ **LUÔN** track execution time
   - ✅ **LUÔN** log input/output data

4. **Code Nodes:**
   - ✅ **LUÔN** validate input data
   - ✅ **LUÔN** handle null/undefined
   - ✅ **LUÔN** return consistent format
   - ✅ **LUÔN** add comments

---

### **API Standards:**

1. **Endpoints:**
   - ✅ RESTful design
   - ✅ Consistent error format
   - ✅ Proper HTTP status codes
   - ✅ Input validation

2. **Logging:**
   - ✅ Log all API calls
   - ✅ Log errors với context
   - ✅ Track performance metrics

---

## 🗂️ 6. FILE STRUCTURE

### **N8N Related Files:**

```
n8n-workflows/
  └── contract-approval-multilevel-ready.json  # Main workflow

scripts/
  ├── setup_n8n_abstraction_layer.sql         # Views & Functions
  ├── setup_workflow_levels.sql                # Workflow levels
  ├── setup_approval_tables_fixed.sql          # Base tables
  └── setup_n8n_logging_api.ts                 # Logging API

Doc/N8N/
  ├── ARCHITECTURE_DECISIONS.md                # This file
  ├── RISK_MITIGATION_STRATEGY.md             # Risk mitigation
  ├── RISK_MITIGATION_SUMMARY.md               # Quick reference
  ├── MIGRATE_TO_ABSTRACTION_LAYER.md           # Migration guide
  ├── N8N_VS_API_ANALYSIS.md                   # N8N vs API analysis
  ├── WORKFLOW_IMPROVEMENT_PROPOSAL.md         # Improvement proposal
  └── COMPLETE_SETUP_GUIDE.md                  # Setup guide
```

---

## 🔐 7. SECURITY CONSIDERATIONS

### **Database Security:**

1. **N8N User Permissions:**
   ```sql
   -- Chỉ grant permissions cần thiết
   GRANT SELECT ON v_* TO n8n_user;
   GRANT EXECUTE ON FUNCTION * TO n8n_user;
   GRANT INSERT, SELECT ON n8n_workflow_logs TO n8n_user;
   -- KHÔNG grant direct table access
   ```

2. **Webhook Security:**
   - ✅ Validate webhook requests
   - ✅ Use tokens for authentication
   - ✅ Rate limiting
   - ✅ Input validation

---

## 📈 8. MONITORING & MAINTENANCE

### **Monitoring:**

1. **Workflow Execution:**
   - Monitor `n8n_workflow_logs` table
   - Track success/error rates
   - Monitor execution time

2. **API Performance:**
   - Monitor API response times
   - Track error rates
   - Monitor database query performance

3. **Database Health:**
   - Monitor view performance
   - Track function execution time
   - Monitor table sizes

### **Maintenance:**

1. **Regular Reviews:**
   - Review workflow logs weekly
   - Review error patterns
   - Optimize slow queries

2. **Schema Changes:**
   - Update views/functions first
   - Test thoroughly
   - Update documentation

---

## 🚀 9. IMPLEMENTATION CHECKLIST

### **Phase 1: Database Abstraction** ✅
- [x] Create database views
- [x] Create stored functions
- [x] Grant permissions
- [ ] Test views và functions
- [ ] Update N8N workflows

### **Phase 2: Logging** ✅
- [x] Create logging table
- [x] Create logging API
- [ ] Add logging nodes to workflows
- [ ] Create monitoring dashboard

### **Phase 3: Workflow Migration** ⏳
- [ ] Backup current workflows
- [ ] Update workflows to use views/functions
- [ ] Test thoroughly
- [ ] Deploy

### **Phase 4: Documentation** ✅
- [x] Document architecture decisions
- [x] Document risk mitigation
- [x] Create migration guides
- [ ] Update team documentation

---

## 📚 10. KEY DECISIONS LOG

### **Decision 1: Hybrid Architecture**
**Date:** 2024-11-28  
**Decision:** Sử dụng Hybrid Architecture (N8N + API)  
**Rationale:** Best of both worlds - API cho core logic, N8N cho automation  
**Status:** ✅ Implemented

### **Decision 2: Database Abstraction Layer**
**Date:** 2024-11-28  
**Decision:** Tạo views và functions để giảm database coupling  
**Rationale:** Schema changes không break workflows  
**Status:** ✅ Designed, ⏳ Pending Implementation

### **Decision 3: Comprehensive Logging**
**Date:** 2024-11-28  
**Decision:** Implement audit logging cho tất cả workflow executions  
**Rationale:** Dễ debug và troubleshoot  
**Status:** ✅ Designed, ⏳ Pending Implementation

### **Decision 4: Dynamic Workflow Levels**
**Date:** 2024-11-28  
**Decision:** Sử dụng `workflow_levels` table thay vì hardcode  
**Rationale:** Flexible, dễ maintain  
**Status:** ✅ Implemented

---

## ⚠️ 11. KNOWN LIMITATIONS & TRADE-OFFS

### **Limitations:**

1. **N8N Performance:**
   - Slower than direct API calls
   - Resource intensive
   - Limited scalability

2. **Debugging:**
   - Still harder than code debugging
   - Requires N8N UI access
   - Limited breakpoint support

3. **Version Control:**
   - Large JSON files
   - Merge conflicts difficult
   - No code review process

### **Trade-offs:**

1. **Development Speed vs Control:**
   - ✅ Fast development với N8N
   - ❌ Less control than pure code

2. **Flexibility vs Performance:**
   - ✅ Flexible workflows
   - ❌ Performance overhead

3. **Abstraction vs Complexity:**
   - ✅ Reduced coupling
   - ❌ More layers to maintain

---

## 🎯 12. SUCCESS METRICS

### **Metrics to Track:**

1. **Workflow Performance:**
   - Average execution time
   - Success rate
   - Error rate

2. **API Usage:**
   - API calls reduced
   - Response times
   - Error rates

3. **Maintainability:**
   - Time to add new workflow
   - Time to fix bugs
   - Schema change impact

---

## 📖 13. REFERENCES

### **Internal Documents:**
- `Doc/N8N/RISK_MITIGATION_STRATEGY.md` - Chiến lược chi tiết
- `Doc/N8N/N8N_VS_API_ANALYSIS.md` - Phân tích N8N vs API
- `Doc/N8N/WORKFLOW_IMPROVEMENT_PROPOSAL.md` - Đề xuất cải tiến
- `Doc/N8N/COMPLETE_SETUP_GUIDE.md` - Setup guide

### **External References:**
- [N8N Documentation](https://docs.n8n.io/)
- [N8N Template - Multi-level Approval](https://n8n.io/workflows/8174-automate-document-approvals-with-multi-level-workflows-using-supabase-and-gmail/)

---

## 🔄 14. UPDATE LOG

### **2024-11-28:**
- ✅ Created architecture decisions document
- ✅ Defined hybrid architecture
- ✅ Designed risk mitigation strategy
- ✅ Created database abstraction layer
- ✅ Designed logging system
- ✅ Updated workflow to use dynamic levels

---

## ✅ 15. NEXT STEPS

### **Immediate (This Week):**
1. Run `setup_n8n_abstraction_layer.sql`
2. Test views và functions
3. Update N8N workflow to use abstraction layer
4. Add logging nodes

### **Short-term (Next 2 Weeks):**
1. Implement logging API
2. Create monitoring dashboard
3. Document all workflows
4. Train team on new architecture

### **Long-term (Next Month):**
1. Optimize workflow performance
2. Review and refine abstraction layer
3. Expand to other workflows
4. Continuous improvement

---

_This document should be reviewed and updated regularly as the system evolves._

