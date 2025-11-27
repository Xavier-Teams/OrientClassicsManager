# Database Migration - Hướng dẫn tóm tắt

## 🎯 Mục đích

Hướng dẫn sao lưu và khôi phục dữ liệu giữa các máy có schema database khác nhau.

## 📁 Files hữu ích được giữ lại

### 1. `fix_missing_user.py`

**Mục đích**: Tạo các user bị thiếu để fix lỗi foreign key constraints
**Khi dùng**: Khi gặp lỗi "Key (created_by_id)=(70) is not present in table users"

```bash
python fix_missing_user.py
```

### 2. `check_data.py`

**Mục đích**: Kiểm tra số lượng dữ liệu trong các bảng quan trọng
**Khi dùng**: Sau khi restore để xác nhận dữ liệu đã được import

```bash
python check_data.py
```

### 3. `check_tables.py`

**Mục đích**: Liệt kê tất cả bảng trong database và phân loại
**Khi dùng**: Kiểm tra cấu trúc database trước/sau migration

```bash
python check_tables.py
```

## 🔄 Quy trình restore đơn giản với pgAdmin 4

### Bước 1: Backup từ máy cũ

1. Mở pgAdmin 4 trên máy cũ
2. Right-click database → Backup
3. Format: Custom
4. Filename: `backup_YYYY-MM-DD.backup`

### Bước 2: Restore vào máy mới

1. Copy file backup sang máy mới
2. Mở pgAdmin 4 trên máy mới
3. Right-click database → Restore
4. **Restore Options**:
   - ✅ Data only (nếu schema đã có)
   - ✅ Disable triggers
   - ✅ No owner
   - ✅ No privileges

### Bước 3: Xử lý lỗi (nếu có)

```bash
# Nếu gặp lỗi foreign key
python fix_missing_user.py

# Kiểm tra kết quả
python check_data.py
```

## ⚠️ Lưu ý quan trọng

1. **Lỗi duplicate key**: Bình thường, có thể bỏ qua
2. **Lỗi foreign key**: Chạy `fix_missing_user.py`
3. **Schema khác nhau**: Chỉ restore data, không restore schema
4. **Backup định kỳ**: Luôn backup trước khi restore

## 🗑️ Files đã xóa (không cần thiết)

- `migration_guide.md` - Hướng dẫn phức tạp
- `MIGRATION_STEPS.md` - Các bước chi tiết không cần
- `restore_data_only.sql` - Script SQL thủ công
- `manual_import_guide.md` - Hướng dẫn command line
- `smart_restore.py` - Script tự động (không hoạt động trên Windows)
- `selective_import.py` - Import có chọn lọc (phụ thuộc command line)
- `backup_restore.py` - Script backup tự động (không cần với pgAdmin)

## ✅ Kết luận

Với pgAdmin 4, việc backup/restore rất đơn giản và không cần các script phức tạp. Chỉ cần giữ lại 3 files Python để xử lý lỗi và kiểm tra dữ liệu.
