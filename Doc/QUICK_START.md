# 🚀 QUICK START - XÂY DỰNG DATABASE

## Bước 1: Push Database Schema

Chạy lệnh:
```bash
npm run db:push
```

**Khi được hỏi về các tables, bạn cần:**
1. Nhấn phím mũi tên **↓** để chọn `+ administrative_tasks` (create table)
2. Nhấn **Enter** để chọn
3. Lặp lại cho tất cả các tables khác

**Hoặc:** Nhấn **Enter** ngay khi thấy prompt (sẽ chọn option đầu tiên - create table)

**Danh sách tables cần tạo:**
- administrative_tasks
- ai_interactions
- contracts
- council_memberships
- documents
- editing_tasks
- form_templates
- payment_milestones
- payments
- review_councils
- review_evaluations
- reviews
- users
- workflow_audit_log
- works

## Bước 2: Seed Database với Sample Data

Sau khi push schema thành công, chạy:
```bash
npm run db:seed
```

Script sẽ tự động tạo:
- ✅ 15 users với các roles khác nhau
- ✅ 6 works (tác phẩm) với các trạng thái
- ✅ 4 contracts (hợp đồng)
- ✅ Payment milestones & payments
- ✅ Review councils & reviews
- ✅ Editing tasks
- ✅ Administrative tasks

## Bước 3: Start Server

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

## Bước 4: Test API Endpoints

### PowerShell:
```powershell
# Get all users
Invoke-WebRequest -Uri http://localhost:5000/api/users | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Get all works
Invoke-WebRequest -Uri http://localhost:5000/api/works | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Get works by status
Invoke-WebRequest -Uri http://localhost:5000/api/works?status=in_progress | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Get contracts
Invoke-WebRequest -Uri http://localhost:5000/api/contracts | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Get payments
Invoke-WebRequest -Uri http://localhost:5000/api/payments | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Browser:
Mở browser và truy cập:
- http://localhost:5000/api/users
- http://localhost:5000/api/works
- http://localhost:5000/api/contracts

## Test Accounts (sau khi seed)

- **Chủ nhiệm:** `chu_nhiem` / `password123`
- **Thư ký:** `thu_ky_1` / `password123`
- **Dịch giả 1:** `dich_gia_1` / `password123`
- **BTV:** `btv_1` / `password123`
- **Kế toán:** `ke_toan` / `password123`

## Troubleshooting

### Lỗi khi push schema
- Đảm bảo PostgreSQL đang chạy
- Đảm bảo database `translation_db` đã được tạo
- Kiểm tra `.env` file có đúng credentials

### Lỗi khi seed
- Đảm bảo đã push schema trước (`npm run db:push`)
- Kiểm tra database connection trong `.env`

---

**Xem chi tiết:**
- `Doc/DATABASE_SEED.md` - Chi tiết về seed data
- `README_SEED.md` - Hướng dẫn seed

