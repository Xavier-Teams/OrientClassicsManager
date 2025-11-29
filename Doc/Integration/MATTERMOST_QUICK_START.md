# 🚀 Mattermost Quick Start Guide

> **Hướng dẫn nhanh** setup Mattermost và tích hợp với N8N workflows

**Last Updated:** 2024-11-28  
**Xem chi tiết:** `Doc/Integration/MATTERMOST_INTEGRATION.md`

---

## 🎯 Mattermost là gì?

**Mattermost** = **Open-source team collaboration platform** (giống Slack, nhưng self-hosted)

**Ưu điểm:**
- ✅ Open source - Không phí license
- ✅ Self-hosted - Full control data
- ✅ Tích hợp dễ dàng với N8N
- ✅ Rich notifications

---

## ⚡ Quick Setup (15 phút)

### **Step 1: Start Mattermost với Docker**

```powershell
# Tạo docker-compose file
# File: docker-compose.mattermost.yml (xem MATTERMOST_INTEGRATION.md)

# Start Mattermost
docker-compose -f docker-compose.mattermost.yml up -d
```

**Access:** http://localhost:8065

---

### **Step 2: Create Channels**

**Recommended channels:**
- `#tasks-general` - Task notifications
- `#contracts-approvals` - Contract approvals
- `#system-alerts` - System notifications

---

### **Step 3: Create Webhook**

1. **Mattermost** → **Integrations** → **Incoming Webhooks**
2. **Add Incoming Webhook** cho channel `#tasks-general`
3. **Copy Webhook URL**

**Webhook URL format:**
```
http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 4: Add to N8N Workflow**

**Option A: Mattermost Node**

1. **N8N** → **Add Node** → **Mattermost**
2. **Configure:**
   - URL: http://localhost:8065
   - Access Token: (từ Mattermost)
   - Channel: #tasks-general
   - Message: `{{ $json.message }}`

**Option B: HTTP Request Node**

1. **N8N** → **Add Node** → **HTTP Request**
2. **Configure:**
   - Method: POST
   - URL: (Webhook URL từ Step 3)
   - Body: JSON message

---

## 📋 Use Cases

### **1. Task Due Reminder**

```javascript
// N8N Code Node
return {
  json: {
    text: "📋 **Task Reminder**",
    attachments: [{
      color: "#FF6B6B",
      title: "Tasks Due Today",
      fields: [
        { short: true, title: "Task", value: task.title },
        { short: true, title: "Assignee", value: `@${task.assignee}` }
      ]
    }]
  }
};
```

### **2. Contract Approval**

```javascript
// Mattermost notification
{
  text: "📄 **Contract Approval Required**",
  attachments: [{
    color: "#4ECDC4",
    title: `Contract ${contract.contract_number}`,
    fields: [
      { short: true, title: "Amount", value: contract.amount },
      { short: true, title: "Approver", value: `@${approver}` }
    ]
  }]
}
```

---

## 🔗 Integration với Existing Workflows

**Update Workflow 2: Task Due Reminder**

```
1. Cron Trigger
   ↓
2. Get Tasks Due Soon
   ↓
3. Send Email (existing)
   ↓
4. Send Mattermost (NEW) ← Add this
   ↓
5. Log Execution
```

---

## ✅ Checklist

- [ ] Mattermost running (http://localhost:8065)
- [ ] Channels created
- [ ] Webhooks created
- [ ] N8N Mattermost node configured
- [ ] Test notification sent
- [ ] Workflow updated

---

## 📚 Next Steps

1. **Xem chi tiết:** `Doc/Integration/MATTERMOST_INTEGRATION.md`
2. **Update workflows:** Thêm Mattermost vào existing workflows
3. **Test:** Test với real data
4. **Expand:** Thêm more channels và notifications

---

**Questions?** Xem `MATTERMOST_INTEGRATION.md` để biết thêm chi tiết.

