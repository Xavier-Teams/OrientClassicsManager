# BẢNG DỰ TOÁN CHI TIẾT DỰ ÁN

## HỆ THỐNG QUẢN LÝ DỰ ÁN DỊCH THUẬT ORIENTCLASSICSMANAGER

**Căn cứ pháp lý:**

- Luật Khoa học, Công nghệ và Đổi mới sáng tạo số 93/2025/QH15
- Quyết định số 320/QĐ-BKHCN ngày 12/04/2025 của Bộ Khoa học và Công nghệ
- Thông tư hướng dẫn quản lý tài chính dự án KH&CN
- Nghị định về định mức chi phí trong lĩnh vực CNTT

**Thời gian thực hiện:** 8 tháng (từ tháng [X] đến tháng [Y] năm [Z])  
**Ngày lập dự toán:** [Ngày/Tháng/Năm]

---

## I. CHI PHÍ NHÂN LỰC

### 1.1. Công thức tính chi phí nhân công

Theo Quyết định số 320/QĐ-BKHCN:

**gnc = [(HCB + HPC) × MLCS × (1 + HĐC) + BHLĐ] × 1.2**

Trong đó:

- **MLCS**: Mức lương cơ sở = 1.800.000 VNĐ/tháng (năm 2024)
- **HĐC**: Hệ số điều chỉnh vùng = 1.0 (vùng I)
- **BHLĐ**: Bảo hiểm lao động = 22% (BHXH 17.5% + BHYT 3% + BHTN 1% + KPCĐ 2%)
- **Hệ số 1.2**: Hệ số điều chỉnh tăng thêm

### 1.2. Bảng chi phí nhân lực

| **STT** | **Chức danh**             | **Số lượng** | **Hệ số lương (HCB)** | **Lương/tháng (VNĐ)** | **Thời gian (tháng)** | **Thành tiền (VNĐ)** | **Ghi chú**                                             |
| ------- | ------------------------- | ------------ | --------------------- | --------------------- | --------------------- | -------------------- | ------------------------------------------------------- |
| 1       | **Quản lý dự án (PM)**    | 1            | 6.2                   | 15.000.000            | 8                     | 120.000.000          | Phụ trách toàn bộ dự án, quản lý tiến độ, chất lượng    |
| 2       | **Full-stack Developer**  | 3            | 5.5                   | 12.000.000            | 8                     | 288.000.000          | Phát triển Frontend (React) và Backend (Express/Django) |
| 3       | **DevOps Engineer**       | 1            | 5.8                   | 13.000.000            | 6                     | 78.000.000           | Setup infrastructure, CI/CD, Docker, monitoring         |
| 4       | **Business Analyst (BA)** | 1            | 5.0                   | 11.000.000            | 6                     | 66.000.000           | Phân tích nghiệp vụ, thiết kế quy trình, tài liệu       |
| 5       | **QA Tester**             | 1            | 4.5                   | 10.000.000            | 4                     | 40.000.000           | Kiểm thử chức năng, hiệu năng, bảo mật                  |
| 6       | **UI/UX Designer**        | 1            | 4.8                   | 10.500.000            | 3                     | 31.500.000           | Thiết kế giao diện, trải nghiệm người dùng              |
| 7       | **Chuyên gia tư vấn**     | 1            | 7.0                   | 16.000.000            | 1                     | 16.000.000           | Tư vấn kiến trúc, bảo mật, best practices               |

**Tổng chi phí nhân lực (chưa VAT):** **640.500.000 VNĐ**

**Chi phí bảo hiểm và phụ cấp (22%):** 140.910.000 VNĐ  
**Hệ số điều chỉnh (1.2):** 168.000.000 VNĐ

**TỔNG CHI PHÍ NHÂN LỰC:** **949.410.000 VNĐ**

---

## II. CHI PHÍ THIẾT BỊ VÀ PHẦN CỨNG

| **STT** | **Hạng mục**                    | **Thông số kỹ thuật**                    | **Số lượng** | **Đơn giá (VNĐ)** | **Thành tiền (VNĐ)** | **Ghi chú**                       |
| ------- | ------------------------------- | ---------------------------------------- | ------------ | ----------------- | -------------------- | --------------------------------- |
| 1       | **Máy chủ Production**          | CPU: 16 cores, RAM: 64GB, SSD: 1TB, RAID | 1            | 80.000.000        | 80.000.000           | Server chính cho production       |
| 2       | **Máy chủ Development/Staging** | CPU: 8 cores, RAM: 32GB, SSD: 500GB      | 1            | 50.000.000        | 50.000.000           | Server cho dev và staging         |
| 3       | **Máy tính phát triển**         | CPU: Intel i7, RAM: 16GB, SSD: 512GB     | 5            | 25.000.000        | 125.000.000          | Máy tính cho developers           |
| 4       | **Máy tính cho PM/BA**          | CPU: Intel i5, RAM: 8GB, SSD: 256GB      | 2            | 18.000.000        | 36.000.000           | Máy tính cho quản lý và phân tích |
| 5       | **Thiết bị mạng**               | Router, Switch, Firewall                 | 1 bộ         | 35.000.000        | 35.000.000           | Thiết bị mạng và bảo mật          |
| 6       | **UPS (Bộ lưu điện)**           | 3KVA, Online                             | 2            | 15.000.000        | 30.000.000           | Bảo vệ nguồn điện                 |
| 7       | **Thiết bị lưu trữ dự phòng**   | NAS 4TB                                  | 1            | 20.000.000        | 20.000.000           | Backup và lưu trữ                 |
| 8       | **Thiết bị phụ trợ**            | Monitor, Keyboard, Mouse, Webcam         | 7 bộ         | 5.000.000         | 35.000.000           | Thiết bị phụ trợ                  |

**TỔNG CHI PHÍ THIẾT BỊ VÀ PHẦN CỨNG:** **411.000.000 VNĐ**

---

## III. CHI PHÍ PHẦN MỀM VÀ BẢN QUYỀN

| **STT** | **Hạng mục**                | **Mô tả**                                        | **Số lượng** | **Đơn giá (VNĐ)** | **Thành tiền (VNĐ)** | **Ghi chú**                    |
| ------- | --------------------------- | ------------------------------------------------ | ------------ | ----------------- | -------------------- | ------------------------------ |
| 1       | **Hệ điều hành máy chủ**    | Windows Server 2022 Standard                     | 2 license    | 18.000.000        | 36.000.000           | Hoặc Linux (miễn phí)          |
| 2       | **Database License**        | PostgreSQL (Open Source - miễn phí)              | -            | 0                 | 0                    | Sử dụng PostgreSQL open-source |
| 3       | **Công cụ phát triển**      | JetBrains All Products Pack (1 năm)              | 5 license    | 8.000.000         | 40.000.000           | IDE cho developers             |
| 4       | **Phần mềm thiết kế UI/UX** | Adobe Creative Cloud (1 năm)                     | 1 license    | 15.000.000        | 15.000.000           | Photoshop, Illustrator, XD     |
| 5       | **Phần mềm quản lý dự án**  | Jira + Confluence (1 năm)                        | 1 license    | 12.000.000        | 12.000.000           | Quản lý dự án và tài liệu      |
| 6       | **Phần mềm monitoring**     | Grafana Cloud hoặc tự host (miễn phí)            | -            | 0                 | 0                    | Monitoring và logging          |
| 7       | **N8N License**             | N8N Community (Open Source - miễn phí)           | -            | 0                 | 0                    | Workflow automation            |
| 8       | **Mattermost License**      | Mattermost Team Edition (Open Source - miễn phí) | -            | 0                 | 0                    | Team collaboration             |
| 9       | **Phần mềm bảo mật**        | Antivirus, Firewall software                     | 1 bộ         | 10.000.000        | 10.000.000           | Bảo mật hệ thống               |
| 10      | **Phần mềm backup**         | Backup software license                          | 1 license    | 8.000.000         | 8.000.000            | Phần mềm backup tự động        |

**TỔNG CHI PHÍ PHẦN MỀM VÀ BẢN QUYỀN:** **131.000.000 VNĐ**

---

## IV. CHI PHÍ HẠ TẦNG VÀ HOSTING

| **STT** | **Hạng mục**             | **Mô tả**                       | **Thời gian** | **Đơn giá (VNĐ)** | **Thành tiền (VNĐ)** | **Ghi chú**               |
| ------- | ------------------------ | ------------------------------- | ------------- | ----------------- | -------------------- | ------------------------- |
| 1       | **Hosting/Cloud Server** | VPS/Cloud server cho production | 12 tháng      | 5.000.000/tháng   | 60.000.000           | Hoặc self-hosted          |
| 2       | **Domain và SSL**        | Tên miền và chứng chỉ SSL       | 3 năm         | 2.000.000/năm     | 6.000.000            | Domain và SSL certificate |
| 3       | **CDN và Bandwidth**     | CDN và băng thông               | 12 tháng      | 2.000.000/tháng   | 24.000.000           | Tăng tốc độ và băng thông |
| 4       | **Email Service**        | Email doanh nghiệp              | 12 tháng      | 1.000.000/tháng   | 12.000.000           | Email cho team            |
| 5       | **Backup Storage**       | Dịch vụ lưu trữ backup          | 12 tháng      | 1.500.000/tháng   | 18.000.000           | Backup cloud storage      |
| 6       | **Internet và điện**     | Chi phí internet và điện        | 8 tháng       | 3.000.000/tháng   | 24.000.000           | Chi phí vận hành          |

**TỔNG CHI PHÍ HẠ TẦNG VÀ HOSTING:** **144.000.000 VNĐ**

---

## V. CHI PHÍ ĐÀO TẠO VÀ HỖ TRỢ

| **STT** | **Hạng mục**                  | **Mô tả**                              | **Số lượng** | **Đơn giá (VNĐ)** | **Thành tiền (VNĐ)** | **Ghi chú**                   |
| ------- | ----------------------------- | -------------------------------------- | ------------ | ----------------- | -------------------- | ----------------------------- |
| 1       | **Đào tạo người dùng**        | Đào tạo sử dụng hệ thống cho end-users | 2 khóa       | 15.000.000        | 30.000.000           | Đào tạo cho 20-30 người       |
| 2       | **Đào tạo quản trị hệ thống** | Đào tạo quản trị và bảo trì            | 1 khóa       | 20.000.000        | 20.000.000           | Đào tạo cho admin             |
| 3       | **Tài liệu hướng dẫn**        | Biên soạn và in ấn tài liệu            | 50 bộ        | 200.000           | 10.000.000           | Sách hướng dẫn sử dụng        |
| 4       | **Hỗ trợ kỹ thuật**           | Hỗ trợ kỹ thuật sau triển khai         | 6 tháng      | 5.000.000/tháng   | 30.000.000           | Hỗ trợ 24/7 trong 6 tháng đầu |
| 5       | **Workshop và hội thảo**      | Workshop giới thiệu hệ thống           | 2 buổi       | 10.000.000        | 20.000.000           | Workshop cho stakeholders     |

**TỔNG CHI PHÍ ĐÀO TẠO VÀ HỖ TRỢ:** **110.000.000 VNĐ**

---

## VI. CHI PHÍ KHÁC

| **STT** | **Hạng mục**                        | **Mô tả**                       | **Số lượng** | **Đơn giá (VNĐ)** | **Thành tiền (VNĐ)** | **Ghi chú**                   |
| ------- | ----------------------------------- | ------------------------------- | ------------ | ----------------- | -------------------- | ----------------------------- |
| 1       | **Văn phòng phẩm**                  | Giấy, mực in, bút, folder...    | 1 bộ         | 5.000.000         | 5.000.000            | Văn phòng phẩm cho dự án      |
| 2       | **Chi phí đi lại**                  | Công tác phí, xăng xe           | 1 gói        | 15.000.000        | 15.000.000           | Chi phí đi lại cho team       |
| 3       | **Chi phí ăn uống**                 | Ăn trưa, nước uống cho team     | 8 tháng      | 2.000.000/tháng   | 16.000.000           | Chi phí ăn uống trong dự án   |
| 4       | **Chi phí họp và hội thảo**         | Phòng họp, thiết bị trình chiếu | 20 buổi      | 500.000           | 10.000.000           | Chi phí họp định kỳ           |
| 5       | **Chi phí marketing/truyền thông**  | Quảng bá dự án, báo cáo         | 1 gói        | 10.000.000        | 10.000.000           | Marketing và truyền thông     |
| 6       | **Chi phí kiểm định và nghiệm thu** | Chi phí kiểm định chất lượng    | 1 lần        | 20.000.000        | 20.000.000           | Kiểm định và nghiệm thu dự án |
| 7       | **Chi phí pháp lý**                 | Tư vấn pháp lý, đăng ký         | 1 gói        | 10.000.000        | 10.000.000           | Tư vấn pháp lý và đăng ký     |

**TỔNG CHI PHÍ KHÁC:** **86.000.000 VNĐ**

---

## VII. CHI PHÍ QUẢN LÝ DỰ ÁN

Theo quy định, chi phí quản lý dự án được tính bằng **5-10%** tổng chi phí trực tiếp.

**Tổng chi phí trực tiếp (I + II + III + IV + V + VI):**

- Chi phí nhân lực: 949.410.000 VNĐ
- Chi phí thiết bị: 411.000.000 VNĐ
- Chi phí phần mềm: 131.000.000 VNĐ
- Chi phí hạ tầng: 144.000.000 VNĐ
- Chi phí đào tạo: 110.000.000 VNĐ
- Chi phí khác: 86.000.000 VNĐ

**Tổng chi phí trực tiếp:** **1.831.410.000 VNĐ**

**Chi phí quản lý dự án (7%):** **128.199.000 VNĐ**

---

## VIII. CHI PHÍ DỰ PHÒNG

Theo quy định, chi phí dự phòng được tính bằng **10-15%** tổng chi phí (bao gồm cả chi phí quản lý).

**Tổng chi phí (chưa dự phòng):** **1.959.609.000 VNĐ**

**Chi phí dự phòng (10%):** **195.961.000 VNĐ**

---

## IX. TỔNG HỢP DỰ TOÁN

| **STT** | **Hạng mục**                  | **Thành tiền (VNĐ)** | **Tỷ lệ (%)** |
| ------- | ----------------------------- | -------------------- | ------------- |
| I       | Chi phí nhân lực              | 949.410.000          | 44.1%         |
| II      | Chi phí thiết bị và phần cứng | 411.000.000          | 19.1%         |
| III     | Chi phí phần mềm và bản quyền | 131.000.000          | 6.1%          |
| IV      | Chi phí hạ tầng và hosting    | 144.000.000          | 6.7%          |
| V       | Chi phí đào tạo và hỗ trợ     | 110.000.000          | 5.1%          |
| VI      | Chi phí khác                  | 86.000.000           | 4.0%          |
| VII     | Chi phí quản lý dự án (7%)    | 128.199.000          | 6.0%          |
| VIII    | Chi phí dự phòng (10%)        | 195.961.000          | 9.1%          |
|         | **TỔNG CỘNG (chưa VAT)**      | **2.155.570.000**    | **100%**      |
| IX      | **Thuế VAT (10%)**            | **215.557.000**      | -             |
|         | **TỔNG CỘNG (có VAT)**        | **2.371.127.000**    | -             |

---

## X. PHÂN BỔ CHI PHÍ THEO GIAI ĐOẠN

| **Giai đoạn**                            | **Thời gian** | **Chi phí (VNĐ)** | **Tỷ lệ (%)** | **Ghi chú**                      |
| ---------------------------------------- | ------------- | ----------------- | ------------- | -------------------------------- |
| **Giai đoạn 1: Phân tích và thiết kế**   | 2 tháng       | 538.892.000       | 25.0%         | BA, PM, thiết kế UI/UX           |
| **Giai đoạn 2: Phát triển core**         | 3 tháng       | 862.228.000       | 40.0%         | Developers, thiết bị, phần mềm   |
| **Giai đoạn 3: Tự động hóa và tích hợp** | 2 tháng       | 431.114.000       | 20.0%         | DevOps, tích hợp N8N, Mattermost |
| **Giai đoạn 4: Kiểm thử và hoàn thiện**  | 1 tháng       | 323.336.000       | 15.0%         | QA, đào tạo, nghiệm thu          |
| **TỔNG CỘNG**                            | **8 tháng**   | **2.155.570.000** | **100%**      |                                  |

---

## XI. GHI CHÚ VÀ ĐIỀU KHOẢN

### 11.1. Ghi chú

1. **Mức lương cơ sở**: Áp dụng mức lương cơ sở 1.800.000 VNĐ/tháng (năm 2024). Nếu có thay đổi, sẽ điều chỉnh theo quy định.
2. **Tỷ giá**: Tất cả chi phí tính bằng VNĐ. Nếu có chi phí bằng ngoại tệ, quy đổi theo tỷ giá tại thời điểm thanh toán.
3. **Thời gian thanh toán**: Thanh toán theo tiến độ dự án, mỗi giai đoạn thanh toán 25% tổng giá trị.
4. **Bảo hành**: Hệ thống được bảo hành 12 tháng kể từ ngày nghiệm thu.
5. **Hỗ trợ kỹ thuật**: Hỗ trợ kỹ thuật miễn phí trong 6 tháng đầu, sau đó tính phí theo thỏa thuận.

### 11.2. Điều chỉnh dự toán

- Dự toán có thể được điều chỉnh trong phạm vi ±10% mà không cần phê duyệt lại.
- Điều chỉnh >10% cần có sự phê duyệt của cơ quan có thẩm quyền.

### 11.3. Căn cứ pháp lý

- Luật Khoa học, Công nghệ và Đổi mới sáng tạo số 93/2025/QH15
- Quyết định số 320/QĐ-BKHCN ngày 12/04/2025
- Thông tư hướng dẫn quản lý tài chính dự án KH&CN
- Nghị định về định mức chi phí trong lĩnh vực CNTT

---

## XII. XÁC NHẬN

**Người lập dự toán:**  
[Chữ ký và họ tên]

**Người phê duyệt:**  
[Chữ ký và họ tên]

**Đơn vị thực hiện:**  
[Đơn vị]

**Ngày lập:** [Ngày/Tháng/Năm]

---

**TỔNG KẾT:**

- **Tổng chi phí (chưa VAT):** 2.155.570.000 VNĐ
- **Thuế VAT (10%):** 215.557.000 VNĐ
- **TỔNG CHI PHÍ (có VAT):** **2.371.127.000 VNĐ**

_(Hai tỷ ba trăm bảy mươi mốt triệu một trăm hai mươi bảy nghìn đồng chẵn)_
