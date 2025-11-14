# 🌱 HƯỚNG DẪN SEED DATABASE

## Bước 1: Push Database Schema

**Quan trọng:** Bạn phải push schema trước khi seed data!

```bash
npm run db:push
```

Khi được hỏi về các tables, chọn `+ create table` cho tất cả các tables mới.

## Bước 2: Seed Data

Sau khi schema đã được push, chạy seed script:

```bash
npm run db:seed
```

## Dữ liệu sẽ được tạo

✅ **15 Users** với các roles khác nhau  
✅ **6 Works** (tác phẩm) với các trạng thái khác nhau  
✅ **4 Contracts** (hợp đồng)  
✅ **Payment Milestones & Payments**  
✅ **2 Review Councils** (hội đồng thẩm định)  
✅ **2 Reviews** (thẩm định)  
✅ **3 Editing Tasks** (nhiệm vụ biên tập)  
✅ **3 Administrative Tasks** (nhiệm vụ hành chính)  

## Test Accounts

Sau khi seed, bạn có thể đăng nhập với:

- **Chủ nhiệm:** `chu_nhiem` / `password123`
- **Thư ký:** `thu_ky_1` / `password123`
- **Dịch giả 1:** `dich_gia_1` / `password123`
- **BTV:** `btv_1` / `password123`
- **Kế toán:** `ke_toan` / `password123`

## Test API Endpoints

Sau khi seed, test các endpoints:

```powershell
# Get all users
Invoke-WebRequest -Uri http://localhost:5000/api/users | Select-Object -ExpandProperty Content

# Get all works
Invoke-WebRequest -Uri http://localhost:5000/api/works | Select-Object -ExpandProperty Content

# Get works by status
Invoke-WebRequest -Uri http://localhost:5000/api/works?status=in_progress | Select-Object -ExpandProperty Content

# Get contracts
Invoke-WebRequest -Uri http://localhost:5000/api/contracts | Select-Object -ExpandProperty Content
```

## Troubleshooting

### Lỗi: "relation does not exist"

**Giải pháp:** Chạy `npm run db:push` trước khi seed.

### Lỗi: "DATABASE_URL must be set"

**Giải pháp:** Đảm bảo file `.env` tồn tại và có `DATABASE_URL`.

### Lỗi: "connection refused"

**Giải pháp:** 
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra database `translation_db` đã được tạo
3. Kiểm tra credentials trong `.env`

---

**Xem chi tiết trong:** `Doc/DATABASE_SEED.md`

