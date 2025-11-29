# 🔄 Đề Xuất Luồng Xử Lý N8N - Task & Contract Management

> **Tài liệu đề xuất các workflow N8N** cho hệ thống OrientClassicsManager, đảm bảo cân bằng N8N và API, tối ưu hệ thống và giảm thiểu rủi ro

**Last Updated:** 2024-11-28  
**Status:** 📋 Proposal - Ready for Review

---

## 📋 Mục Lục

- [🎯 Tổng Quan](#-tổng-quan)
- [📊 Phân Tích Hiện Trạng](#-phân-tích-hiện-trạng)
- [🔄 Đề Xuất Workflows - Task Management](#-đề-xuất-workflows---task-management)
- [📄 Đề Xuất Workflows - Contract Management](#-đề-xuất-workflows---contract-management)
- [🛡️ Nguyên Tắc & Best Practices](#️-nguyên-tắc--best-practices)
- [📈 Lộ Trình Triển Khai](#-lộ-trình-triển-khai)

---

## 🎯 Tổng Quan

### **Mục Tiêu:**

1. **Tự động hóa các quy trình phức tạp** - Multi-step workflows
2. **Giảm thiểu API calls** - Tối ưu performance
3. **Đảm bảo tính nhất quán** - Centralized business logic
4. **Giảm thiểu rủi ro** - Database coupling, debugging, vendor lock-in

### **Nguyên Tắc Cốt Lõi:**

✅ **Hybrid Architecture** - API cho core logic, N8N cho automation  
✅ **Database Abstraction** - Views và Functions, không query trực tiếp  
✅ **Comprehensive Logging** - Audit trail cho mọi execution  
✅ **Error Handling** - Robust error handling và recovery

---

## 📊 Phân Tích Hiện Trạng

### **1. Task Management (Quản Lý Task)**

#### **Hiện Trạng:**

**Django Backend:**

- `WorkTask` model với nhiều trạng thái và workflow phức tạp
- Assignment, evaluation, redo workflows
- Multiple work groups (chung, bien_tap, thiet_ke_cntt, etc.)

**Express Backend:**

- `administrativeTasks` - Nhiệm vụ hành chính
- `editingTasks` - Nhiệm vụ biên tập
- Basic CRUD operations

**Frontend:**

- Task assignment UI
- Evaluation và redo features
- Progress tracking

**Vấn Đề:**

- ❌ Chưa có automation cho task assignment
- ❌ Chưa có notification khi task due
- ❌ Chưa có workflow cho task evaluation
- ❌ Chưa có reminder system

#### **Cơ Hội N8N:**

✅ **Task Assignment Automation** - Tự động gán task dựa trên rules  
✅ **Due Date Reminders** - Email/Slack notifications  
✅ **Evaluation Workflow** - Multi-step evaluation process  
✅ **Status Change Notifications** - Notify stakeholders

---

### **2. Contract Management (Quản Lý Hợp Đồng)**

#### **Hiện Trạng:**

**Đã Có:**

- ✅ Multi-level approval workflow (N8N)
- ✅ Approval tokens system
- ✅ Email notifications

**Chưa Có:**

- ❌ Contract creation automation
- ❌ Payment milestone tracking
- ❌ Contract expiry reminders
- ❌ Status change workflows
- ❌ Document generation automation

#### **Cơ Hội N8N:**

✅ **Contract Creation Workflow** - Auto-generate từ work  
✅ **Payment Tracking** - Monitor payment milestones  
✅ **Expiry Reminders** - Notify before contract expires  
✅ **Status Change Workflows** - Automated status transitions  
✅ **Document Generation** - Auto-generate contract documents

---

## 🔄 Đề Xuất Workflows - Task Management

### **Workflow 1: Task Assignment Automation** ⭐

**Mục đích:** Tự động gán task cho người phù hợp dựa trên rules

**Trigger:** API call từ backend khi tạo task mới

**Luồng xử lý:**

```
1. Webhook: Task Created
   ↓
2. Get Task Details (View: v_tasks_for_assignment)
   ↓
3. Determine Assignment Rules (Code Node)
   - Check work_group
   - Check priority
   - Check workload của assignees
   ↓
4. Get Available Assignees (Function: get_available_assignees())
   ↓
5. Assign Task (Function: assign_task())
   ↓
6. Send Assignment Notification (Email/Slack)
   ↓
7. Log Execution (Function: log_workflow_execution())
```

**API Integration:**

```typescript
// Backend API
POST /api/admin-tasks
  → Create task
  → Call N8N webhook: POST /webhook/task-assignment

// N8N Webhook
POST /webhook/task-assignment
{
  "task_id": "uuid",
  "work_group": "bien_tap",
  "priority": "high"
}
```

**Database Abstraction:**

```sql
-- View
CREATE VIEW v_tasks_for_assignment AS
SELECT
  t.id,
  t.title,
  t.work_group,
  t.priority,
  t.due_date,
  u.id as created_by_id,
  u.full_name as created_by_name
FROM administrative_tasks t
LEFT JOIN users u ON t.created_by_id = u.id
WHERE t.assigned_to_id IS NULL
  AND t.status = 'pending';

-- Function
CREATE FUNCTION assign_task(
  p_task_id VARCHAR,
  p_assignee_id VARCHAR,
  p_assigned_by_id VARCHAR
) RETURNS JSON;
```

**Lợi ích:**

- ✅ Giảm manual assignment
- ✅ Consistent assignment rules
- ✅ Automatic notifications (Email + Mattermost)
- ✅ Workload balancing

**Notifications:**

- Email: Gửi email cho assignee
- Mattermost: Post vào channel `#tasks-general` và mention assignee

---

### **Workflow 2: Task Due Date Reminder** ⭐⭐

**Mục đích:** Gửi reminder trước khi task đến hạn

**Trigger:** Scheduled (Cron: Every day at 9 AM)

**Luồng xử lý:**

```
1. Cron Trigger (Schedule: 0 9 * * *)
   ↓
2. Get Tasks Due Soon (View: v_tasks_due_soon)
   - Due in 1 day
   - Due in 3 days
   - Overdue
   ↓
3. Group by Assignee (Code Node)
   ↓
4. Send Reminder Email (Email Node)
   - Template: Task reminder
   - Include task list
   ↓
5. Send Mattermost Notification (Mattermost Node)
   - Channel: #tasks-general hoặc #tasks-urgent
   - Format: Rich message với task list
   - Mention assignees
   ↓
6. Update Reminder Sent Flag (Function: update_task_reminder())
   ↓
6. Log Execution
```

**Database Abstraction:**

```sql
-- View
CREATE VIEW v_tasks_due_soon AS
SELECT
  t.id,
  t.title,
  t.due_date,
  t.priority,
  u.id as assignee_id,
  u.email as assignee_email,
  u.full_name as assignee_name,
  CASE
    WHEN t.due_date < CURRENT_DATE THEN 'overdue'
    WHEN t.due_date = CURRENT_DATE THEN 'due_today'
    WHEN t.due_date <= CURRENT_DATE + INTERVAL '1 day' THEN 'due_1_day'
    WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due_3_days'
  END as urgency_level
FROM administrative_tasks t
LEFT JOIN users u ON t.assigned_to_id = u.id
WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date IS NOT NULL
  AND (
    t.due_date < CURRENT_DATE + INTERVAL '3 days'
    OR t.due_date = CURRENT_DATE
  );
```

**Lợi ích:**

- ✅ Proactive task management
- ✅ Reduce missed deadlines
- ✅ Automatic notifications (Email + Mattermost)
- ✅ No manual tracking needed
- ✅ Team visibility qua Mattermost channels

**Notifications:**

- Email: Gửi email cho assignee
- Mattermost: Post vào channel với rich formatting, mention assignee

---

### **Workflow 3: Task Evaluation Workflow** ⭐

**Mục đích:** Multi-step evaluation process khi task hoàn thành

**Trigger:** API call khi task status = 'completed'

**Luồng xử lý:**

```
1. Webhook: Task Completed
   ↓
2. Get Task Details (View: v_tasks_for_evaluation)
   ↓
3. Check if Supervisor Required (Code Node)
   ↓
4. Generate Evaluation Token (Function: create_evaluation_token())
   ↓
5. Send Evaluation Request (Email)
   - Link: /webhook/task-evaluation?token=xxx
   ↓
6. Wait for Evaluation (Webhook: task-evaluation)
   ↓
7. Process Evaluation (Function: process_task_evaluation())
   ↓
8. Update Task Status (Function: update_task_status())
   ↓
9. Notify Assignee (Email)
   ↓
10. Log Execution
```

**API Integration:**

```typescript
// Backend API
PATCH /api/admin-tasks/:id
{
  "status": "completed"
}
  → Call N8N: POST /webhook/task-completed

// N8N Webhooks
POST /webhook/task-completed
GET  /webhook/task-evaluation?token=xxx&rating=5&comment=...
```

**Lợi ích:**

- ✅ Structured evaluation process
- ✅ Token-based security
- ✅ Automatic notifications
- ✅ Audit trail

---

### **Workflow 4: Task Status Change Notifications** ⭐

**Mục đích:** Thông báo khi task status thay đổi

**Trigger:** API call khi task status thay đổi

**Luồng xử lý:**

```
1. Webhook: Task Status Changed
   ↓
2. Get Task Details (View: v_task_status_changes)
   ↓
3. Determine Recipients (Code Node)
   - Assignee
   - Creator
   - Supervisor (if exists)
   ↓
4. Format Notification (Code Node)
   - Status change message
   - Task details
   ↓
5. Send Notifications (Email/Slack)
   ↓
6. Log Execution
```

**Lợi ích:**

- ✅ Real-time updates
- ✅ Stakeholder awareness
- ✅ Reduced manual communication

---

## 📄 Đề Xuất Workflows - Contract Management

### **Workflow 5: Contract Creation Automation** ⭐⭐

**Mục đích:** Tự động tạo contract từ work với template

**Trigger:** API call khi work status = 'approved'

**Luồng xử lý:**

```
1. Webhook: Work Approved
   ↓
2. Get Work Details (View: v_works_for_contract)
   ↓
3. Check if Contract Exists (Function: check_contract_exists())
   ↓
4. Get Contract Template (View: v_contract_templates)
   ↓
5. Generate Contract Number (Function: generate_contract_number())
   ↓
6. Create Contract Draft (Function: create_contract_draft())
   ↓
7. Generate Contract Document (API: /api/v1/contract-templates/:id/generate)
   ↓
8. Save Contract File (Function: save_contract_file())
   ↓
9. Notify Creator (Email)
   ↓
10. Log Execution
```

**API Integration:**

```typescript
// Backend API
PATCH /api/works/:id
{
  "translationStatus": "approved"
}
  → Call N8N: POST /webhook/work-approved

// N8N Webhook
POST /webhook/work-approved
{
  "work_id": "uuid",
  "translator_id": "uuid"
}
```

**Database Abstraction:**

```sql
-- View
CREATE VIEW v_works_for_contract AS
SELECT
  w.id,
  w.name,
  w.translator_id,
  u.email as translator_email,
  u.full_name as translator_name,
  tp.id as translation_part_id,
  tp.code as translation_part_code
FROM works w
LEFT JOIN users u ON w.translator_id = u.id
LEFT JOIN translation_parts tp ON w.translation_part_id = tp.id
WHERE w.translation_status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM contracts c WHERE c.work_id = w.id
  );

-- Function
CREATE FUNCTION create_contract_draft(
  p_work_id VARCHAR,
  p_contract_number VARCHAR,
  p_template_id VARCHAR,
  p_created_by_id VARCHAR
) RETURNS JSON;
```

**Lợi ích:**

- ✅ Automated contract creation
- ✅ Consistent contract format
- ✅ Reduced manual work
- ✅ Faster contract processing

---

### **Workflow 6: Payment Milestone Tracking** ⭐⭐

**Mục đích:** Theo dõi và thông báo payment milestones

**Trigger:** Scheduled (Cron: Every day at 8 AM) + Event-based

**Luồng xử lý:**

```
1. Cron Trigger (Schedule: 0 8 * * *)
   ↓
2. Get Upcoming Payments (View: v_payment_milestones_due)
   ↓
3. Group by Contract (Code Node)
   ↓
4. Check Payment Status (Function: check_payment_status())
   ↓
5. Send Payment Reminder (Email)
   - To: Kế toán
   - To: Contract creator
   ↓
6. Update Reminder Sent (Function: update_payment_reminder())
   ↓
7. Log Execution
```

**Event-Based Trigger:**

```
1. Webhook: Payment Requested
   ↓
2. Get Payment Details (View: v_payment_requests)
   ↓
3. Check Approval Required (Code Node)
   ↓
4. If Approval Required:
   - Create Approval Workflow (Function)
   - Send Approval Request (Email)
   ↓
5. If Auto-Approved:
   - Process Payment (Function)
   - Notify Payee (Email)
   ↓
6. Log Execution
```

**Database Abstraction:**

```sql
-- View
CREATE VIEW v_payment_milestones_due AS
SELECT
  pm.id,
  pm.contract_id,
  c.contract_number,
  pm.type,
  pm.amount,
  pm.due_date,
  pm.sequence_number,
  u.email as creator_email,
  u.full_name as creator_name
FROM payment_milestones pm
INNER JOIN contracts c ON pm.contract_id = c.id
LEFT JOIN users u ON c.created_by_id = u.id
WHERE pm.due_date <= CURRENT_DATE + INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM payments p
    WHERE p.milestone_id = pm.id
      AND p.status = 'paid'
  );
```

**Lợi ích:**

- ✅ Proactive payment tracking
- ✅ Reduce missed payments
- ✅ Automatic reminders
- ✅ Approval workflow integration

---

### **Workflow 7: Contract Expiry Reminder** ⭐

**Mục đích:** Thông báo trước khi contract hết hạn

**Trigger:** Scheduled (Cron: Every day at 9 AM)

**Luồng xử lý:**

```
1. Cron Trigger (Schedule: 0 9 * * *)
   ↓
2. Get Contracts Expiring Soon (View: v_contracts_expiring_soon)
   ↓
3. Group by Urgency (Code Node)
   - Expiring in 30 days
   - Expiring in 7 days
   - Expired
   ↓
4. Send Reminder Email (Email)
   - To: Contract creator
   - To: Translator
   - To: Manager
   ↓
5. Update Reminder Sent (Function: update_contract_reminder())
   ↓
6. Log Execution
```

**Database Abstraction:**

```sql
-- View
CREATE VIEW v_contracts_expiring_soon AS
SELECT
  c.id,
  c.contract_number,
  c.end_date,
  c.status,
  w.name as work_name,
  u.email as creator_email,
  u.full_name as creator_name,
  t.email as translator_email,
  t.full_name as translator_name,
  CASE
    WHEN c.end_date < CURRENT_DATE THEN 'expired'
    WHEN c.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_7_days'
    WHEN c.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_30_days'
  END as urgency_level
FROM contracts c
INNER JOIN works w ON c.work_id = w.id
LEFT JOIN users u ON c.created_by_id = u.id
LEFT JOIN users t ON c.translator_id = t.id
WHERE c.status IN ('active', 'signed')
  AND c.end_date IS NOT NULL
  AND (
    c.end_date < CURRENT_DATE + INTERVAL '30 days'
    OR c.end_date < CURRENT_DATE
  );
```

**Lợi ích:**

- ✅ Proactive contract management
- ✅ Reduce expired contracts
- ✅ Automatic notifications
- ✅ Stakeholder awareness

---

### **Workflow 8: Contract Status Change Workflow** ⭐

**Mục đích:** Xử lý status changes với notifications và validations

**Trigger:** API call khi contract status thay đổi

**Luồng xử lý:**

```
1. Webhook: Contract Status Changed
   ↓
2. Get Contract Details (View: v_contract_status_changes)
   ↓
3. Validate Status Transition (Function: validate_status_transition())
   ↓
4. If Invalid:
   - Return Error
   - Log Error
   ↓
5. If Valid:
   - Update Contract Status (Function: update_contract_status())
   - Determine Recipients (Code Node)
   - Send Notifications (Email)
   - Trigger Related Workflows (Code Node)
     - If status = 'signed': Trigger payment milestone creation
     - If status = 'completed': Trigger final payment
   ↓
6. Log Execution
```

**API Integration:**

```typescript
// Backend API
PATCH /api/contracts/:id
{
  "status": "signed"
}
  → Call N8N: POST /webhook/contract-status-changed

// N8N Webhook
POST /webhook/contract-status-changed
{
  "contract_id": "uuid",
  "old_status": "pending",
  "new_status": "signed",
  "changed_by_id": "uuid"
}
```

**Lợi ích:**

- ✅ Validated status transitions
- ✅ Automatic related workflows
- ✅ Comprehensive notifications
- ✅ Audit trail

---

### **Workflow 9: Contract Document Generation** ⭐

**Mục đích:** Tự động generate contract documents khi cần

**Trigger:** API call hoặc scheduled

**Luồng xử lý:**

```
1. Webhook: Generate Contract Document
   ↓
2. Get Contract Details (View: v_contracts_for_document)
   ↓
3. Get Template (View: v_contract_templates)
   ↓
4. Call Document Generation API (HTTP Request)
   POST /api/v1/contract-templates/:id/generate
   ↓
5. Save Generated Document (Function: save_contract_document())
   ↓
6. Update Contract File URL (Function: update_contract_file())
   ↓
7. Notify Creator (Email)
   ↓
8. Log Execution
```

**Lợi ích:**

- ✅ Automated document generation
- ✅ Consistent document format
- ✅ Reduced manual work
- ✅ Version control

---

## 🛡️ Nguyên Tắc & Best Practices

### **1. Database Abstraction Layer** 🔒

**QUY TẮC:**

✅ **LUÔN** dùng Views cho SELECT queries  
✅ **LUÔN** dùng Functions cho INSERT/UPDATE/DELETE  
❌ **KHÔNG** query tables trực tiếp  
❌ **KHÔNG** hardcode column names

**Ví dụ:**

```sql
-- ✅ ĐÚNG
SELECT * FROM v_tasks_for_assignment WHERE id = 'xxx';

-- ❌ SAI
SELECT * FROM administrative_tasks WHERE id = 'xxx';
```

---

### **2. Error Handling** 🐛

**QUY TẮC:**

✅ **LUÔN** có error handling nodes  
✅ **LUÔN** log errors với context  
✅ **LUÔN** return error response (không throw)  
✅ **LUÔN** set `continueOnFail: true` cho external services

**Pattern:**

```
Node Execution
  ↓
Try/Catch
  ↓
┌───┴───┐
↓       ↓
Success Error
  ↓
Log Error (Function: log_workflow_execution())
  ↓
Continue on Fail
  ↓
Return Error Response
```

---

### **3. Logging** 📝

**QUY TẮC:**

✅ **LUÔN** log important nodes  
✅ **LUÔN** log errors với stack traces  
✅ **LUÔN** track execution time  
✅ **LUÔN** log input/output data

**Logging Function:**

```sql
CREATE FUNCTION log_workflow_execution(
  p_workflow_name VARCHAR,
  p_execution_id VARCHAR,
  p_node_name VARCHAR,
  p_status VARCHAR,
  p_input_data JSONB,
  p_output_data JSONB,
  p_error_message TEXT,
  p_execution_time_ms INTEGER
) RETURNS VOID;
```

---

### **4. API vs N8N Balance** ⚖️

**QUY TẮC:**

**Dùng API cho:**

- ✅ CRUD operations
- ✅ Data validation
- ✅ Authentication/Authorization
- ✅ Core business logic
- ✅ Real-time operations

**Dùng N8N cho:**

- ✅ Multi-step workflows
- ✅ External integrations (Email, Slack)
- ✅ Background processing
- ✅ Scheduled tasks
- ✅ Event-driven automation

**Pattern:**

```
Frontend
  ↓ (API)
Backend API (Core Logic)
  ↓ (Webhook)
N8N (Automation)
  ↓ (Views/Functions)
Database
```

---

### **5. Security** 🔐

**QUY TẮC:**

✅ **LUÔN** validate webhook requests  
✅ **LUÔN** use tokens for authentication  
✅ **LUÔN** rate limiting  
✅ **LUÔN** input validation

**N8N User Permissions:**

```sql
-- Chỉ grant permissions cần thiết
GRANT SELECT ON v_* TO n8n_user;
GRANT EXECUTE ON FUNCTION * TO n8n_user;
GRANT INSERT, SELECT ON n8n_workflow_logs TO n8n_user;
-- KHÔNG grant direct table access
```

---

## 📈 Lộ Trình Triển Khai

### **Phase 1: Foundation (Week 1-2)** 🏗️

**Mục tiêu:** Setup database abstraction layer

- [ ] Create database views cho tasks
- [ ] Create database views cho contracts
- [ ] Create stored functions cho operations
- [ ] Setup logging table và functions
- [ ] Test views và functions

**Deliverables:**

- `scripts/setup_task_abstraction_layer.sql`
- `scripts/setup_contract_abstraction_layer.sql`
- Test results

---

### **Phase 2: Task Management Workflows (Week 3-4)** 📋

**Mục tiêu:** Implement task management workflows

**Priority 1:**

- [ ] Workflow 2: Task Due Date Reminder (Scheduled)
- [ ] Workflow 4: Task Status Change Notifications

**Priority 2:**

- [ ] Workflow 1: Task Assignment Automation
- [ ] Workflow 3: Task Evaluation Workflow

**Deliverables:**

- N8N workflow JSON files
- Documentation
- Test results

---

### **Phase 3: Contract Management Workflows (Week 5-6)** 📄

**Mục tiêu:** Implement contract management workflows

**Priority 1:**

- [ ] Workflow 7: Contract Expiry Reminder (Scheduled)
- [ ] Workflow 8: Contract Status Change Workflow

**Priority 2:**

- [ ] Workflow 5: Contract Creation Automation
- [ ] Workflow 6: Payment Milestone Tracking
- [ ] Workflow 9: Contract Document Generation

**Deliverables:**

- N8N workflow JSON files
- Documentation
- Test results

---

### **Phase 4: Integration & Testing (Week 7-8)** 🧪

**Mục tiêu:** Integrate workflows với backend và test

- [ ] Integrate webhooks với backend API
- [ ] Test all workflows end-to-end
- [ ] Performance testing
- [ ] Error handling testing
- [ ] Documentation review

**Deliverables:**

- Integration tests
- Performance report
- Updated documentation

---

### **Phase 5: Monitoring & Optimization (Week 9-10)** 📊

**Mục tiêu:** Monitor và optimize workflows

- [ ] Setup monitoring dashboard
- [ ] Review workflow logs
- [ ] Optimize slow workflows
- [ ] Update documentation
- [ ] Team training

**Deliverables:**

- Monitoring dashboard
- Optimization report
- Training materials

---

## 📊 Metrics & Success Criteria

### **Performance Metrics:**

- **Workflow Execution Time:**

  - Target: < 5 seconds per workflow
  - Monitor: Average execution time
  - Alert: > 10 seconds

- **Success Rate:**

  - Target: > 95% success rate
  - Monitor: Success/Error ratio
  - Alert: < 90% success rate

- **API Calls Reduced:**
  - Target: 50% reduction in API calls
  - Monitor: Before/After comparison

### **Business Metrics:**

- **Task Assignment Time:**

  - Before: Manual (5-10 minutes)
  - After: Automated (< 1 minute)
  - Target: 80% time reduction

- **Contract Creation Time:**

  - Before: Manual (15-30 minutes)
  - After: Automated (< 5 minutes)
  - Target: 70% time reduction

- **Notification Delivery:**
  - Target: 100% delivery rate
  - Monitor: Email/Slack delivery
  - Alert: < 95% delivery rate

---

## 🚨 Risk Mitigation

### **1. Database Coupling** 🔒

**Risk:** Schema changes break workflows

**Mitigation:**

- ✅ Use views và functions (abstraction layer)
- ✅ Document schema dependencies
- ✅ Test schema changes before deploy

---

### **2. Debugging Difficulty** 🐛

**Risk:** Khó debug workflow issues

**Mitigation:**

- ✅ Comprehensive logging (n8n_workflow_logs)
- ✅ Logging API endpoints
- ✅ Error tracking và alerting
- ✅ Documentation

---

### **3. Vendor Lock-in** 🔐

**Risk:** Phụ thuộc vào N8N

**Mitigation:**

- ✅ Hybrid architecture (API + N8N)
- ✅ Database abstraction layer
- ✅ Workflow documentation
- ✅ Migration path planning

---

### **4. Performance** ⚡

**Risk:** N8N workflows slow down system

**Mitigation:**

- ✅ Optimize database queries
- ✅ Use efficient views/functions
- ✅ Monitor performance metrics
- ✅ Scale N8N resources if needed

---

## 📚 Related Documents

1. **`Doc/N8N/ARCHITECTURE_DECISIONS.md`** - Architecture decisions
2. **`Doc/N8N/RISK_MITIGATION_SUMMARY.md`** - Risk mitigation summary
3. **`Doc/N8N/N8N_VS_API_ANALYSIS.md`** - N8N vs API analysis
4. **`Doc/N8N/COMPLETE_SETUP_GUIDE.md`** - Setup guide

---

## ✅ Next Steps

### **Immediate (This Week):**

1. **Review và approve** workflow proposals
2. **Prioritize workflows** based on business needs
3. **Create database abstraction layer** (views và functions)
4. **Setup logging infrastructure**

### **Short-term (Next 2 Weeks):**

1. **Implement Priority 1 workflows**
2. **Test workflows** thoroughly
3. **Integrate với backend API**
4. **Document workflows**

### **Long-term (Next Month):**

1. **Implement Priority 2 workflows**
2. **Monitor và optimize**
3. **Expand to other areas**
4. **Continuous improvement**

---

_This document should be reviewed and updated regularly as workflows are implemented and refined._
