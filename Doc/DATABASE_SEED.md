# 🌱 DATABASE SEED GUIDE

## Tổng quan

Script seed database sẽ tạo dữ liệu mẫu để phục vụ development và testing cho frontend.

## Chạy Seed Script

```bash
npm run db:seed
```

Hoặc trực tiếp:

```bash
tsx scripts/seed.ts
```

## Dữ liệu được tạo

### 1. Users (15 users)

**Leadership:**
- Chủ nhiệm (chu_nhiem)
- Phó Chủ nhiệm (pho_chu_nhiem)
- Trưởng ban Thư ký (truong_ban_thu_ky)

**Secretaries:**
- Thư ký hợp phần 1, 2

**Office & Finance:**
- Văn phòng
- Kế toán

**Translators:**
- Dịch giả 1 (chuyên Phật giáo)
- Dịch giả 2 (chuyên Nho giáo)
- Dịch giả 3 (chuyên Đạo giáo)

**Editors:**
- BTV 1, 2

**Technical:**
- KTV 1

**Experts:**
- Chuyên gia 1, 2

**Tất cả users có password:** `password123`

### 2. Works (6 tác phẩm)

1. **Kinh Kim Cương Bát Nhã Ba La Mật**
   - Status: Đang dịch (65% tiến độ)
   - Dịch giả: Dịch giả 1
   - Priority: Cao

2. **Luận Ngữ**
   - Status: Hoàn thành (100%)
   - Dịch giả: Dịch giả 2
   - Priority: Bình thường

3. **Đạo Đức Kinh**
   - Status: Dịch thử (30% tiến độ)
   - Dịch giả: Dịch giả 3
   - Priority: Bình thường

4. **Kinh Pháp Hoa**
   - Status: Dự kiến (0% tiến độ)
   - Dịch giả: Dịch giả 1
   - Priority: Khẩn

5. **Mạnh Tử**
   - Status: Đã kiểm tra tiến độ (80% tiến độ)
   - Dịch giả: Dịch giả 2
   - Priority: Cao

6. **Nam Hoa Kinh**
   - Status: Đã duyệt (0% tiến độ)
   - Dịch giả: Dịch giả 3
   - Priority: Bình thường

### 3. Contracts (4 hợp đồng)

- **HD-2024-001**: Kinh Kim Cương - Đang thực hiện
- **HD-2024-002**: Luận Ngữ - Hoàn thành
- **HD-2024-003**: Đạo Đức Kinh - Đã ký
- **HD-2024-004**: Mạnh Tử - Đang thực hiện

### 4. Payments

- Hợp đồng HD-2024-001:
  - Tạm ứng lần 1: Đã thanh toán ✅
  - Tạm ứng lần 2: Đang xử lý ⏳
  - Quyết toán: Chờ thanh toán

- Hợp đồng HD-2024-002:
  - Tất cả các khoản: Đã thanh toán ✅

### 5. Review Councils (2 hội đồng)

1. **Hội đồng thẩm định dịch thử - Đạo Đức Kinh**
   - Type: trial_review
   - Status: Đang hoạt động
   - Members: Chủ nhiệm (Chủ tịch), Thư ký 1, Chuyên gia 1

2. **Hội đồng thẩm định chuyên gia - Luận Ngữ**
   - Type: expert_review
   - Status: Đã hoàn thành
   - Members: Phó Chủ nhiệm (Chủ tịch), Thư ký 1, Chuyên gia 2

### 6. Reviews (2 reviews)

1. **Review cho Đạo Đức Kinh**
   - Status: Đang thẩm định
   - Council: Hội đồng thẩm định dịch thử

2. **Review cho Luận Ngữ**
   - Status: Hoàn thành
   - Rating: 9/10
   - Decision: Đạt
   - Council: Hội đồng thẩm định chuyên gia

### 7. Editing Tasks (3 tasks)

1. **Biên tập bông 1 - Luận Ngữ**
   - Status: Hoàn thành ✅
   - Assigned: BTV 1

2. **Mi trang - Luận Ngữ**
   - Status: Đang xử lý ⏳
   - Assigned: KTV 1

3. **Hiệu đính - Kinh Kim Cương**
   - Status: Chờ xử lý
   - Assigned: BTV 2

### 8. Administrative Tasks (3 tasks)

1. **Chuẩn bị hồ sơ thanh toán tạm ứng lần 2**
   - Status: Đang xử lý ⏳
   - Priority: Cao
   - Assigned: Kế toán

2. **Xin giấy phép xuất bản - Luận Ngữ**
   - Status: Chờ xử lý
   - Priority: Bình thường
   - Assigned: Văn phòng

3. **Lưu trữ hồ sơ hợp đồng HD-2024-002**
   - Status: Hoàn thành ✅
   - Priority: Thấp
   - Assigned: Văn thư

## API Endpoints để test

Sau khi seed, bạn có thể test các endpoints:

```bash
# Get all users
GET http://localhost:5000/api/users

# Get all works
GET http://localhost:5000/api/works

# Get works by status
GET http://localhost:5000/api/works?status=in_progress

# Get contracts
GET http://localhost:5000/api/contracts

# Get payments
GET http://localhost:5000/api/payments

# Get reviews
GET http://localhost:5000/api/reviews

# Get editing tasks
GET http://localhost:5000/api/editing-tasks

# Get admin tasks
GET http://localhost:5000/api/admin-tasks
```

## Lưu ý

⚠️ **Script sẽ xóa tất cả dữ liệu hiện có** trước khi seed dữ liệu mới.

Nếu bạn muốn giữ lại dữ liệu cũ, comment out phần clear data trong script:

```typescript
// Clear existing data (optional - comment out if you want to keep existing data)
// console.log("🧹 Clearing existing data...");
// await db.delete(...);
```

## Reset Database

Nếu muốn reset hoàn toàn:

1. Drop và recreate database:
```sql
DROP DATABASE translation_db;
CREATE DATABASE translation_db;
```

2. Push schema:
```bash
npm run db:push
```

3. Seed data:
```bash
npm run db:seed
```

---

**Chúc bạn test thành công! 🎉**

