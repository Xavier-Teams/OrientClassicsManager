# ⚡ Quick Setup Guide - Mattermost + N8N Integration

> **Hướng dẫn nhanh** để setup Mattermost và tích hợp với N8N trong 30 phút

**Last Updated:** 2024-11-29  
**Status:** ✅ Ready to Use

---

## 🎯 Mục Tiêu

Trong 30 phút, bạn sẽ có:
- ✅ Mattermost running
- ✅ Channels created
- ✅ Webhooks configured
- ✅ N8N integrated
- ✅ Test workflow working

---

## 📋 Step-by-Step Guide

### **Step 1: Create Admin Account (5 phút)**

1. **Open Mattermost:**
   ```
   http://localhost:8065
   ```

2. **Create Account:**
   - Enter email
   - Enter username (e.g., `admin`)
   - Enter password
   - Click "Create Account"
   - ✅ First user automatically becomes admin

---

### **Step 2: Create Channels (10 phút)**

#### **Option A: Manual Creation (Recommended for first time)**

1. **In Mattermost, click "+" next to "Channels"**

2. **Create each channel:**
   - Click "Create new channel"
   - Enter channel name (e.g., `tasks-general`)
   - Set purpose (optional)
   - Click "Create"

3. **Channels to create:**
   ```
   #tasks-general
   #tasks-urgent
   #contracts-approvals
   #contracts-payments
   #system-alerts
   ```

#### **Option B: Using Script (If you have Access Token)**

```powershell
# Get token from Mattermost → Account Settings → Security → Personal Access Tokens
.\scripts\setup_mattermost_channels.ps1 -AccessToken "your-token-here"
```

---

### **Step 3: Create Webhooks (10 phút)**

1. **Mattermost → Menu (☰) → Integrations → Incoming Webhooks**

2. **For each channel, create webhook:**
   - Click "Add Incoming Webhook"
   - Select channel (e.g., `#tasks-general`)
   - Click "Save"
   - **Copy Webhook URL** (sẽ dùng sau)

3. **Save webhook URLs:**
   ```
   #tasks-general: http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx
   #contracts-approvals: http://localhost:8065/hooks/yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   #system-alerts: http://localhost:8065/hooks/zzzzzzzzzzzzzzzzzzzzzzzzzzzz
   ```

---

### **Step 4: Configure N8N (5 phút)**

#### **4.1. Get Mattermost Access Token**

1. **Mattermost → Your Profile → Account Settings → Security**
2. **Personal Access Tokens → Create Token**
3. **Enter description:** "N8N Integration"
4. **Click "Generate Token"**
5. **Copy token** (chỉ hiện 1 lần!)

#### **4.2. Add Mattermost Credential in N8N**

1. **N8N → http://localhost:5678**
2. **Credentials → Add Credential**
3. **Search "Mattermost"**
4. **Configure:**
   - **Name:** Mattermost Connection
   - **URL:** http://localhost:8065
   - **Access Token:** (paste token từ step 4.1)
5. **Test Connection → Save**

---

### **Step 5: Test Integration (5 phút)**

#### **Option A: Import Test Workflow**

1. **N8N → Workflows → Import from File**
2. **Select:** `n8n-workflows/mattermost-test-workflow.json`
3. **Update credential:**
   - Click "Send to Mattermost" node
   - Select "Mattermost Connection" credential
4. **Activate workflow**
5. **Test:**
   ```powershell
   # Send test request
   $body = @{ channel = "#tasks-general" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/mattermost-test" -Method Post -Body $body -ContentType "application/json"
   ```
6. **Verify:** Check Mattermost channel `#tasks-general`

#### **Option B: Create Simple Test Workflow**

1. **N8N → New Workflow**
2. **Add "Mattermost" node**
3. **Configure:**
   - Credential: Mattermost Connection
   - Operation: Post Message
   - Channel: #tasks-general
   - Message: Test from N8N
4. **Execute workflow**
5. **Verify in Mattermost**

---

## ✅ Verification Checklist

- [ ] Mattermost accessible at http://localhost:8065
- [ ] Admin account created
- [ ] At least 3 channels created
- [ ] Webhooks created for each channel
- [ ] Webhook URLs saved
- [ ] Mattermost access token created
- [ ] N8N credential configured
- [ ] Test workflow executed successfully
- [ ] Message appears in Mattermost

---

## 🚀 Next Steps

### **Immediate:**

1. **Import Workflows:**
   - `mattermost-test-workflow.json` - Test workflow
   - `task-due-reminder-mattermost.json` - Task reminder workflow

2. **Update Existing Workflows:**
   - Add Mattermost notifications to contract approval workflow
   - Add Mattermost to task status change workflow

### **This Week:**

1. **Implement Priority 1 Workflows:**
   - Task Due Reminder (with Mattermost)
   - Contract Expiry Reminder (with Mattermost)

2. **Test End-to-End:**
   - Test with real data
   - Verify notifications
   - Check logs

---

## 🔧 Troubleshooting

### **Mattermost not accessible:**

```powershell
# Check container
docker ps --filter name=orient-mattermost

# Check logs
docker logs orient-mattermost --tail 50

# Restart if needed
docker-compose -f docker-compose.mattermost.yml restart
```

### **N8N cannot connect to Mattermost:**

1. **Verify Mattermost URL:** http://localhost:8065
2. **Check access token:** Valid and not expired
3. **Test API:**
   ```powershell
   curl http://localhost:8065/api/v4/system/ping
   ```

### **Webhook not working:**

1. **Verify webhook URL:** Correct format
2. **Check channel exists:** In Mattermost
3. **Test webhook:**
   ```powershell
   .\scripts\test_mattermost_webhook.ps1 -WebhookUrl "http://localhost:8065/hooks/xxx" -Channel "#tasks-general"
   ```

---

## 📚 Related Documents

- **Integration Guide:** `Doc/Integration/MATTERMOST_INTEGRATION.md`
- **Automation Strategy:** `Doc/Automation/COMPREHENSIVE_AUTOMATION_STRATEGY.md`
- **Implementation Plan:** `Doc/Automation/IMPLEMENTATION_PLAN.md`

---

## 💡 Tips

1. **Save webhook URLs** in a secure file
2. **Test frequently** during setup
3. **Use test workflow** to verify integration
4. **Check Mattermost logs** if issues occur
5. **Start with one channel** before creating all

---

**✨ Ready! Start with Step 1 to create your admin account.**

