# 🤖 Automation Quick Start - OrientClassicsManager

> **Quick start guide** để bắt đầu với automation system (N8N + Mattermost)

---

## 🚀 Quick Setup (15 phút)

### **Step 1: Setup Mattermost**

```powershell
# Windows
.\scripts\setup_mattermost.ps1

# Linux/Mac
./scripts/setup_mattermost.sh
```

**Access Mattermost:**
- URL: http://localhost:8065
- Create admin account (first user becomes admin)

---

### **Step 2: Create Channels**

Trong Mattermost, tạo các channels:

- `#tasks-general` - General task notifications
- `#contracts-approvals` - Contract approval requests
- `#system-alerts` - System notifications

---

### **Step 3: Setup Webhooks**

1. **Mattermost** → **Integrations** → **Incoming Webhooks**
2. **Add Incoming Webhook** cho mỗi channel
3. **Copy Webhook URLs** để dùng trong N8N

---

### **Step 4: Configure N8N**

1. **N8N** → **Credentials** → **Add Mattermost**
   - URL: http://localhost:8065
   - Access Token: (từ Mattermost)

2. **Test Connection**
   - Create test workflow
   - Send test message
   - Verify in Mattermost

---

## 📋 Next Steps

1. **Review Strategy:**
   - `Doc/Automation/COMPREHENSIVE_AUTOMATION_STRATEGY.md`

2. **Follow Implementation Plan:**
   - `Doc/Automation/IMPLEMENTATION_PLAN.md`

3. **See Workflow Suggestions:**
   - `Doc/N8N/WORKFLOW_SUGGESTIONS.md`

---

## 🔗 Resources

- **Mattermost:** http://localhost:8065
- **N8N:** http://localhost:5678
- **Documentation:** `Doc/Automation/`

---

**Questions?** See `Doc/Automation/README.md` for more details.

