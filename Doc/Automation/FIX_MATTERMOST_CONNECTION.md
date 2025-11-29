# 🔧 Fix Mattermost Connection Error in N8N

> **Giải quyết lỗi:** "Couldn't connect with these settings"

**Issue:** Đang dùng n8n Personal Access Token thay vì Mattermost Personal Access Token

---

## ❌ Vấn Đề

**Error:** "Couldn't connect with these settings"

**Nguyên nhân:** 
- N8N Mattermost credential cần **Mattermost Access Token**
- Không phải n8n Personal Access Token

---

## ✅ Giải Pháp

### **Step 1: Get Mattermost Personal Access Token**

1. **Open Mattermost:** http://localhost:8065
2. **Login** với admin account
3. **Click your profile** (top left) → **Account Settings**
4. **Security** → **Personal Access Tokens**
5. **Create Token:**
   - Description: "N8N Integration"
   - Click **Generate Token**
6. **Copy token** (chỉ hiện 1 lần!)

**Token format:** `xxxxxxxxxxxxxxxxxxxxxxxxxx` (chuỗi dài)

---

### **Step 2: Update N8N Mattermost Credential**

**⚠️ QUAN TRỌNG:** Nếu N8N chạy trong Docker container, không dùng `localhost`!

1. **N8N → Credentials → Mattermost Connection**
2. **Update fields:**
   - **Access Token:** (paste Mattermost token từ Step 1)
   - **Base URL:** 
     - **Nếu N8N chạy trong Docker:** `http://orient-mattermost:8065` (tên container)
     - **Hoặc:** `http://host.docker.internal:8065` (nếu dùng Docker Desktop)
     - **Nếu N8N chạy trên host (không phải container):** `http://localhost:8065`
   - **Ignore SSL Issues:** ON (vì đang dùng HTTP local)
3. **Click "Test Connection"** hoặc **"Save"**

---

### **Step 3: Verify Connection**

**Nếu vẫn lỗi, kiểm tra:**

1. **Mattermost đang chạy:**
   ```powershell
   docker ps --filter name=orient-mattermost
   ```

2. **Mattermost accessible:**
   ```powershell
   curl http://localhost:8065/api/v4/system/ping
   ```
   Should return: `{"status":"OK"}`

3. **Token format:**
   - Mattermost token: `oeihfeummiy19bk5hgfsm8g9bc` (example)
   - Không có prefix, chỉ là chuỗi ký tự

4. **URL format (QUAN TRỌNG):**
   - **Nếu N8N trong Docker container:**
     - ✅ Correct: `http://orient-mattermost:8065` (tên container)
     - ✅ Alternative: `http://host.docker.internal:8065` (Docker Desktop)
     - ❌ Wrong: `http://localhost:8065` (không hoạt động từ container)
   - **Nếu N8N chạy trên host:**
     - ✅ Correct: `http://localhost:8065`
   - **Luôn tránh:**
     - ❌ `http://localhost:8065/` (có trailing slash)
     - ❌ `https://localhost:8065` (nếu không dùng SSL)

---

## 🔍 Troubleshooting

### **Error: "Couldn't connect with these settings"**

**Possible causes:**

1. **Wrong token:**
   - ✅ Use Mattermost token (from Mattermost → Security)
   - ❌ Not n8n token (from n8n → Security)

2. **Mattermost not running:**
   ```powershell
   docker logs orient-mattermost --tail 20
   ```

3. **Network issue (QUAN TRỌNG nếu N8N trong Docker):**
   - ❌ **KHÔNG dùng:** `http://localhost:8065` (sẽ không hoạt động từ container)
   - ✅ **Dùng:** `http://orient-mattermost:8065` (tên container trong cùng network)
   - ✅ **Hoặc:** `http://host.docker.internal:8065` (nếu dùng Docker Desktop)
   - Kiểm tra containers cùng network:
     ```powershell
     docker network inspect orient-network
     ```

4. **Token expired/invalid:**
   - Generate new token in Mattermost
   - Update credential in N8N

---

### **Error: "401 Unauthorized"**

- Token không đúng hoặc đã expired
- Generate new token

---

### **Error: "Connection refused"**

- Mattermost không chạy
- URL sai
- Network issue

---

## 📋 Quick Checklist

- [ ] Mattermost running (http://localhost:8065)
- [ ] Logged in to Mattermost
- [ ] Created Personal Access Token in Mattermost (not n8n!)
- [ ] Copied Mattermost token
- [ ] Updated N8N credential with Mattermost token
- [ ] Base URL: 
  - Nếu N8N trong Docker: `http://orient-mattermost:8065`
  - Nếu N8N trên host: `http://localhost:8065`
- [ ] Test connection successful

---

## 💡 Tips

1. **Save token securely** - chỉ hiện 1 lần
2. **Test connection** trước khi save
3. **Check logs** nếu vẫn lỗi:
   ```powershell
   docker logs orient-mattermost --tail 50
   docker logs orient-n8n-dev --tail 50
   ```

---

## ✅ Success

Khi connection thành công:
- ✅ "Test Connection" button sẽ show success
- ✅ Có thể dùng Mattermost node trong workflows
- ✅ Messages sẽ được gửi đến Mattermost channels

---

**✨ Follow these steps to fix the connection!**

