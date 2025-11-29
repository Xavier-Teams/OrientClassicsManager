# 🏗️ Phase 1: Foundation Setup Guide

> **Hướng dẫn chi tiết** để setup Phase 1: Foundation cho hệ thống automation

**Last Updated:** 2024-11-29  
**Status:** 📋 Setup Guide

---

## 📋 Tổng Quan

Phase 1 tập trung vào việc setup infrastructure cơ bản:

- ✅ Mattermost (Docker) - Đã hoàn thành
- ✅ Database abstraction layer (Views, Functions, Logging)
- ✅ Mattermost channels và webhooks
- ✅ N8N credential configuration

---

## ✅ Checklist

### **Infrastructure:**

- [x] Mattermost running (Docker)
- [x] N8N running (Docker)
- [x] Network `orient-network` created
- [ ] Database abstraction layer setup
- [ ] Logging table created
- [ ] Mattermost channels created
- [ ] Webhooks created và URLs saved
- [ ] N8N Mattermost credential configured

---

## 🔧 Step-by-Step Setup

### **Step 1: Verify Infrastructure**

```powershell
# Check containers
docker ps --filter name=orient

# Check Mattermost
curl http://localhost:8065/api/v4/system/ping

# Check N8N
curl http://localhost:5678/healthz
```

**Expected:**

- Mattermost: `{"status":"OK"}`
- N8N: HTTP 200

---

### **Step 2: Setup Database Abstraction Layer**

#### **Option A: Using pgAdmin (Recommended)**

1. **Open pgAdmin**
2. **Connect to database:** `translation_db`
3. **Open Query Tool**
4. **Open file:** `scripts/setup_n8n_abstraction_layer.sql`
5. **Execute script**

#### **Option B: Using psql**

```powershell
psql -h localhost -p 5432 -U postgres -d translation_db -f scripts\setup_n8n_abstraction_layer.sql
```

#### **What this script creates:**

**Views:**

- `v_contracts_for_approval` - Contracts với approval info
- `v_approval_workflows_detail` - Workflows với level info
- `v_approval_tokens_detail` - Tokens với full context
- `v_workflow_next_level` - Next level info

**Functions:**

- `submit_contract_for_approval()` - Submit contract for approval
- `get_approver_for_level()` - Get approver for level
- `process_approval_decision()` - Process approval decision
- `log_workflow_execution()` - Log workflow execution

**Tables:**

- `n8n_workflow_logs` - Audit logging table

#### **Verify Setup:**

```sql
-- Check views
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'v_%';

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%approval%' OR routine_name LIKE '%workflow%';

-- Check logging table
SELECT * FROM information_schema.tables
WHERE table_name = 'n8n_workflow_logs';
```

---

### **Step 3: Setup Mattermost Channels**

#### **Option A: Manual Setup**

1. **Open Mattermost:** http://localhost:8065
2. **Login** với admin account
3. **Create channels:**
   - Click "+" next to "Channels"
   - Create each channel:
     - `#tasks-general`
     - `#tasks-urgent`
     - `#tasks-bien-tap`
     - `#tasks-hanh-chinh`
     - `#contracts-approvals`
     - `#contracts-payments`
     - `#contracts-expiry`
     - `#system-alerts`
     - `#workflows-approvals`
     - `#general`
     - `#announcements`

#### **Option B: Using Script**

```powershell
# Get Mattermost access token first
# Mattermost → Account Settings → Security → Personal Access Tokens

.\scripts\setup_mattermost_channels.ps1 -AccessToken "your-token"
```

---

### **Step 4: Create Webhooks**

**For each channel:**

1. **Mattermost → Menu (☰) → Integrations → Incoming Webhooks**
2. **Click "Add Incoming Webhook"**
3. **Select channel** (e.g., `#tasks-general`)
4. **Click "Save"**
5. **Copy Webhook URL** (chỉ hiện 1 lần!)
6. **Save URL** vào file hoặc notes

**Webhook URLs format:**

```
http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save mapping:**

```
#tasks-general: http://localhost:8065/hooks/xxx
#contracts-approvals: http://localhost:8065/hooks/yyy
#system-alerts: http://localhost:8065/hooks/zzz
```

---

### **Step 5: Configure N8N Mattermost Credential**

1. **Open N8N:** http://localhost:5678
2. **Credentials → Add Credential**
3. **Search "Mattermost"**
4. **Configure:**
   - **Name:** Mattermost Connection
   - **Base URL:** `http://orient-mattermost:8065` ⚠️ (tên container, không phải localhost)
   - **Access Token:** (Mattermost Personal Access Token)
   - **Ignore SSL Issues:** ON
5. **Test Connection** → Should succeed ✅
6. **Save**

---

### **Step 6: Verify Setup**

```powershell
# Run verification script
.\scripts\verify_phase1_setup.ps1
```

**Or run master setup script:**

```powershell
.\scripts\setup_phase1_foundation.ps1
```

---

## 🧪 Testing

### **Test Mattermost Connection:**

1. **N8N → Credentials → Mattermost Connection**
2. **Click "Test Connection"**
3. **Should see:** ✅ Success

### **Test Webhook:**

```powershell
.\scripts\test_mattermost_webhook.ps1 `
  -WebhookUrl "http://localhost:8065/hooks/YOUR_WEBHOOK_ID" `
  -Channel "#tasks-general" `
  -Message "Test from OrientClassicsManager"
```

**Expected:**

- ✅ Message appears in Mattermost channel

### **Test Database Views:**

```sql
-- Test view
SELECT * FROM v_contracts_for_approval LIMIT 1;

-- Test function
SELECT * FROM get_approver_for_level('contract', 1);
```

---

## 📊 Verification Checklist

### **Database:**

- [ ] Views created (4 views)
- [ ] Functions created (4+ functions)
- [ ] Logging table created
- [ ] Permissions granted to n8n_user

### **Mattermost:**

- [ ] All 11 channels created
- [ ] All webhooks created
- [ ] Webhook URLs saved
- [ ] N8N credential configured
- [ ] Connection test successful

### **N8N:**

- [ ] Mattermost credential created
- [ ] Connection test successful
- [ ] Can use Mattermost node in workflows

---

## 🚨 Troubleshooting

### **Database Issues:**

**Error: Permission denied**

```sql
-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO n8n_user;
```

**Error: View/Function not found**

- Verify script ran successfully
- Check schema: `SELECT * FROM information_schema.views WHERE table_name = 'v_contracts_for_approval';`

### **Mattermost Issues:**

**Error: Connection refused**

- Check Base URL: Use `http://orient-mattermost:8065` (container name)
- Not `http://localhost:8065` (from N8N container)

**Error: 401 Unauthorized**

- Verify Access Token is Mattermost token (not n8n token)
- Generate new token if needed

### **Webhook Issues:**

**Error: 400 Bad Request**

- Verify webhook URL is correct (no "xxx" placeholder)
- Check channel exists
- Try without channel parameter

---

## 📚 Related Documents

- **[COMPREHENSIVE_AUTOMATION_STRATEGY.md](./COMPREHENSIVE_AUTOMATION_STRATEGY.md)** - Full strategy
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup status
- **[MATTERMOST_INTEGRATION.md](../Integration/MATTERMOST_INTEGRATION.md)** - Mattermost guide
- **[FIX_N8N_MATTERMOST_NETWORK.md](./FIX_N8N_MATTERMOST_NETWORK.md)** - Network troubleshooting

---

## 🚀 Next Steps

Sau khi Phase 1 hoàn thành:

1. **Phase 2: Task Management**

   - Workflow 2: Task Due Reminder
   - Workflow 4: Task Status Notifications
   - Mattermost integration

2. **Phase 3: Contract Management**

   - Contract workflows
   - Approval system enhancements

3. **Phase 4: Advanced Workflows**
   - Payment tracking
   - Advanced automation

---

**✨ Follow this guide to complete Phase 1 setup!**
