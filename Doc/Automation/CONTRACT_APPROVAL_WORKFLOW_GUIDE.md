# 📄 Contract Approval Workflow - Complete Guide

> **Hướng dẫn hoàn chỉnh** cho workflow phê duyệt hợp đồng multi-level với notifications đa nền tảng

**Last Updated:** 2024-11-29  
**Status:** ✅ Ready for Implementation

---

## 📋 Tổng Quan

Workflow này tự động hóa quy trình phê duyệt hợp đồng từ **draft** đến **approved** với:
- ✅ **Multi-level approval** - Nhiều cấp phê duyệt động
- ✅ **Multi-platform notifications** - Email, Mattermost, Zalo (optional)
- ✅ **Database abstraction** - Sử dụng views và functions
- ✅ **Comprehensive logging** - Log mọi bước
- ✅ **Token-based security** - Bảo mật với approval tokens

---

## 🔄 Workflow Flow

```
1. Contract Submitted (Webhook)
   ↓
2. Validate Contract ID
   ↓
3. Get Contract Details (v_contracts_for_approval)
   ↓
4. Get Workflow Levels (workflow_levels)
   ↓
5. Create Approval Workflow (submit_contract_for_approval function)
   ↓
6. Get Current Level Approver (get_approver_for_level function)
   ↓
7. Generate & Save Approval Token
   ↓
8. Send Notifications (Email + Mattermost + Zalo)
   ↓
9. Wait for Decision (Webhook)
   ↓
10. Process Decision (process_approval_decision function)
    ↓
11. If Approved:
    ├─ Has Next Level?
    │  ├─ YES → Update Step → Get Next Approver → Generate Token → Send Notifications
    │  └─ NO → Final Approval → Update Contract → Send Success Notifications
    └─ If Rejected:
       └─ Update Contract Rejected → Send Rejection Notifications
```

---

## 🚀 Setup & Configuration

### **Step 1: Import Workflow**

1. **N8N → Workflows → Import from File**
2. **Select:** `n8n-workflows/contract-approval-complete-multiplatform.json`
3. **Review workflow structure**
4. **Update credentials** (Mattermost, Email, Database)

### **Step 2: Configure Credentials**

#### **A. Mattermost Credential:**
- **Name:** Mattermost Connection
- **Base URL:** `http://orient-mattermost:8065` ⚠️
- **Access Token:** (Mattermost Personal Access Token)
- **Ignore SSL Issues:** ON

#### **B. Email Credential:**
- **SMTP Host:** smtp.gmail.com (or your SMTP)
- **SMTP Port:** 587
- **User:** your-email@gmail.com
- **Password:** (App password)

#### **C. Database Credential:**
- **Host:** localhost (or database host)
- **Port:** 5432
- **Database:** translation_db
- **User:** n8n_user (or postgres)
- **Password:** (database password)

#### **D. Zalo (Optional):**
- **Set N8N Variable:** `ZALO_ACCESS_TOKEN`
- **Configure Zalo API credentials**
- **Map users to Zalo IDs** (if needed)

### **Step 3: Activate Workflow**

1. **Click "Active" toggle** in N8N
2. **Workflow is now listening** for webhooks

---

## 📡 API Endpoints

### **1. Submit Contract for Approval**

**Endpoint:** `POST http://localhost:5678/webhook/contract-submit-for-approval`

**Request Body:**
```json
{
  "contract_id": 123
}
```

**Or:**
```json
{
  "contract_id": "HD-2024-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contract approval workflow started",
  "contract_id": 123,
  "contract_number": "HD-2024-001",
  "workflow_id": "uuid-here",
  "current_level": 1,
  "approver": "Manager Name",
  "notifications_sent": {
    "email": true,
    "mattermost": true,
    "zalo": "optional"
  },
  "approval_url": "http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved"
}
```

### **2. Process Approval Decision**

**Endpoint:** `GET http://localhost:5678/webhook/contract-approval-decision`

**Query Parameters:**
- `token` - Approval token (required)
- `decision` - "approved" or "rejected" (required)

**Example:**
```
http://localhost:5678/webhook/contract-approval-decision?token=token_123&decision=approved
```

**Response:**
```json
{
  "success": true,
  "message": "Contract approval decision processed",
  "decision": "approved",
  "contract_id": 123,
  "workflow_id": "uuid-here"
}
```

---

## 🔔 Notification Channels

### **1. Email Notifications**

**Sent to:**
- Approver at each level
- Creator when approved/rejected

**Content:**
- Contract details
- Approval level information
- Approve/Reject buttons (links)
- Expiry information

**Template:** HTML formatted with styling

### **2. Mattermost Notifications**

**Channel:** `#contracts-approvals`

**Content:**
- Rich message with attachments
- Contract details in fields
- Interactive buttons (Approve/Reject)
- Color-coded by status

**Format:**
```json
{
  "text": "📄 **Contract Approval Required**",
  "channel": "#contracts-approvals",
  "attachments": [
    {
      "color": "#4ECDC4",
      "title": "Contract HD-2024-001",
      "fields": [...],
      "actions": [...]
    }
  ]
}
```

### **3. Zalo Notifications (Optional)**

**Configuration:**
- Requires Zalo Official Account API
- Set `ZALO_ACCESS_TOKEN` in N8N variables
- Map users to Zalo user IDs

**Format:**
- Text message with contract details
- Links to approval URLs

**Note:** Zalo integration is optional. Workflow continues even if Zalo fails.

---

## 🗄️ Database Integration

### **Views Used:**

1. **`v_contracts_for_approval`**
   - Get contract with approval info
   - Abstracts table structure

2. **`v_workflow_next_level`**
   - Get next level information
   - Check if has next level

### **Functions Used:**

1. **`submit_contract_for_approval(contract_id, created_by_id)`**
   - Creates approval workflow
   - Returns workflow data

2. **`get_approver_for_level(document_type, level_number)`**
   - Gets approver for specific level
   - Returns user information

3. **`process_approval_decision(token, decision)`**
   - Processes approval/rejection
   - Updates workflow status
   - Returns workflow data

4. **`create_approval_token(workflow_id, approver_id, step_number, token, expiry_date)`**
   - Creates approval token
   - Returns token ID

5. **`log_workflow_execution(...)`**
   - Logs workflow execution
   - For debugging and audit

---

## 📊 Workflow Levels

### **Default Levels (from `workflow_levels` table):**

1. **Level 1: Manager Approval**
   - Role: `truong_ban_thu_ky`
   - Timeout: 48 hours
   - Required: Yes

2. **Level 2: Director Approval**
   - Role: `pho_chu_nhiem`
   - Timeout: 72 hours
   - Required: Yes

3. **Level 3: CEO Approval**
   - Role: `chu_nhiem`
   - Timeout: 96 hours
   - Required: No (optional)

### **Customize Levels:**

```sql
-- Add new level
INSERT INTO workflow_levels (document_type, level_number, level_name, role_id, timeout_hours, is_required)
VALUES ('contract', 4, 'Board Approval', 'board_member', 120, FALSE);

-- Update existing level
UPDATE workflow_levels 
SET timeout_hours = 24 
WHERE document_type = 'contract' AND level_number = 1;
```

---

## 🧪 Testing

### **Test 1: Submit Contract**

```powershell
$body = @{
    contract_id = 123
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/contract-submit-for-approval" `
  -Method Post -Body $body -ContentType "application/json"
```

**Expected:**
- ✅ Workflow created
- ✅ Token generated
- ✅ Notifications sent (Email, Mattermost)
- ✅ Response with approval URL

### **Test 2: Approve Contract**

```powershell
# Use approval URL from Test 1
$approvalUrl = "http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved"
Invoke-RestMethod -Uri $approvalUrl -Method Get
```

**Expected:**
- ✅ Decision processed
- ✅ If has next level: Next level notification sent
- ✅ If final level: Contract approved, success notifications sent

### **Test 3: Reject Contract**

```powershell
$rejectUrl = "http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=rejected"
Invoke-RestMethod -Uri $rejectUrl -Method Get
```

**Expected:**
- ✅ Contract status = 'rejected'
- ✅ Workflow status = 'rejected'
- ✅ Rejection notifications sent

---

## 📝 Logging

### **Check Workflow Logs:**

```sql
-- View all logs for a workflow
SELECT * FROM n8n_workflow_logs 
WHERE workflow_name = 'Contract Approval Multi-Level'
ORDER BY created_at DESC;

-- View logs for specific execution
SELECT * FROM n8n_workflow_logs 
WHERE execution_id = 'exec_xxx'
ORDER BY created_at ASC;

-- View errors only
SELECT * FROM n8n_workflow_logs 
WHERE status = 'error'
ORDER BY created_at DESC;
```

### **Check Approval History:**

```sql
-- View approval history for contract
SELECT * FROM approval_history 
WHERE document_type = 'contract' 
AND document_id = 123
ORDER BY created_at ASC;
```

---

## 🔧 Troubleshooting

### **Issue: Contract Not Found**

**Error:** `Contract with ID xxx not found`

**Solutions:**
1. Verify contract exists: `SELECT * FROM translation_contracts WHERE id = 123;`
2. Check contract_number if using string ID
3. Verify database connection

### **Issue: No Approver Found**

**Error:** `No approver found for level X`

**Solutions:**
1. Check workflow_levels: `SELECT * FROM workflow_levels WHERE document_type = 'contract';`
2. Verify users with role: `SELECT * FROM users WHERE role = 'truong_ban_thu_ky';`
3. Ensure at least one user has the required role

### **Issue: Notifications Not Sent**

**Error:** Email/Mattermost/Zalo failed

**Solutions:**
1. **Email:**
   - Check SMTP credentials
   - Verify email address format
   - Check spam folder

2. **Mattermost:**
   - Verify credential configuration
   - Check Base URL: `http://orient-mattermost:8065` (not localhost)
   - Test connection in N8N

3. **Zalo:**
   - Verify ZALO_ACCESS_TOKEN variable
   - Check Zalo API configuration
   - Note: Zalo is optional, workflow continues if fails

### **Issue: Token Invalid**

**Error:** `Token not found or expired`

**Solutions:**
1. Check token exists: `SELECT * FROM approval_tokens WHERE token = 'xxx';`
2. Verify token not expired: `SELECT * FROM approval_tokens WHERE expiry_date > NOW();`
3. Check token not already used: `SELECT * FROM approval_tokens WHERE used_at IS NULL;`

---

## 📈 Monitoring

### **Key Metrics to Track:**

1. **Workflow Execution Time**
   ```sql
   SELECT 
     AVG(execution_time_ms) as avg_time,
     MAX(execution_time_ms) as max_time
   FROM n8n_workflow_logs 
   WHERE workflow_name = 'Contract Approval Multi-Level';
   ```

2. **Success Rate**
   ```sql
   SELECT 
     status,
     COUNT(*) as count,
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM n8n_workflow_logs 
   WHERE workflow_name = 'Contract Approval Multi-Level'
   GROUP BY status;
   ```

3. **Approval Statistics**
   ```sql
   SELECT 
     status,
     COUNT(*) as count
   FROM approval_workflows 
   WHERE document_type = 'contract'
   GROUP BY status;
   ```

---

## 🎯 Best Practices

1. **Always use database abstraction layer**
   - ✅ Use views (`v_contracts_for_approval`)
   - ✅ Use functions (`submit_contract_for_approval`)
   - ❌ Don't query tables directly

2. **Enable error handling**
   - Set `continueOnFail: true` for external services
   - Log all errors
   - Send alerts for critical failures

3. **Test thoroughly**
   - Test with different contract IDs
   - Test approval and rejection paths
   - Test multi-level progression
   - Test notification delivery

4. **Monitor regularly**
   - Check logs daily
   - Review failed executions
   - Monitor notification delivery rates

---

## 📚 Related Documents

- **[PHASE1_FOUNDATION_GUIDE.md](./PHASE1_FOUNDATION_GUIDE.md)** - Database setup
- **[COMPREHENSIVE_AUTOMATION_STRATEGY.md](./COMPREHENSIVE_AUTOMATION_STRATEGY.md)** - Full strategy
- **[MATTERMOST_INTEGRATION.md](../Integration/MATTERMOST_INTEGRATION.md)** - Mattermost guide
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup status

---

## ✅ Checklist

- [ ] Database abstraction layer setup
- [ ] Workflow levels configured
- [ ] N8N workflow imported
- [ ] Credentials configured (Mattermost, Email, Database)
- [ ] Zalo configured (optional)
- [ ] Workflow activated
- [ ] Test submission successful
- [ ] Test approval successful
- [ ] Test rejection successful
- [ ] Notifications working (Email, Mattermost)
- [ ] Logging working
- [ ] Monitoring setup

---

**✨ Workflow is ready for production use!**

