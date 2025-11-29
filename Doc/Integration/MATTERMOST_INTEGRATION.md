# 💬 Mattermost Integration Guide - OrientClassicsManager

> **Hướng dẫn tích hợp Mattermost** vào hệ thống OrientClassicsManager cho team collaboration và notifications

**Last Updated:** 2024-11-28  
**Status:** 📋 Integration Guide

---

## 📋 Mục Lục

- [🎯 Mattermost là gì?](#-mattermost-là-gì)
- [💡 Tại sao dùng Mattermost?](#-tại-sao-dùng-mattermost)
- [🏗️ Kiến Trúc Tích Hợp](#️-kiến-trúc-tích-hợp)
- [🔄 Ứng Dụng trong Dự Án](#-ứng-dụng-trong-dự-án)
- [⚙️ Setup & Configuration](#️-setup--configuration)
- [📊 Use Cases Cụ Thể](#-use-cases-cụ-thể)
- [🔧 Technical Implementation](#-technical-implementation)

---

## 🎯 Mattermost là gì?

### **Định Nghĩa:**

**Mattermost** là một **open-source team collaboration platform** (nền tảng cộng tác nhóm mã nguồn mở), tương tự như Slack hoặc Microsoft Teams, nhưng:

- ✅ **Self-hosted** - Tự host trên server của bạn
- ✅ **Open Source** - Mã nguồn mở, không phí license
- ✅ **Data Privacy** - Dữ liệu hoàn toàn trong tầm kiểm soát
- ✅ **Customizable** - Có thể tùy chỉnh theo nhu cầu
- ✅ **Enterprise Ready** - Phù hợp cho doanh nghiệp

### **Tính Năng Chính:**

1. **Team Messaging** - Chat nhóm, channels, direct messages
2. **File Sharing** - Chia sẻ files, images, documents
3. **Integrations** - Tích hợp với nhiều tools (N8N, GitHub, Jira, etc.)
4. **Notifications** - Real-time notifications
5. **Search** - Tìm kiếm messages, files, users
6. **Mobile Apps** - iOS và Android apps
7. **Video Calls** - Voice và video calls (với plugins)

### **So Sánh với Slack/Teams:**

| Feature           | Mattermost | Slack      | Microsoft Teams    |
| ----------------- | ---------- | ---------- | ------------------ |
| **Open Source**   | ✅ Yes     | ❌ No      | ❌ No              |
| **Self-hosted**   | ✅ Yes     | ❌ No      | ❌ No (Cloud only) |
| **Cost**          | ✅ Free    | 💰 Paid    | 💰 Paid            |
| **Data Control**  | ✅ Full    | ❌ Limited | ❌ Limited         |
| **Customization** | ✅ High    | ⚠️ Medium  | ⚠️ Medium          |
| **Integrations**  | ✅ 400+    | ✅ 2000+   | ✅ 1000+           |
| **Mobile Apps**   | ✅ Yes     | ✅ Yes     | ✅ Yes             |

---

## 💡 Tại sao dùng Mattermost?

### **Lợi Ích cho Dự Án:**

1. **Team Collaboration** ⭐

   - Centralized communication
   - Project channels
   - Real-time updates

2. **Notifications từ N8N** ⭐⭐

   - Task reminders
   - Contract approvals
   - Payment notifications
   - Status changes

3. **Data Privacy** 🔒

   - Self-hosted = full control
   - Không phụ thuộc third-party cloud
   - Compliance với data regulations

4. **Cost Effective** 💰

   - Không phí license
   - Chỉ tốn server resources
   - Open source = no vendor lock-in

5. **Integration với N8N** 🔄
   - N8N có Mattermost node sẵn có
   - Dễ dàng gửi notifications
   - Rich message formatting

---

## 🏗️ Kiến Trúc Tích Hợp

### **System Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│              OrientClassicsManager System                    │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Frontend   │      │   Backend    │                    │
│  │   (React)    │──────│  (Express/   │                    │
│  │              │      │   Django)    │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                                │                            │
│                                ↓                            │
│  ┌──────────────────────────────────────────┐             │
│  │         N8N Workflows                      │             │
│  │  - Task Reminders                          │             │
│  │  - Contract Approvals                      │             │
│  │  - Payment Notifications                   │             │
│  │  - Status Changes                          │             │
│  └──────────────┬─────────────────────────────┘             │
│                 │                                            │
│                 ↓                                            │
│  ┌──────────────────────────────────────────┐             │
│  │         Mattermost Server                 │             │
│  │  - Team Channels                          │             │
│  │  - Direct Messages                        │             │
│  │  - Notifications                           │             │
│  └──────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Integration Flow:**

```
1. Event Trigger (Task due, Contract approved, etc.)
   ↓
2. N8N Workflow Execution
   ↓
3. Format Mattermost Message
   ↓
4. Send to Mattermost Channel/User
   ↓
5. Team receives notification
```

---

## 🔄 Ứng Dụng trong Dự Án

### **1. Task Management Notifications** ⭐⭐

**Use Cases:**

- **Task Due Reminders** - Nhắc nhở task sắp đến hạn
- **Task Assignment** - Thông báo khi được gán task mới
- **Task Completion** - Thông báo khi task hoàn thành
- **Task Status Changes** - Cập nhật khi status thay đổi

**Channels:**

- `#tasks-general` - General task notifications
- `#tasks-urgent` - Urgent tasks only
- `#tasks-bien-tap` - Biên tập tasks
- `#tasks-hanh-chinh` - Hành chính tasks

---

### **2. Contract Management Notifications** ⭐⭐

**Use Cases:**

- **Contract Approval Requests** - Yêu cầu phê duyệt hợp đồng
- **Contract Status Changes** - Thay đổi trạng thái hợp đồng
- **Payment Milestones** - Nhắc nhở payment milestones
- **Contract Expiry** - Cảnh báo hợp đồng sắp hết hạn

**Channels:**

- `#contracts-approvals` - Approval requests
- `#contracts-payments` - Payment notifications
- `#contracts-expiry` - Expiry reminders

---

### **3. Workflow Notifications** ⭐

**Use Cases:**

- **Approval Workflows** - Multi-level approval notifications
- **Review Requests** - Thẩm định requests
- **Document Generation** - Thông báo khi document được generate
- **System Alerts** - System errors, warnings

**Channels:**

- `#workflows-approvals` - Approval workflows
- `#workflows-reviews` - Review workflows
- `#system-alerts` - System notifications

---

### **4. Team Collaboration** ⭐

**Use Cases:**

- **Project Discussions** - Thảo luận về dự án
- **Daily Standups** - Daily updates
- **File Sharing** - Chia sẻ documents
- **Knowledge Base** - Lưu trữ thông tin

**Channels:**

- `#general` - General discussions
- `#project-updates` - Project updates
- `#knowledge-base` - Knowledge sharing

---

## ⚙️ Setup & Configuration

### **Step 1: Install Mattermost**

**Option A: Docker (Recommended)**

```yaml
# docker-compose.mattermost.yml
version: "3.8"

services:
  mattermost:
    image: mattermost/mattermost-team-edition:latest
    container_name: orient-mattermost
    ports:
      - "8065:8065"
    environment:
      - MM_SQLSETTINGS_DRIVERNAME=postgres
      - MM_SQLSETTINGS_DATASOURCE=postgres://mattermost_user:password@postgres:5432/mattermost?sslmode=disable&connect_timeout=10
      - MM_SERVICESETTINGS_SITEURL=http://localhost:8065
    volumes:
      - mattermost-data:/mattermost/data
      - mattermost-config:/mattermost/config
    depends_on:
      - postgres
    networks:
      - orient-network

  postgres:
    image: postgres:15-alpine
    container_name: orient-mattermost-db
    environment:
      - POSTGRES_USER=mattermost_user
      - POSTGRES_PASSWORD=mattermost_password
      - POSTGRES_DB=mattermost
    volumes:
      - mattermost-db:/var/lib/postgresql/data
    networks:
      - orient-network

volumes:
  mattermost-data:
  mattermost-config:
  mattermost-db:

networks:
  orient-network:
    external: true
```

**Start Mattermost:**

```powershell
docker-compose -f docker-compose.mattermost.yml up -d
```

**Access Mattermost:**

- URL: http://localhost:8065
- Create admin account on first access

---

### **Step 2: Create Channels**

**Recommended Channels:**

1. **General Channels:**

   - `#general` - General discussions
   - `#announcements` - Important announcements
   - `#random` - Casual conversations

2. **Task Management:**

   - `#tasks-general` - General task notifications
   - `#tasks-urgent` - Urgent tasks
   - `#tasks-bien-tap` - Biên tập tasks
   - `#tasks-hanh-chinh` - Hành chính tasks

3. **Contract Management:**

   - `#contracts-approvals` - Approval requests
   - `#contracts-payments` - Payment notifications
   - `#contracts-expiry` - Expiry reminders

4. **Workflows:**
   - `#workflows-approvals` - Approval workflows
   - `#workflows-reviews` - Review workflows
   - `#system-alerts` - System notifications

---

### **Step 3: Create Incoming Webhooks**

**Mattermost → Integrations → Incoming Webhooks**

1. **Create Webhook cho mỗi channel:**

   - `#tasks-general` → Webhook URL 1
   - `#contracts-approvals` → Webhook URL 2
   - `#system-alerts` → Webhook URL 3

2. **Save Webhook URLs** để dùng trong N8N

**Webhook URL Format:**

```
http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 4: Configure N8N**

**Option A: Mattermost Node (Recommended)**

1. **Add Mattermost Credential:**

   - Go to N8N → Credentials
   - Add "Mattermost" credential
   - Enter:
     - **URL**: http://localhost:8065
     - **Access Token**: (from Mattermost → Account Settings → Security → Personal Access Tokens)

2. **Use Mattermost Node:**
   - Add "Mattermost" node to workflow
   - Select credential
   - Choose operation (Post Message, etc.)

**Option B: HTTP Request Node (Webhook)**

1. **Add HTTP Request Node:**
   - Method: POST
   - URL: Mattermost webhook URL
   - Body: JSON message

---

## 📊 Use Cases Cụ Thể

### **Use Case 1: Task Due Reminder** ⭐⭐

**Workflow:**

```
1. Cron Trigger (Daily 9 AM)
   ↓
2. Get Tasks Due Soon (Database View)
   ↓
3. Format Mattermost Message
   ↓
4. Send to #tasks-general channel
```

**Mattermost Message Format:**

```json
{
  "text": "📋 **Task Reminder**",
  "attachments": [
    {
      "color": "#FF6B6B",
      "title": "Tasks Due Today",
      "fields": [
        {
          "short": true,
          "title": "Task",
          "value": "Review contract #123"
        },
        {
          "short": true,
          "title": "Assignee",
          "value": "@john.doe"
        },
        {
          "short": true,
          "title": "Due Date",
          "value": "Today"
        }
      ]
    }
  ]
}
```

**N8N Node Configuration:**

```javascript
// Mattermost Node
{
  "operation": "postMessage",
  "channel": "#tasks-general",
  "text": "📋 **Task Reminder**",
  "attachments": [
    {
      "color": "#FF6B6B",
      "title": "Tasks Due Today",
      "fields": [
        {
          "short": true,
          "title": "Task",
          "value": "{{ $json.task_title }}"
        },
        {
          "short": true,
          "title": "Assignee",
          "value": "@{{ $json.assignee_username }}"
        }
      ]
    }
  ]
}
```

---

### **Use Case 2: Contract Approval Request** ⭐⭐

**Workflow:**

```
1. Webhook: Contract Submitted
   ↓
2. Get Contract Details
   ↓
3. Format Approval Message
   ↓
4. Send to #contracts-approvals channel
   ↓
5. Mention approver
```

**Mattermost Message:**

```json
{
  "text": "📄 **Contract Approval Required**",
  "attachments": [
    {
      "color": "#4ECDC4",
      "title": "Contract #HD-2024-001",
      "text": "A new contract requires your approval",
      "fields": [
        {
          "short": true,
          "title": "Contract Number",
          "value": "HD-2024-001"
        },
        {
          "short": true,
          "title": "Amount",
          "value": "10,000,000 VND"
        },
        {
          "short": true,
          "title": "Approver",
          "value": "@manager"
        }
      ],
      "actions": [
        {
          "name": "Approve",
          "integration": {
            "url": "http://localhost:5678/webhook/contract-approval-decision",
            "context": {
              "token": "xxx",
              "decision": "approved"
            }
          }
        },
        {
          "name": "Reject",
          "integration": {
            "url": "http://localhost:5678/webhook/contract-approval-decision",
            "context": {
              "token": "xxx",
              "decision": "rejected"
            }
          }
        }
      ]
    }
  ]
}
```

---

### **Use Case 3: Payment Milestone Reminder** ⭐

**Workflow:**

```
1. Cron Trigger (Daily 8 AM)
   ↓
2. Get Upcoming Payments
   ↓
3. Format Payment Reminder
   ↓
4. Send to #contracts-payments channel
```

**Mattermost Message:**

```json
{
  "text": "💰 **Payment Milestone Reminder**",
  "attachments": [
    {
      "color": "#FFD93D",
      "title": "Payment Due in 7 Days",
      "fields": [
        {
          "short": true,
          "title": "Contract",
          "value": "HD-2024-001"
        },
        {
          "short": true,
          "title": "Amount",
          "value": "5,000,000 VND"
        },
        {
          "short": true,
          "title": "Due Date",
          "value": "2024-12-05"
        }
      ]
    }
  ]
}
```

---

## 🔧 Technical Implementation

### **1. N8N Mattermost Node**

**Setup Credential:**

```javascript
// N8N Mattermost Credential
{
  "name": "Mattermost Connection",
  "type": "mattermostApi",
  "data": {
    "url": "http://localhost:8065",
    "accessToken": "your-access-token"
  }
}
```

**Node Configuration:**

```javascript
// Mattermost Node
{
  "operation": "postMessage",
  "channel": "#tasks-general",
  "text": "{{ $json.message }}",
  "attachments": "{{ $json.attachments }}"
}
```

---

### **2. HTTP Request Node (Webhook)**

**Alternative approach nếu không có Mattermost node:**

```javascript
// HTTP Request Node
{
  "method": "POST",
  "url": "http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "body": {
    "text": "{{ $json.message }}",
    "attachments": "{{ $json.attachments }}"
  },
  "headers": {
    "Content-Type": "application/json"
  }
}
```

---

### **3. Code Node để Format Message**

```javascript
// Format Mattermost Message
const task = $json;

return {
  json: {
    text: `📋 **Task Reminder: ${task.title}**`,
    attachments: [
      {
        color: task.urgency === "high" ? "#FF6B6B" : "#4ECDC4",
        title: task.title,
        text: task.description || "",
        fields: [
          {
            short: true,
            title: "Assignee",
            value: `@${task.assignee_username}`,
          },
          {
            short: true,
            title: "Due Date",
            value: task.due_date,
          },
          {
            short: true,
            title: "Priority",
            value: task.priority,
          },
          {
            short: true,
            title: "Status",
            value: task.status,
          },
        ],
        footer: "OrientClassicsManager",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  },
};
```

---

### **4. Integration với Existing Workflows**

**Update Workflow 2: Task Due Date Reminder**

```javascript
// Add Mattermost notification after email
1. Cron Trigger
   ↓
2. Get Tasks Due Soon
   ↓
3. Send Email (existing)
   ↓
4. Format Mattermost Message (NEW)
   ↓
5. Send to Mattermost (NEW)
   ↓
6. Log Execution
```

**Update Workflow 5: Contract Approval**

```javascript
// Add Mattermost notification
1. Webhook: Contract Submitted
   ↓
2. Get Contract Details
   ↓
3. Send Approval Email (existing)
   ↓
4. Send Mattermost Notification (NEW)
   ↓
5. Log Execution
```

---

## 📈 Benefits Summary

### **Immediate Benefits:**

1. **Real-time Notifications** ⚡

   - Instant alerts
   - No email delays
   - Mobile push notifications

2. **Team Awareness** 👥

   - Everyone sees updates
   - Centralized communication
   - Better collaboration

3. **Reduced Email Overload** 📧

   - Less email clutter
   - Channel-based organization
   - Searchable history

4. **Integration với N8N** 🔄
   - Easy to implement
   - Rich message formatting
   - Interactive buttons

### **Long-term Benefits:**

1. **Better Team Collaboration** 🤝

   - Centralized communication
   - Knowledge sharing
   - Project discussions

2. **Audit Trail** 📝

   - All notifications logged
   - Searchable history
   - Compliance ready

3. **Scalability** 📈
   - Easy to add new channels
   - Flexible notification rules
   - Custom integrations

---

## 🚀 Next Steps

### **Phase 1: Setup (Week 1)**

- [ ] Install Mattermost (Docker)
- [ ] Create admin account
- [ ] Create channels
- [ ] Setup webhooks
- [ ] Test basic notifications

### **Phase 2: Integration (Week 2)**

- [ ] Configure N8N Mattermost node
- [ ] Update Task Due Reminder workflow
- [ ] Update Contract Approval workflow
- [ ] Test end-to-end

### **Phase 3: Expansion (Week 3-4)**

- [ ] Add more workflows
- [ ] Create custom message templates
- [ ] Setup user notifications
- [ ] Team training

---

## 📚 Related Documents

- [N8N Workflow Suggestions](../N8N/WORKFLOW_SUGGESTIONS.md) - Workflow proposals
- [N8N Setup Guide](../N8N/COMPLETE_SETUP_GUIDE.md) - N8N setup
- [Architecture Decisions](../N8N/ARCHITECTURE_DECISIONS.md) - Architecture

---

## 🔗 Resources

- [Mattermost Documentation](https://docs.mattermost.com/)
- [Mattermost Docker Setup](https://docs.mattermost.com/install/docker-local-machine.html)
- [N8N Mattermost Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mattermost/)
- [Mattermost Incoming Webhooks](https://docs.mattermost.com/developer/webhooks-incoming.html)

---

_This document should be updated as Mattermost integration is implemented and refined._
