# 🔗 How to Get Mattermost Webhook URL

> **Hướng dẫn chi tiết** để lấy Webhook URL từ Mattermost

---

## 📋 Step-by-Step Guide

### **Step 1: Open Mattermost**

1. **Mở browser:** http://localhost:8065
2. **Login** với admin account

---

### **Step 2: Navigate to Integrations**

1. **Click Menu** (☰) ở góc trên bên trái
2. **Click "Integrations"**
3. **Click "Incoming Webhooks"**

---

### **Step 3: Create Webhook**

1. **Click "Add Incoming Webhook"** (nút màu xanh)
2. **Select Channel:**
   - Chọn channel bạn muốn gửi message đến
   - Ví dụ: `#tasks-general`, `#contracts-approvals`, etc.
3. **Click "Save"**

---

### **Step 4: Copy Webhook URL**

1. **Webhook URL sẽ hiện ngay sau khi tạo**
2. **Format:** `http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Copy toàn bộ URL** (bao gồm `http://localhost:8065/hooks/` và chuỗi ID)
4. **Lưu lại** vào file hoặc notes

**⚠️ QUAN TRỌNG:**
- URL chỉ hiện 1 lần khi tạo
- Nếu quên, phải tạo webhook mới
- Mỗi webhook chỉ gửi được đến 1 channel

---

## 📝 Example Webhook URLs

```
#tasks-general: http://localhost:8065/hooks/59c8pizwibrmffwbtc8ddwop1e
#contracts-approvals: http://localhost:8065/hooks/jthtji3rcfbrfxahbns83p5upe
#system-alerts: http://localhost:8065/hooks/xawhyes5n7gptdxkb3a7myah7r
```

---

## 🧪 Test Webhook

### **Option 1: PowerShell Script**

```powershell
.\scripts\test_mattermost_webhook.ps1 `
  -WebhookUrl "http://localhost:8065/hooks/YOUR_WEBHOOK_ID" `
  -Channel "#tasks-general" `
  -Message "Test message from OrientClassicsManager"
```

**Lưu ý:**
- Thay `YOUR_WEBHOOK_ID` bằng webhook ID thực tế
- Có thể bỏ `-Channel` nếu webhook đã có default channel

### **Option 2: curl (PowerShell)**

```powershell
$body = @{
    text = "Test message from PowerShell"
    channel = "tasks-general"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8065/hooks/YOUR_WEBHOOK_ID" `
  -Method Post -Body $body -ContentType "application/json"
```

### **Option 3: Browser (Simple Test)**

Mở URL này trong browser (GET request):
```
http://localhost:8065/hooks/YOUR_WEBHOOK_ID?text=Test+message
```

---

## ❌ Common Errors

### **Error 400: Bad Request**

**Nguyên nhân:**
- Webhook URL không đúng (có placeholder "xxx")
- Channel không tồn tại
- Format JSON không đúng

**Giải pháp:**
- Kiểm tra webhook URL đã copy đúng chưa
- Tạo webhook mới nếu cần
- Bỏ parameter `channel` nếu webhook đã có default channel

### **Error 404: Not Found**

**Nguyên nhân:**
- Webhook URL sai
- Webhook đã bị xóa

**Giải pháp:**
- Tạo webhook mới
- Copy lại URL đúng

### **Error: Connection Refused**

**Nguyên nhân:**
- Mattermost không chạy
- Port 8065 không accessible

**Giải pháp:**
```powershell
# Check Mattermost status
docker ps --filter name=orient-mattermost

# Start Mattermost if not running
docker-compose -f docker-compose.mattermost.yml up -d
```

---

## 📋 Checklist

- [ ] Mattermost accessible (http://localhost:8065)
- [ ] Logged in to Mattermost
- [ ] Channel created (e.g., #tasks-general)
- [ ] Webhook created for channel
- [ ] Webhook URL copied (không có "xxx" placeholder)
- [ ] Webhook URL saved securely
- [ ] Test message sent successfully
- [ ] Message appears in Mattermost channel

---

## 💡 Tips

1. **Tạo webhook cho mỗi channel:**
   - Mỗi webhook chỉ gửi được đến 1 channel
   - Tạo nhiều webhooks cho nhiều channels

2. **Lưu webhook URLs:**
   - Tạo file `webhooks.txt` hoặc `webhooks.json`
   - Lưu mapping: channel → webhook URL

3. **Security:**
   - Webhook URLs là sensitive
   - Không commit vào git
   - Chỉ share với team members cần thiết

4. **Test thường xuyên:**
   - Test webhook sau khi tạo
   - Verify message format đúng
   - Check channel nhận được message

---

## 🔄 Update Webhook

Nếu cần thay đổi channel của webhook:

1. **Mattermost → Integrations → Incoming Webhooks**
2. **Click webhook cần sửa**
3. **Change channel**
4. **Save**

**Lưu ý:** URL không đổi, chỉ channel thay đổi

---

## 🗑️ Delete Webhook

1. **Mattermost → Integrations → Incoming Webhooks**
2. **Click "Delete"** bên cạnh webhook
3. **Confirm deletion**

**⚠️ Sau khi xóa, webhook URL sẽ không hoạt động nữa!**

---

**✨ Follow these steps to get your webhook URLs correctly!**

