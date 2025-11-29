# 📋 Mattermost Setup Steps - Quick Guide

> **Hướng dẫn từng bước** để setup Mattermost và tích hợp với N8N

**Last Updated:** 2024-11-29

---

## ✅ Step 1: Create Admin Account (2 phút)

1. **Open:** http://localhost:8065
2. **Create Account:**
   - Email: your-email@example.com
   - Username: admin (or your choice)
   - Password: (choose secure password)
3. **Click "Create Account"**
4. ✅ First user automatically becomes admin

---

## ✅ Step 2: Create Channels (5 phút)

### **In Mattermost:**

1. **Click "+" next to "Channels"**

2. **Create each channel:**
   - Click "Create new channel"
   - Enter name (e.g., `tasks-general`)
   - Click "Create"

### **Required Channels:**

```
#tasks-general
#tasks-urgent
#contracts-approvals
#contracts-payments
#system-alerts
```

---

## ✅ Step 3: Create Webhooks (5 phút)

### **For each channel:**

1. **Mattermost → Menu (☰) → Integrations → Incoming Webhooks**

2. **Add Incoming Webhook:**
   - Click "Add Incoming Webhook"
   - Select channel (e.g., `#tasks-general`)
   - Click "Save"
   - **Copy Webhook URL**

3. **Save URLs:**
   ```
   #tasks-general: http://localhost:8065/hooks/xxx
   #contracts-approvals: http://localhost:8065/hooks/yyy
   #system-alerts: http://localhost:8065/hooks/zzz
   ```

---

## ✅ Step 4: Get Access Token (3 phút)

1. **Mattermost → Your Profile → Account Settings → Security**

2. **Personal Access Tokens:**
   - Click "Create Token"
   - Description: "N8N Integration"
   - Click "Generate Token"
   - **Copy token immediately** (chỉ hiện 1 lần!)

---

## ✅ Step 5: Configure N8N (5 phút)

1. **N8N → http://localhost:5678**

2. **Credentials → Add Credential:**
   - Search "Mattermost"
   - Name: "Mattermost Connection"
   - URL: http://localhost:8065
   - Access Token: (paste token từ Step 4)
   - Test Connection → Save

---

## ✅ Step 6: Test Integration (5 phút)

### **Option A: Import Test Workflow**

1. **N8N → Workflows → Import from File**
2. **Select:** `n8n-workflows/mattermost-test-workflow.json`
3. **Update credential** in "Send to Mattermost" node
4. **Activate workflow**
5. **Test:**
   ```powershell
   $body = @{ channel = "#tasks-general" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/mattermost-test" -Method Post -Body $body -ContentType "application/json"
   ```
6. **Verify:** Check `#tasks-general` channel in Mattermost

### **Option B: Manual Test**

1. **N8N → New Workflow**
2. **Add "Mattermost" node**
3. **Configure:**
   - Credential: Mattermost Connection
   - Operation: Post Message
   - Channel: #tasks-general
   - Message: Test from N8N
4. **Execute**
5. **Verify in Mattermost**

---

## ✅ Step 7: Update Existing Workflows

### **Add Mattermost to Contract Approval Workflow:**

1. **Open:** `contract-approval-multilevel-ready.json` in N8N

2. **After "Send Approval Email Level 1" node:**
   - Add "Mattermost" node
   - Configure:
     - Credential: Mattermost Connection
     - Operation: Post Message
     - Channel: #contracts-approvals
     - Text: Format approval message
     - Attachments: Contract details

3. **Connect:**
   - "Send Approval Email Level 1" → "Send Mattermost Notification"
   - "Send Mattermost Notification" → "Send Confirmation to Creator"

4. **Save and Activate**

---

## ✅ Verification

- [ ] Mattermost accessible
- [ ] Admin account created
- [ ] Channels created
- [ ] Webhooks created
- [ ] Access token saved
- [ ] N8N credential configured
- [ ] Test workflow works
- [ ] Message appears in Mattermost

---

## 🚀 Next: Implement Workflows

1. **Import workflows:**
   - `mattermost-test-workflow.json`
   - `task-due-reminder-mattermost.json`

2. **Update existing:**
   - Add Mattermost to contract approval workflow

3. **Test end-to-end**

---

**✨ Follow these steps to complete the integration!**

