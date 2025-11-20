# Hướng dẫn sử dụng Word Template cho Hợp đồng

## Cách tạo Word Template

1. Tạo file Word (.docx) với nội dung hợp đồng
2. Sử dụng các placeholder sau để điền dữ liệu tự động:

### Placeholders có sẵn:

#### Thông tin hợp đồng:
- `{contract_number}` - Số hợp đồng
- `{contract_date}` - Ngày hợp đồng
- `{start_date}` - Ngày bắt đầu
- `{end_date}` - Ngày kết thúc

#### Thông tin tác phẩm:
- `{work_name}` - Tên tác phẩm

#### Thông tin dịch giả:
- `{translator_name}` - Họ tên dịch giả
- `{translator_id_card}` - Số CMND/CCCD
- `{translator_address}` - Địa chỉ
- `{translator_phone}` - Số điện thoại
- `{translator_email}` - Email
- `{translator_bank_account}` - Số tài khoản ngân hàng
- `{translator_bank_name}` - Tên ngân hàng
- `{translator_bank_branch}` - Chi nhánh ngân hàng
- `{translator_tax_code}` - Mã số thuế

#### Thông tin tài chính (số):
- `{base_page_count}` - Số trang cơ sở
- `{translation_unit_price}` - Đơn giá dịch thuật (đã format)
- `{translation_cost}` - Kinh phí dịch thuật (đã format)
- `{overview_writing_cost}` - Kinh phí viết bài tổng quan (đã format)
- `{total_amount}` - Tổng giá trị hợp đồng (đã format)
- `{advance_payment_1_percent}` - Tỷ lệ tạm ứng lần 1 (%)
- `{advance_payment_1}` - Số tiền tạm ứng lần 1 (đã format)
- `{advance_payment_2_percent}` - Tỷ lệ tạm ứng lần 2 (%)
- `{advance_payment_2}` - Số tiền tạm ứng lần 2 (đã format)
- `{final_payment}` - Số tiền quyết toán (đã format)

#### Thông tin tài chính (bằng chữ):
- `{translation_cost_words}` - Kinh phí dịch thuật bằng chữ
- `{overview_writing_cost_words}` - Kinh phí viết bài tổng quan bằng chữ
- `{total_amount_words}` - Tổng giá trị hợp đồng bằng chữ
- `{advance_payment_1_words}` - Tạm ứng lần 1 bằng chữ
- `{advance_payment_2_words}` - Tạm ứng lần 2 bằng chữ
- `{final_payment_words}` - Quyết toán bằng chữ

## Ví dụ sử dụng:

Trong file Word template, bạn có thể viết:

```
HỢP ĐỒNG DỊCH THUẬT

Số hợp đồng: {contract_number}
Ngày ký: {contract_date}

Bên A: [Thông tin bên A]
Bên B: {translator_name}
CMND/CCCD: {translator_id_card}
Địa chỉ: {translator_address}
Số điện thoại: {translator_phone}
Email: {translator_email}

Tác phẩm dịch thuật: {work_name}
Số trang cơ sở: {base_page_count} trang

Tổng giá trị hợp đồng: {total_amount} VNĐ
(Bằng chữ: {total_amount_words} đồng)

Tạm ứng lần 1: {advance_payment_1} VNĐ ({advance_payment_1_percent}%)
Tạm ứng lần 2: {advance_payment_2} VNĐ ({advance_payment_2_percent}%)
Quyết toán: {final_payment} VNĐ

Thời gian thực hiện: Từ {start_date} đến {end_date}
```

## Lưu ý:

1. Tất cả các placeholder phải được viết chính xác, phân biệt chữ hoa chữ thường
2. Các số tiền sẽ được tự động format theo chuẩn Việt Nam (dấu chấm ngăn cách hàng nghìn)
3. Các ngày tháng sẽ được format theo định dạng Việt Nam (dd/mm/yyyy)
4. File template phải là định dạng .docx (Word 2007 trở lên)

