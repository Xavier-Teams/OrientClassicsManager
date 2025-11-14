# **TÀI LIỆU BA HOÀN THIỆN**
## **HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG**
### *(Giai đoạn 2: Quản lý Tiến độ Chuyên môn & Quản lý Hành chính)*

---

## **1. TỔNG QUAN DỰ ÁN**

Hệ thống phần mềm phục vụ Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông (Giai đoạn 2) được xây dựng nhằm số hoá toàn bộ quy trình triển khai, theo dõi, thẩm định và nghiệm thu bản dịch.

Giai đoạn 2 tập trung vào:

- **Quản lý tiến độ các nhiệm vụ chuyên môn**
- **Quản lý hành chính**

**Thời gian:** 06 tháng (06/2024 – 12/2024)  
**Phạm vi:** Triển khai trên trang web phần mềm hỗ trợ dịch thuật.

---

## **2. MỤC TIÊU HỆ THỐNG 🎯**

### **Mục tiêu tổng quát**
Bổ sung tính năng quản lý các công việc chuyên môn, rút ngắn thời gian xử lý, bảo mật tốt hơn.

### **Mục tiêu cụ thể**
1. Chuẩn hóa quy trình từ đề xuất → quyết toán → biên tập → xuất bản.  
2. Xây dựng **Hệ thống quản lý Quy trình & Biểu mẫu**.  
3. Chức năng **Báo cáo tiến độ công việc** & **Quản lý yêu cầu thanh toán**.  
4. Tích hợp **Cổng thông tin + khai thác AI (LLM)**.

---

## **3. PHẠM VI NGHIỆP VỤ ĐƯỢC SỐ HÓA**

### **3.1 – 3.7. Các nghiệp vụ dịch thuật & thẩm định (Đã có GĐ1)**

Bao gồm từ lên danh sách tác phẩm → nghiệp thu cấp Dự án → quyết toán hợp đồng.

---

### **3.8. Quản lý Hiệu đính – Biên tập – Xuất bản 📚**

#### **V. Hiệu đính**

- Chuyên gia nhận file bản nền  
- Thư ký chuẩn bị hồ sơ hiệu đính  
- Chuyên gia gửi Phiếu đánh giá  
- Thư ký tính tỷ lệ, thanh toán  
- BTV tiếp nhận bản đã hiệu đính  

#### **VI. Biên tập**

**1. Thiết kế bìa:**  
BTV gửi thông tin bìa cho Họa sĩ trước bông 1.

**2. Biên tập thô (BTV2):**  
Track changes trên Word, kiểm tra chính tả, morat, chú thích, TLTK.

**3. Biên tập bông 1 (BTV1):**  
Biên tập chuyên môn, viết Phiếu bông 1, gửi file cho KTV.

**4. Mi trang (KTV):**  
Thiết kế InDesign, ra bông 2.

**5. Biên tập bông 2:**  
Trên bản in giấy, sau đó BTV2 chỉnh trên InDesign → ra bông 3.

**6. Chốt thông tin xuất bản**  
**7. Đọc duyệt bông 3**, sửa → ra bông 4 (gửi NXB xin giấy phép).

#### **VII. Xin giấy phép & chuyển in**

1. In và gửi NXB xin phép  
2. Hoàn thiện bản thảo trình ký  
3. Ký duyệt chuyển in  
4. Thủ tục chuyển in  
5. Kiểm tra file cuối  
6. Giao in

#### **VIII. Kiểm tra chất lượng xuất bản phẩm**

1. Đọc đính chính  
2. Đọc lưu chiểu  
3. Lưu hồ sơ biên tập  

---

### **3.9. Quản lý Hành chính (Bổ sung Giai đoạn 2)**

1. **Hệ thống Quy trình – Biểu mẫu**  
2. **Báo cáo tiến độ công việc**  
3. **Quản lý yêu cầu thanh toán, theo dõi tiến độ thanh toán**

---

## **4. CÁC VAI TRÒ NGƯỜI DÙNG**

Danh sách vai trò:  
Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký, Thư ký hợp phần, Văn phòng, Kế toán, Văn thư, BTV, KTV, Dịch giả.

### **Quyền hạn mở rộng (GĐ2)**

| Vai trò | Quyền hạn |
|--------|------------|
| Trưởng ban Thư ký | Kiểm duyệt hồ sơ, ký, phối hợp biên tập – mi trang |
| Chánh Văn phòng | Quản lý hành chính, xin giấy phép, chuyển in |
| Kế toán | Theo dõi thanh toán/quyết toán |
| Văn thư | Lưu trữ hồ sơ hành chính |
| BTV | Biên tập Thô + bông 1,2,3, ký duyệt |
| KTV | Xử lý hình ảnh, InDesign, kiểm soát file chuyển in |
| Dịch giả | Ký xác nhận bản thảo |

---

## **5. LUỒNG QUY TRÌNH NGHIỆP VỤ**

**Tổng luồng:**  
`Danh sách tác phẩm → Phê duyệt → Dịch thử → Ký HĐ → Triển khai → Kiểm tra tiến độ → Thẩm định → Nghiệm thu → Hiệu đính → Biên tập → Xuất bản`

---

## **6. YÊU CẦU CHỨC NĂNG (GIAI ĐOẠN 2)**

### **6.1. Module Tác phẩm & Tài liệu Dịch thuật**

- Metadata chi tiết  
- Quản lý bản nền  
- Lịch sử dịch thuật  

### **6.2. Module Hợp đồng & Thanh toán**

- Trạng thái hợp đồng  
- Tạo hồ sơ thanh toán tự động  
- Theo dõi tiến độ thanh toán  

### **6.3. Module Tiến độ & Thẩm định**

- Tính toán tiến độ tự động  
- Phản biện kín (ẩn danh reviewer)  
- Chuyển trạng thái nhiệm vụ  

### **6.4. Module Quản lý Hành chính**

- Quản lý biểu mẫu, quy trình, phiên bản  
- Xuất Word/PDF/XLSX  
- Giao nhiệm vụ  
- Báo cáo định kỳ  

### **6.5. Module Biên tập & Xuất bản**  
*(Đã tích hợp từ lần trước)*

### **6.6. Cổng thông tin & AI**

- Cổng truy cập web/app  
- Tích hợp LLM hỗ trợ dịch thuật  
- Lưu trữ, thống kê dữ liệu  

---

## **7. YÊU CẦU PHI CHỨC NĂNG**

- **Công nghệ tiên tiến**  
- **Hiệu năng cao**  
- **Bảo mật**  
- **Tính mở & khả năng tích hợp API**  
- **Độ ổn định, dự phòng**  
- **Tối ưu chi phí**  

---

## **8. DATA MODEL (CẬP NHẬT)**

### **8.6. Bảng `editing_tasks` (Nhiệm vụ biên tập)**

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| step_name | TEXT | Hiệu đính, Bông 1/2/3, Trình ký... |
| assigned_role | TEXT | BTV1, BTV2, KTV… |
| task_file | TEXT | Link file Word/PDF/ID |

---

### **8.8. Bảng `administrative_tasks` (Nhiệm vụ hành chính)**

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| task_id | INT | Tự sinh |
| task_detail | TEXT | Chi tiết |
| assigned_member | TEXT | Người được giao |
| due_date | DATE | Deadline |
| status | TEXT | Đã xử lý / Chưa xử lý / Từ chối |
| manager_id | INT | Người giao việc |

---

### **8.9. Bảng `form_templates` (Biểu mẫu)**

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| template_name | TEXT | Tên biểu mẫu |
| template_file | TEXT | File mẫu |
| is_active | BOOLEAN | Phiên bản đang dùng |

---

## **9. BÁO CÁO & DASHBOARD**

- Dashboard tiến độ  
- Báo cáo trạng thái  
- Báo cáo chi phí  
- Báo cáo tuần/tháng/quý/năm  

---

## **10. KẾT LUẬN**

Tài liệu BA đã hoàn thiện, mô tả đầy đủ quy trình biên tập – xuất bản và hai nhóm tính năng trọng tâm của Giai đoạn 2: **Quản lý Tiến độ Chuyên môn** và **Quản lý Hành chính**.  
Là cơ sở xây dựng thiết kế kỹ thuật với **tính mở – ổn định – hiệu năng cao**.
