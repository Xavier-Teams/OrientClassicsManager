# 🪟 WINDOWS SETUP GUIDE

## Vấn đề đã được giải quyết

### Lỗi: `'NODE_ENV' is not recognized`

**Nguyên nhân:** Windows PowerShell không hỗ trợ cách set environment variable như bash (`NODE_ENV=development`).

**Giải pháp:** Đã cài đặt và cấu hình `cross-env` để hỗ trợ cross-platform.

---

## Đã cập nhật

✅ **package.json** - Scripts đã được cập nhật:
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

✅ **cross-env** - Package đã được cài đặt trong devDependencies

---

## Chạy ứng dụng trên Windows

### Bước 1: Start Server

```powershell
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

### Bước 2: Test trong PowerShell

```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:5000/api/ai/health -Method GET | Select-Object -ExpandProperty Content

# Hoặc sử dụng curl (nếu đã cài)
curl http://localhost:5000/api/ai/health
```

### Bước 3: Test Smart Query

```powershell
$body = @{
    query = "Cho tôi xem tất cả các tác phẩm"
    context = @{
        userId = "test_user"
        role = "thu_ky"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/ai/query `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | Select-Object -ExpandProperty Content
```

---

## Troubleshooting Windows

### Port đã được sử dụng

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay <PID> bằng Process ID)
taskkill /PID <PID> /F
```

### PowerShell Execution Policy

Nếu gặp lỗi execution policy:

```powershell
# Kiểm tra policy hiện tại
Get-ExecutionPolicy

# Set policy (nếu cần)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database Connection

Đảm bảo PostgreSQL đang chạy:

```powershell
# Kiểm tra PostgreSQL service
Get-Service -Name postgresql*

# Start service nếu chưa chạy
Start-Service -Name postgresql-x64-15  # Thay tên service phù hợp
```

---

## Alternative: Sử dụng Git Bash

Nếu muốn sử dụng bash syntax trực tiếp:

1. Cài đặt Git for Windows (bao gồm Git Bash)
2. Mở Git Bash
3. Chạy commands như trên Linux/Mac:

```bash
npm run dev
curl http://localhost:5000/api/ai/health
```

---

## Files đã cập nhật

- ✅ `package.json` - Thêm cross-env vào scripts
- ✅ `devDependencies` - Thêm cross-env package

---

**Bây giờ bạn có thể chạy `npm run dev` trên Windows PowerShell mà không gặp lỗi! 🎉**

