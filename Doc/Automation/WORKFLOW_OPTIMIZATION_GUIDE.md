# 🚀 Workflow Optimization Guide

> **Hướng dẫn tối ưu hóa N8N workflows** để cải thiện performance, reliability và maintainability

**Last Updated:** 2024-12-XX  
**Status:** ✅ Active

---

## 📋 Mục Lục

- [🎯 Tổng Quan](#-tổng-quan)
- [⚡ Performance Optimization](#-performance-optimization)
- [🛡️ Error Handling](#️-error-handling)
- [📊 Monitoring & Logging](#-monitoring--logging)
- [🔄 Workflow Best Practices](#-workflow-best-practices)
- [📈 Optimization Checklist](#-optimization-checklist)

---

## 🎯 Tổng Quan

### **Mục Tiêu Tối Ưu:**

1. **Performance** - Giảm thời gian execution
2. **Reliability** - Tăng tỷ lệ thành công
3. **Maintainability** - Dễ debug và maintain
4. **Scalability** - Hỗ trợ tải cao

---

## ⚡ Performance Optimization

### **1. Database Query Optimization**

#### ✅ **Sử dụng Views và Functions thay vì Query trực tiếp**

**❌ Không nên:**
```sql
-- Query trực tiếp trong N8N
SELECT * FROM work_tasks t
LEFT JOIN work_tasks_assigned_to wta ON t.id = wta.worktask_id
LEFT JOIN users u ON wta.user_id = u.id
WHERE t.is_active = true
  AND t.status IN ('chua_bat_dau', 'dang_tien_hanh')
  AND t.due_date IS NOT NULL
```

**✅ Nên:**
```sql
-- Sử dụng View đã được tối ưu
SELECT * FROM v_tasks_for_reminder 
WHERE due_date <= CURRENT_DATE + INTERVAL '3 days'
```

#### ✅ **Sử dụng Indexes**

Đảm bảo các columns được query thường xuyên có indexes:
- `workflow_execution_logs(workflow_name, status, started_at)`
- `work_tasks(status, due_date, is_active)`
- `translation_contracts(status, signed_at)`

#### ✅ **Limit Results**

Luôn sử dụng `LIMIT` khi query dữ liệu lớn:
```sql
SELECT * FROM v_recent_workflow_executions LIMIT 100
```

---

### **2. Code Node Optimization**

#### ✅ **Minimize Code Node Usage**

**❌ Không nên:**
- Nhiều Code Nodes liên tiếp
- Complex logic trong Code Node

**✅ Nên:**
- Sử dụng database functions cho complex logic
- Combine multiple operations trong một Code Node
- Cache data khi có thể

#### ✅ **Efficient Data Processing**

```javascript
// ❌ Không nên: Multiple loops
const tasks = $input.all();
const grouped = {};
tasks.forEach(task => {
  // Process task
});

// ✅ Nên: Single pass processing
const tasks = $input.all();
const grouped = tasks.reduce((acc, task) => {
  // Process and group in one pass
  return acc;
}, {});
```

---

### **3. Network Optimization**

#### ✅ **Batch Operations**

**❌ Không nên:**
```javascript
// Send individual notifications
for (const user of users) {
  await sendNotification(user);
}
```

**✅ Nên:**
```javascript
// Batch notifications
await sendBatchNotifications(users);
```

#### ✅ **Connection Pooling**

Sử dụng connection pooling cho database connections trong N8N.

---

## 🛡️ Error Handling

### **1. Comprehensive Error Handling**

#### ✅ **Try-Catch trong Code Nodes**

```javascript
try {
  // Main logic
  const result = processData($input.all());
  return result;
} catch (error) {
  // Log error
  return {
    json: {
      success: false,
      error: error.message,
      stack: error.stack
    }
  };
}
```

#### ✅ **Continue on Fail**

Enable "Continue on Fail" cho các nodes không critical:
- Email notifications
- Mattermost notifications
- Optional logging

#### ✅ **Error Recovery**

```javascript
// Retry logic
const maxRetries = 3;
let retries = 0;

while (retries < maxRetries) {
  try {
    return await executeOperation();
  } catch (error) {
    retries++;
    if (retries >= maxRetries) throw error;
    await sleep(1000 * retries); // Exponential backoff
  }
}
```

---

### **2. Validation**

#### ✅ **Input Validation**

```javascript
// Validate required fields
const contractId = input.contract_id;
if (!contractId || contractId === '' || contractId === 'null') {
  throw new Error('contract_id is required');
}
```

#### ✅ **Data Type Validation**

```javascript
// Ensure correct data types
const userId = Number(input.user_id);
if (isNaN(userId) || userId <= 0) {
  throw new Error('Invalid user_id');
}
```

---

## 📊 Monitoring & Logging

### **1. Comprehensive Logging**

#### ✅ **Log All Critical Steps**

```sql
-- Log workflow start
SELECT log_workflow_execution(
  'Workflow Name',
  'execution_id',
  'Step Name',
  'step_type',
  'status',
  'metadata'::jsonb,
  ...
);
```

#### ✅ **Structured Logging**

```javascript
// Use structured metadata
const metadata = {
  contract_id: contract.id,
  contract_number: contract.contract_number,
  status: contract.status,
  user_id: userId,
  timestamp: new Date().toISOString()
};
```

---

### **2. Performance Monitoring**

#### ✅ **Track Execution Time**

```javascript
const startTime = Date.now();
// ... execute operation ...
const duration = Date.now() - startTime;

// Log duration
return {
  json: {
    ...result,
    execution_time_ms: duration
  }
};
```

#### ✅ **Monitor Slow Executions**

Sử dụng `v_workflow_performance` view để identify slow steps.

---

## 🔄 Workflow Best Practices

### **1. Workflow Structure**

#### ✅ **Clear Node Naming**

- Use descriptive names: "Get Contract Details" not "Postgres 1"
- Add notes for complex logic
- Group related nodes

#### ✅ **Error Paths**

Always include error handling paths:
```
Main Flow → Success
         → Error → Log Error → Notify Admin
```

---

### **2. Data Flow**

#### ✅ **Minimize Data Passing**

- Only pass necessary data between nodes
- Use database views to filter early
- Avoid passing large JSON objects

#### ✅ **Data Transformation**

Transform data as early as possible:
```javascript
// Transform in first Code Node
const cleanData = $input.all().map(item => ({
  id: Number(item.json.id),
  name: String(item.json.name).trim(),
  // ... only necessary fields
}));
```

---

### **3. Workflow Activation**

#### ✅ **Test Before Activating**

- Test với sample data
- Verify error handling
- Check notification channels
- Validate database operations

#### ✅ **Gradual Rollout**

- Start with low-volume workflows
- Monitor for errors
- Gradually increase volume

---

## 📈 Optimization Checklist

### **Performance**

- [ ] Database queries use indexes
- [ ] Views and functions used instead of direct queries
- [ ] Results are limited appropriately
- [ ] Code nodes are optimized
- [ ] Batch operations where possible
- [ ] Connection pooling configured

### **Error Handling**

- [ ] All critical steps have error handling
- [ ] Input validation in place
- [ ] Continue on fail enabled for non-critical nodes
- [ ] Error recovery logic implemented
- [ ] Error notifications configured

### **Logging**

- [ ] All critical steps are logged
- [ ] Structured metadata in logs
- [ ] Execution time tracked
- [ ] Error details logged
- [ ] Dashboard monitoring set up

### **Workflow Structure**

- [ ] Clear node naming
- [ ] Notes added for complex logic
- [ ] Error paths included
- [ ] Data flow optimized
- [ ] Workflow tested before activation

---

## 🔍 Monitoring Dashboard

### **Access Dashboard:**

1. **API Endpoints:**
   ```bash
   # Dashboard summary
   GET /api/workflow/dashboard/summary?days=7
   
   # Workflow statistics
   GET /api/workflow/stats
   
   # Recent executions
   GET /api/workflow/recent?limit=50
   
   # Errors
   GET /api/workflow/errors
   
   # Performance metrics
   GET /api/workflow/performance?workflow_name=Contract%20Approval
   ```

2. **Database Views:**
   ```sql
   -- Execution statistics
   SELECT * FROM v_workflow_execution_stats;
   
   -- Recent executions
   SELECT * FROM v_recent_workflow_executions;
   
   -- Errors
   SELECT * FROM v_workflow_errors;
   
   -- Performance
   SELECT * FROM v_workflow_performance;
   ```

---

## 📚 Additional Resources

- [N8N Best Practices](https://docs.n8n.io/workflows/best-practices/)
- [Database Optimization Guide](./DATABASE_OPTIMIZATION.md)
- [Error Handling Patterns](./ERROR_HANDLING_PATTERNS.md)

---

**✨ Remember:** Optimization is an ongoing process. Monitor, measure, and iterate!

