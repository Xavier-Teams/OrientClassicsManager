# 🗄️ Database Backup & Restore - OrientClassicsManager

## 🎯 Mục đích

Hướng dẫn đơn giản sao lưu và khôi phục dữ liệu PostgreSQL cho dự án OrientClassicsManager.

## 🚀 Quy trình nhanh với pgAdmin 4

### 📤 Backup (Máy cũ)

1. Mở pgAdmin 4
2. Right-click database `translation_db` → **Backup**
3. **Settings**:
   - Format: `Custom`
   - Filename: `backup_YYYY-MM-DD.backup`
   - Encoding: `UTF8`
4. Click **Backup**

### 📥 Restore (Máy mới)

1. Copy file backup sang máy mới
2. Mở pgAdmin 4 trên máy mới
3. Right-click database `translation_db` → **Restore**
4. **Restore Options**:
   - ✅ **Data only** (nếu schema đã có)
   - ✅ **Disable triggers**
   - ✅ **No owner**
   - ✅ **No privileges**
5. Click **Restore**

## 🔧 Xử lý lỗi thường gặp

### ❌ Lỗi Foreign Key

```
ERROR: Key (created_by_id)=(70) is not present in table "users"
```

**Giải pháp**: Chạy script tạo user thiếu

```bash
cd backend-django
python fix_missing_user.py
```

### ❌ Lỗi Duplicate Key

```
ERROR: duplicate key value violates unique constraint
```

**Giải pháp**: Bỏ qua, đây là lỗi bình thường khi dữ liệu đã tồn tại.

## 📊 Kiểm tra kết quả

Sau khi restore, kiểm tra dữ liệu:

```bash
cd backend-django
python check_data.py
```

## 📁 Files hỗ trợ

### Trong thư mục `backend-django/`:

- **`fix_missing_user.py`** - Tạo user thiếu để fix foreign key
- **`check_data.py`** - Kiểm tra số lượng dữ liệu
- **`check_tables.py`** - Xem cấu trúc database

## ⚠️ Lưu ý quan trọng

1. **Luôn backup trước khi restore**
2. **Schema khác nhau**: Chỉ restore data, không restore schema
3. **Lỗi duplicate**: Bình thường, có thể bỏ qua
4. **Foreign key**: Dùng script `fix_missing_user.py`

## ✅ Checklist

- [ ] Backup database từ máy cũ
- [ ] Copy file backup sang máy mới
- [ ] Restore với options đúng
- [ ] Chạy `fix_missing_user.py` nếu có lỗi foreign key
- [ ] Kiểm tra dữ liệu với `check_data.py`
- [ ] Test hệ thống hoạt động bình thường

---

_Cập nhật: Đã đơn giản hóa và chỉ giữ lại những gì cần thiết cho pgAdmin 4_
