# 🔧 Fix N8N Mattermost Connection - Network Issue

> **Lỗi:** "The service refused the connection - perhaps it is offline"  
> **Nguyên nhân:** N8N chạy trong Docker container, không thể dùng `localhost` để kết nối Mattermost

---

## ❌ Vấn Đề

**Error trong N8N:** 
- "Couldn't connect with these settings"
- "The service refused the connection - perhaps it is offline"

**Nguyên nhân:**
- N8N đang chạy trong Docker container (`orient-n8n-dev`)
- Mattermost cũng chạy trong Docker container (`orient-mattermost`)
- Khi N8N container cố kết nối `http://localhost:8065`, nó tìm trong chính container N8N, không phải host machine
- Cần dùng **tên container** thay vì `localhost`

---

## ✅ Giải Pháp Nhanh

### **Step 1: Kiểm tra Containers**

```powershell
docker ps --filter name=orient
```

Phải thấy:
- `orient-n8n-dev` - N8N container
- `orient-mattermost` - Mattermost container

### **Step 2: Sửa Base URL trong N8N**

1. **Mở N8N:** http://localhost:5678
2. **Credentials → Mattermost Connection → Edit**
3. **Thay đổi Base URL:**
   - ❌ **Cũ:** `http://localhost:8065`
   - ✅ **Mới:** `http://orient-mattermost:8065`
4. **Access Token:** Giữ nguyên (Mattermost token đã nhập đúng)
5. **Ignore SSL Issues:** Bật ON
6. **Click "Test Connection"** hoặc **"Save"**

---

## 🔍 Giải Thích

### **Tại sao không dùng `localhost`?**

Khi N8N chạy trong Docker container:
- `localhost` = chính container N8N
- Không phải host machine
- Không thể kết nối đến Mattermost container

### **Tại sao dùng `orient-mattermost:8065`?**

- Cả N8N và Mattermost đều trong network `orient-network`
- Docker tự động resolve tên container thành IP
- `orient-mattermost` = tên container Mattermost
- Port `8065` = port Mattermost lắng nghe

---

## 🧪 Test Connection

Sau khi sửa, test connection:

1. **Trong N8N Credential:**
   - Click "Test Connection"
   - Phải thấy ✅ Success

2. **Hoặc tạo test workflow:**
   - Add "Mattermost" node
   - Select credential
   - Operation: "Post Message"
   - Channel: `#general`
   - Message: "Test from N8N"
   - Execute workflow
   - Kiểm tra Mattermost channel

---

## 🔄 Alternative: host.docker.internal

Nếu `orient-mattermost:8065` không hoạt động (hiếm), thử:

**Base URL:** `http://host.docker.internal:8065`

- `host.docker.internal` = special DNS name trong Docker Desktop
- Trỏ về host machine
- Chỉ hoạt động với Docker Desktop (Windows/Mac)

---

## 📋 Checklist

- [ ] N8N container đang chạy (`orient-n8n-dev`)
- [ ] Mattermost container đang chạy (`orient-mattermost`)
- [ ] Cả hai trong cùng network (`orient-network`)
- [ ] Base URL đã đổi thành `http://orient-mattermost:8065`
- [ ] Access Token là Mattermost token (không phải n8n token)
- [ ] Ignore SSL Issues = ON
- [ ] Test connection thành công

---

## 🚨 Nếu Vẫn Lỗi

### **1. Kiểm tra Network:**

```powershell
docker network inspect orient-network --format "{{range .Containers}}{{.Name}} {{end}}"
```

Phải thấy: `orient-mattermost orient-n8n-dev`

### **2. Kiểm tra Mattermost logs:**

```powershell
docker logs orient-mattermost --tail 50
```

### **3. Kiểm tra N8N logs:**

```powershell
docker logs orient-n8n-dev --tail 50
```

### **4. Test từ N8N container (nếu có curl):**

```powershell
docker exec orient-n8n-dev wget -O- http://orient-mattermost:8065/api/v4/system/ping
```

Hoặc:

```powershell
docker exec orient-n8n-dev sh -c "echo 'GET /api/v4/system/ping HTTP/1.1\r\nHost: orient-mattermost:8065\r\n\r\n' | nc orient-mattermost 8065"
```

---

## ✅ Success

Khi fix thành công:
- ✅ Test Connection trong N8N thành công
- ✅ Có thể dùng Mattermost node trong workflows
- ✅ Messages được gửi đến Mattermost channels
- ✅ Không còn lỗi "connection refused"

---

**✨ Thay đổi Base URL từ `localhost:8065` sang `orient-mattermost:8065` sẽ fix lỗi!**

