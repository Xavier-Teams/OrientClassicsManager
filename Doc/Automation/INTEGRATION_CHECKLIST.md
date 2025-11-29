# ✅ Mattermost + N8N Integration Checklist

> **Checklist hoàn chỉnh** để verify integration giữa Mattermost và N8N

**Last Updated:** 2024-11-29

---

## 📋 Pre-Setup Checklist

### **Infrastructure:**

- [x] Docker running
- [x] Mattermost container running
- [x] Mattermost database healthy
- [x] N8N container running
- [x] orient-network created

---

## 🔐 Account & Access

### **Mattermost:**

- [ ] Admin account created
- [ ] Can login to Mattermost
- [ ] Access token created
- [ ] Token saved securely

### **N8N:**

- [ ] Can access N8N UI
- [ ] Can login to N8N
- [ ] Credentials section accessible

---

## 📢 Channels

### **Required Channels:**

- [ ] `#tasks-general`
- [ ] `#tasks-urgent`
- [ ] `#contracts-approvals`
- [ ] `#contracts-payments`
- [ ] `#system-alerts`

### **Optional Channels:**

- [ ] `#tasks-bien-tap`
- [ ] `#tasks-hanh-chinh`
- [ ] `#contracts-expiry`
- [ ] `#workflows-approvals`
- [ ] `#general`
- [ ] `#announcements`

---

## 🔗 Webhooks

### **Webhook URLs Saved:**

- [ ] `#tasks-general` webhook URL
- [ ] `#contracts-approvals` webhook URL
- [ ] `#system-alerts` webhook URL

### **Webhook Testing:**

- [ ] Test `#tasks-general` webhook
- [ ] Test `#contracts-approvals` webhook
- [ ] Test `#system-alerts` webhook

---

## ⚙️ N8N Configuration

### **Mattermost Credential:**

- [ ] Mattermost credential created
- [ ] URL: http://localhost:8065
- [ ] Access token configured
- [ ] Connection test successful

### **Workflows:**

- [ ] Test workflow imported
- [ ] Test workflow activated
- [ ] Test workflow executed successfully
- [ ] Message received in Mattermost

---

## 🧪 Testing

### **Basic Integration:**

- [ ] N8N → Mattermost: Test message sent
- [ ] Message appears in correct channel
- [ ] Message formatting correct
- [ ] Attachments work (if used)

### **Workflow Integration:**

- [ ] Task reminder workflow works
- [ ] Contract approval workflow works
- [ ] Notifications sent to correct channels
- [ ] Error handling works

---

## 📊 Verification

### **End-to-End Test:**

1. [ ] Trigger workflow in N8N
2. [ ] Verify execution in N8N
3. [ ] Check message in Mattermost
4. [ ] Verify message content
5. [ ] Check logs (if available)

### **Error Handling:**

- [ ] Test with invalid channel
- [ ] Test with invalid token
- [ ] Verify error messages
- [ ] Check error logs

---

## 📝 Documentation

### **Documentation Updated:**

- [ ] Webhook URLs documented
- [ ] Access token saved securely
- [ ] Workflow configurations documented
- [ ] Integration notes added

---

## 🚀 Ready for Production

### **Before Going Live:**

- [ ] All tests passing
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Team trained
- [ ] Documentation complete

---

## 🔧 Troubleshooting

### **Common Issues:**

- [ ] Mattermost not accessible → Check container
- [ ] Webhook not working → Verify URL
- [ ] N8N cannot connect → Check token
- [ ] Messages not appearing → Check channel name

### **Debug Commands:**

```powershell
# Check Mattermost
docker logs orient-mattermost --tail 50

# Check N8N
docker logs orient-n8n-dev --tail 50

# Test Mattermost API
curl http://localhost:8065/api/v4/system/ping

# Test webhook
.\scripts\test_mattermost_webhook.ps1 -WebhookUrl "http://localhost:8065/hooks/xxx"
```

---

**✨ Complete this checklist to ensure full integration!**
