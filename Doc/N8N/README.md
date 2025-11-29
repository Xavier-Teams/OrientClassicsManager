# 📚 N8N Documentation - OrientClassicsManager

> **Tài liệu tổng hợp** về N8N automation và multi-level approval workflow system

## 📋 Mục lục

- [📖 Tài liệu chính](#-tài-liệu-chính)
- [🚀 Quick Start](#-quick-start)
- [📁 Files và Scripts](#-files-và-scripts)
- [🔧 Configuration](#-configuration)
- [🧪 Testing](#-testing)

---

## 📖 Tài liệu chính

### **1. [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** ⭐

**Hướng dẫn setup hoàn chỉnh** - Bắt đầu từ đây!

- ✅ N8N Installation
- ✅ Database Setup
- ✅ Workflow Configuration
- ✅ Testing Guide
- ✅ Troubleshooting

### **2. [QUICK_START_MULTILEVEL.md](./QUICK_START_MULTILEVEL.md)**

**Quick start guide** cho multi-level approval

- Setup database tables
- Import workflow
- Test với contract_id = 3

### **3. [TESTING_GUIDE.md](./TESTING_GUIDE.md)**

**Chi tiết về testing** workflow

- Get contract IDs
- Test webhooks
- Verify results
- Troubleshooting

### **4. [SETUP_APPROVAL_TABLES.md](./SETUP_APPROVAL_TABLES.md)**

**Database schema setup** với đúng data types

- Enum types
- Table creation
- Permissions
- Verification

### **5. [WORKFLOW_SUGGESTIONS.md](./WORKFLOW_SUGGESTIONS.md)** ⭐ NEW

**Đề xuất workflows N8N** cho Task Management và Contract Management

- Task Management workflows (4 workflows)
- Contract Management workflows (5 workflows)
- Nguyên tắc và best practices
- Lộ trình triển khai
- Risk mitigation

### **6. [WORKFLOW_SUGGESTIONS_SUMMARY.md](./WORKFLOW_SUGGESTIONS_SUMMARY.md)** ⭐ NEW

**Tóm tắt đề xuất workflows** - Quick reference

- Tổng quan workflows
- Priority và lợi ích
- Lộ trình triển khai
- Metrics

### **7. [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md)**

**Quyết định kiến trúc** và best practices

- Hybrid Architecture
- Database Abstraction Layer
- Risk Mitigation Strategy
- Coding Standards

### **8. [N8N_VS_API_ANALYSIS.md](./N8N_VS_API_ANALYSIS.md)**

**Phân tích N8N vs API** - Khi nào dùng gì

- Lợi ích và hạn chế
- So sánh kiến trúc
- Khuyến nghị cho dự án

### **9. [RISK_MITIGATION_SUMMARY.md](./RISK_MITIGATION_SUMMARY.md)**

**Tóm tắt giảm thiểu rủi ro** - Quick reference

- Database Coupling
- Debugging Difficulty
- Vendor Lock-in

---

## 🚀 Quick Start

### **Prerequisites:**

- ✅ Docker Desktop running
- ✅ PostgreSQL 18 running
- ✅ Database `translation_db` exists
- ✅ User `n8n_user` created

### **Setup Steps:**

1. **Setup N8N Database** (5 phút)

   ```sql
   -- Run in postgres database
   CREATE DATABASE n8n_database;
   CREATE USER n8n_user WITH PASSWORD 'n8n_secure_password_2024';
   GRANT ALL PRIVILEGES ON DATABASE n8n_database TO n8n_user;
   ```

2. **Setup Approval Tables** (5 phút)

   ```sql
   -- Run in translation_db
   -- File: scripts/setup_approval_tables_fixed.sql
   ```

3. **Start N8N** (1 phút)

   ```powershell
   docker-compose -f docker-compose.n8n.yml up -d
   ```

4. **Import Workflow** (2 phút)

   - Open N8N: http://localhost:5678
   - Import: `n8n-workflows/contract-approval-multilevel-ready.json`
   - Setup credentials
   - Activate workflow

5. **Test** (1 phút)
   ```powershell
   .\scripts\test_contract_approval_webhook.ps1 -ContractId "3"
   ```

**Total Time**: ~15 phút

---

## 📁 Files và Scripts

### **Workflow Files:**

- `n8n-workflows/contract-approval-multilevel-ready.json` ⭐ - Multi-level approval (recommended)
- `n8n-workflows/contract-approval-simple.json` - Simple version
- `n8n-workflows/contract-approval-workflow.json` - Original version

### **Database Scripts:**

- `scripts/setup_approval_tables_fixed.sql` ⭐ - **SỬ DỤNG FILE NÀY** (đã fix data types)
- `scripts/setup_n8n_database_simple.sql` - N8N database setup
- `scripts/setup_n8n_permissions_translation_db.sql` - Permissions setup
- `scripts/get_contract_ids.sql` - Get contract IDs for testing

### **Test Scripts:**

- `scripts/test_contract_approval_webhook.ps1` - Test webhook với contract_id
- `scripts/setup_and_test_contract_3.ps1` - Setup và test với contract_id = 3

### **Configuration Files:**

- `docker-compose.n8n.yml` - N8N Docker configuration
- `.env.n8n` - Environment variables

---

## 🔧 Configuration

### **N8N Access:**

- **URL**: http://localhost:5678
- **Username**: admin
- **Password**: orient2024

### **Database Connections:**

- **N8N Database**: `n8n_database` (PostgreSQL)
- **Business Database**: `translation_db` (PostgreSQL)
- **User**: n8n_user
- **Password**: n8n_secure_password_2024

### **Webhook URLs:**

- **Submit Contract**: `http://localhost:5678/webhook/contract-approval`
- **Approval Decision**: `http://localhost:5678/webhook/contract-approval-decision?token=xxx&decision=approved`

### **Data Types:**

- `users.id`: **BIGINT**
- `translation_contracts.id`: **BIGINT**
- `approval_workflows.id`: **UUID** (internal)
- `approval_workflows.document_id`: **BIGINT**
- All user foreign keys: **BIGINT**

---

## 🧪 Testing

### **Get Contract ID:**

```sql
SELECT id, contract_number, status
FROM translation_contracts
WHERE id = 3
ORDER BY created_at DESC;
```

### **Test Webhook:**

```powershell
.\scripts\test_contract_approval_webhook.ps1 -ContractId "3"
```

### **Verify Results:**

```sql
-- Check approval workflow
SELECT * FROM approval_workflows WHERE document_id = 3;

-- Check approval token
SELECT * FROM approval_tokens
WHERE workflow_id IN (
    SELECT id FROM approval_workflows WHERE document_id = 3
);

-- Check contract status
SELECT id, contract_number, status
FROM translation_contracts WHERE id = 3;
```

---

## ⚠️ Important Notes

### **Data Types:**

- ✅ **ALWAYS** use `scripts/setup_approval_tables_fixed.sql`
- ✅ Foreign keys to `users` must be **BIGINT**
- ✅ Foreign keys to `translation_contracts` must be **BIGINT**

### **Workflow:**

- ✅ Use `contract-approval-multilevel-ready.json` for production
- ✅ All PostgreSQL nodes must use "Translation DB Connection" credential
- ✅ Workflow must be **Activated** before testing

### **Testing:**

- ✅ Contract ID is **BIGINT** (integer), not UUID
- ✅ Test with contract_id = 3 or actual contract ID from database
- ✅ Verify all tables exist before testing

---

## 📊 System Status

### **Current Setup:**

- ✅ N8N: Running on Docker
- ✅ Database: PostgreSQL configured
- ✅ Workflow: Multi-level approval ready
- ✅ Tables: approval_workflows, approval_history, approval_tokens

### **Next Steps:**

**Immediate:**
- [ ] Review workflow suggestions (`WORKFLOW_SUGGESTIONS.md`)
- [ ] Setup database abstraction layer (views/functions)
- [ ] Implement Priority 1 workflows (Task Due Reminder, Contract Expiry Reminder)

**Short-term:**
- [ ] Setup email notifications (Gmail SMTP)
- [ ] Implement Task Management workflows
- [ ] Implement Contract Management workflows
- [ ] Add comprehensive logging

**Long-term:**
- [ ] Monitor và optimize workflows
- [ ] Expand to other areas
- [ ] Continuous improvement

---

## 🔗 Related Documentation

### **N8N Documentation:**
- [WORKFLOW_SUGGESTIONS.md](./WORKFLOW_SUGGESTIONS.md) ⭐ - Đề xuất workflows chi tiết
- [WORKFLOW_SUGGESTIONS_SUMMARY.md](./WORKFLOW_SUGGESTIONS_SUMMARY.md) - Tóm tắt workflows
- [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) - Quyết định kiến trúc
- [N8N_VS_API_ANALYSIS.md](./N8N_VS_API_ANALYSIS.md) - Phân tích N8N vs API
- [RISK_MITIGATION_SUMMARY.md](./RISK_MITIGATION_SUMMARY.md) - Giảm thiểu rủi ro

### **Business Analysis:**
- [Business Analysis](../BA/N8N/HE_THONG_QUAN_LY_LUONG_PHE_DUYET_VAN_BAN.md) - System overview
- [Implementation Roadmap](../BA/N8N/IMPLEMENTATION_ROADMAP.md) - Development plan
- [N8N Automation Strategy](../BA/N8N/N8N_AUTOMATION_STRATEGY.md) - Technical details

---

**Last Updated**: 27/11/2024  
**Version**: 1.0  
**Status**: Production Ready ✅
