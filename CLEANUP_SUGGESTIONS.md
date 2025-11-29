# 🗑️ Gợi ý Xóa File Không Còn Dùng Đến

> **Danh sách các file có thể xóa an toàn** trong dự án OrientClassicsManager tính đến giai đoạn hiện tại

**Ngày tạo:** 2024-12-XX  
**Status:** ⚠️ Review trước khi xóa

---

## 🎯 Tóm Tắt Nhanh

### **Files Có Thể Xóa Ngay (An Toàn 100%):**

1. ✅ **Toàn bộ thư mục `attached_assets/`** (4 files) - File tạm/duplicate
2. ✅ **`Doc/Setup/FASTAPI_SETUP.md`** - Legacy documentation (đã chuyển sang Django)
3. ✅ **Alias `@assets` trong `vite.config.ts`** (dòng 26) - Không được sử dụng

**Tổng:** ~5 items có thể xóa ngay

### **Cần Xem Xét Thêm:**

- ⚠️ Một số test scripts one-time use (có thể giữ lại để test)
- ⚠️ Một số documentation có thể trùng lặp (cần so sánh nội dung)

---

## 📋 Phân Loại File Có Thể Xóa

### 🔴 **MỨC ĐỘ 1: AN TOÀN - CÓ THỂ XÓA NGAY**

#### **1. Thư mục `attached_assets/` (4 files) - File tạm/duplicate**

Các file này là bản copy của các file trong `Doc/BA/`:

- ✅ `attached_assets/BA_PM_Quan_ly_Du_an_dich_thuat_1763112770321.md`
  - **Lý do:** Duplicate của `Doc/BA/BA_PM_Quan_ly_Du_an_dich_thuat.md`
  
- ✅ `attached_assets/DJANGO_SETUP_GUIDE_1763112780079.md`
  - **Lý do:** File tạm, đã có hướng dẫn Django trong `backend-django/README.md`
  
- ✅ `attached_assets/KE_HOACH_TRIEN_KHAI_CHI_TIET_1763112856614.md`
  - **Lý do:** Duplicate của `Doc/BA/KE_HOACH_TRIEN_KHAI_CHI_TIET.md`
  
- ✅ `attached_assets/Quy_trinh_quan_ly_hop_phan_dich_thuat_1763112770321.md`
  - **Lý do:** Duplicate của `Doc/BA/Quy_trinh_quan_ly_hop_phan_dich_thuat.md`

**Lưu ý:** 
- `vite.config.ts` có alias `@assets` trỏ đến `attached_assets` (dòng 26)
- **Cần xóa alias này** sau khi xóa folder `attached_assets`
- Alias này có thể không được sử dụng trong code (cần kiểm tra)

---

#### **2. Legacy FastAPI Documentation**

- ✅ `Doc/Setup/FASTAPI_SETUP.md`
  - **Lý do:** 
    - Project đã chuyển sang Django REST Framework
    - Được đánh dấu là "legacy" trong `Doc/README.md`
    - `Doc/Architecture/ARCHITECTURE_DECISION.md` khuyến nghị xóa FastAPI
    - Không còn backend-fastapi folder

---

#### **3. Old Workflow Files**

**✅ Đã kiểm tra:** Các file workflow cũ (`contract-approval-simple.json`, `contract-approval-workflow.json`) **KHÔNG TỒN TẠI** trong project.

Chỉ được mention trong documentation nhưng không có file thực tế. Không cần xóa gì ở đây.

---

### 🟡 **MỨC ĐỘ 2: CẦN XEM XÉT - CÓ THỂ XÓA SAU KHI XÁC NHẬN**

#### **4. Test Scripts (One-time use)**

Các script test đã chạy xong và không cần thiết cho production:

- ⚠️ `scripts/test_webhook_simple.ps1`
  - **Lý do:** Script test đơn giản, đã có các script test chi tiết hơn
  
- ⚠️ `scripts/get_contracts_for_testing.ps1`
  - **Lý do:** Script test tạm thời
  
- ⚠️ `scripts/setup_and_test_contract_3.ps1`
  - **Lý do:** Script test cụ thể cho contract ID 3

**Khuyến nghị:** Có thể giữ lại nếu cần test lại, hoặc move vào `scripts/test/` folder

---

#### **5. Duplicate Setup Documentation**

Một số file setup có thể trùng lặp:

- ⚠️ `Doc/Automation/SETUP_SUMMARY.md`
  - **Kiểm tra:** Xem có trùng với `SETUP_COMPLETE.md` không
  
- ⚠️ `Doc/Automation/DEPLOYMENT_SUMMARY.md`
  - **Kiểm tra:** Xem có trùng với `WORKFLOW_IMPLEMENTATION_SUMMARY.md` không

**Khuyến nghị:** So sánh nội dung trước khi xóa

---

#### **6. Old Database Scripts (Nếu đã được thay thế)**

- ⚠️ `scripts/setup_approval_workflow.sql`
  - **Kiểm tra:** Xem có được thay thế bởi `setup_approval_tables_fixed.sql` không
  
- ⚠️ `scripts/setup_n8n_database_simple.sql`
  - **Kiểm tra:** Xem có được thay thế bởi `setup_n8n_abstraction_layer.sql` không

**Khuyến nghị:** Chỉ xóa nếu chắc chắn đã có version mới hơn

---

### 🟢 **MỨC ĐỘ 3: GIỮ LẠI - VẪN CẦN THIẾT**

#### **7. Files CẦN GIỮ LẠI**

- ✅ `n8n-workflows/mattermost-test-workflow.json` - **GIỮ LẠI**
  - Được reference trong nhiều documentation
  - Cần cho testing Mattermost integration
  
- ✅ `scripts/test_mattermost_webhook.ps1` - **GIỮ LẠI**
  - Script test hữu ích cho debugging
  
- ✅ `scripts/test_contract_approval_webhook.ps1` - **GIỮ LẠI**
  - Script test chính cho contract approval
  
- ✅ Tất cả các file trong `Doc/Automation/` - **GIỮ LẠI**
  - Tài liệu quan trọng cho automation workflow

---

## 📊 Tổng Kết

### **Files Có Thể Xóa Ngay (Mức độ 1):**

1. ✅ Toàn bộ thư mục `attached_assets/` (4 files)
2. ✅ `Doc/Setup/FASTAPI_SETUP.md`

**Tổng:** ~5 files

### **Files Cần Xem Xét (Mức độ 2):**

1. ⚠️ Old workflow files (nếu tồn tại)
2. ⚠️ Test scripts one-time use
3. ⚠️ Duplicate documentation (cần so sánh)

**Tổng:** ~5-8 files (cần review)

---

## 🚀 Hướng Dẫn Xóa

### **Cách 1: Xóa Thủ Công**

```powershell
# Xóa attached_assets folder
Remove-Item -Recurse -Force attached_assets

# Xóa FASTAPI_SETUP.md
Remove-Item Doc\Setup\FASTAPI_SETUP.md

# Xóa alias trong vite.config.ts (dòng 26)
# Cần edit thủ công: xóa dòng "@assets": path.resolve(import.meta.dirname, "attached_assets"),
```

### **Cách 2: Archive Thay Vì Xóa**

Nếu muốn giữ lại để tham khảo:

```powershell
# Tạo folder archive
New-Item -ItemType Directory -Path archive

# Move files vào archive
Move-Item attached_assets archive\
Move-Item Doc\Setup\FASTAPI_SETUP.md archive\
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup trước khi xóa:** Đảm bảo đã commit tất cả changes vào Git
2. **Kiểm tra references:** Một số file có thể được reference trong code/documentation
3. **Test sau khi xóa:** Đảm bảo project vẫn build và chạy được
4. **Update documentation:** Cập nhật `Doc/README.md` nếu có reference đến file đã xóa

---

## 📝 Checklist Trước Khi Xóa

- [ ] Đã commit tất cả changes vào Git
- [ ] Đã backup files quan trọng
- [ ] Đã kiểm tra references trong code
- [ ] Đã kiểm tra references trong documentation
- [ ] Đã test build project
- [ ] Đã test chạy project
- [ ] Đã cập nhật documentation nếu cần

---

**Last Updated:** 2024-12-XX  
**Status:** ⚠️ Review Required

