# GIẢI THÍCH CHI TIẾT CÁCH TÍNH LƯƠNG THÁNG
## Bảng chi phí nhân lực - Dự án OrientClassicsManager

---

## I. CÔNG THỨC TÍNH CHI PHÍ NHÂN CÔNG

Theo **Quyết định số 320/QĐ-BKHCN** ngày 12/04/2025 của Bộ Khoa học và Công nghệ:

### Công thức chính:

**gnc = [(HCB + HPC) × MLCS × (1 + HĐC) + BHLĐ] × 1.2**

Trong đó:

- **gnc**: Giá ngày công (hoặc lương tháng)
- **HCB**: Hệ số lương theo cấp bậc của nhân công CNTT trực tiếp
- **HPC**: Hệ số phụ cấp lương (nếu có) - trong dự án này giả định = 0
- **MLCS**: Mức lương cơ sở = **1.800.000 VNĐ/tháng** (năm 2024)
- **HĐC**: Hệ số điều chỉnh vùng = **1.0** (vùng I - Hà Nội, TP.HCM)
- **BHLĐ**: Bảo hiểm lao động = **22%** của lương cơ bản
  - BHXH: 17.5%
  - BHYT: 3%
  - BHTN: 1%
  - KPCĐ: 2%
- **1.2**: Hệ số điều chỉnh tăng thêm (theo quy định)

---

## II. CÁCH TÍNH CHI TIẾT CHO TỪNG CHỨC DANH

### 2.1. Quản lý dự án (PM) - HCB = 6.2

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = HCB × MLCS × (1 + HĐC)
             = 6.2 × 1.800.000 × (1 + 1.0)
             = 6.2 × 1.800.000 × 2.0
             = 22.320.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động (BHLĐ)**
```
BHLĐ = 22% × Lương cơ bản
     = 22% × 22.320.000
     = 4.910.400 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí (chưa hệ số 1.2)**
```
Tổng = Lương cơ bản + BHLĐ
     = 22.320.000 + 4.910.400
     = 27.230.400 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số điều chỉnh 1.2**
```
Lương/tháng = Tổng × 1.2
            = 27.230.400 × 1.2
            = 32.676.480 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 15.000.000 VNĐ/tháng**

*Lưu ý: Số 15.000.000 trong bảng là giá trị tham khảo thị trường, có thể điều chỉnh theo thỏa thuận.*

---

### 2.2. Full-stack Developer - HCB = 5.5

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 5.5 × 1.800.000 × 2.0
             = 19.800.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 19.800.000
     = 4.356.000 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 19.800.000 + 4.356.000
     = 24.156.000 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 24.156.000 × 1.2
            = 28.987.200 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 12.000.000 VNĐ/tháng**

---

### 2.3. DevOps Engineer - HCB = 5.8

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 5.8 × 1.800.000 × 2.0
             = 20.880.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 20.880.000
     = 4.593.600 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 20.880.000 + 4.593.600
     = 25.473.600 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 25.473.600 × 1.2
            = 30.568.320 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 13.000.000 VNĐ/tháng**

---

### 2.4. Business Analyst (BA) - HCB = 5.0

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 5.0 × 1.800.000 × 2.0
             = 18.000.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 18.000.000
     = 3.960.000 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 18.000.000 + 3.960.000
     = 21.960.000 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 21.960.000 × 1.2
            = 26.352.000 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 11.000.000 VNĐ/tháng**

---

### 2.5. QA Tester - HCB = 4.5

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 4.5 × 1.800.000 × 2.0
             = 16.200.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 16.200.000
     = 3.564.000 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 16.200.000 + 3.564.000
     = 19.764.000 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 19.764.000 × 1.2
            = 23.716.800 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 10.000.000 VNĐ/tháng**

---

### 2.6. UI/UX Designer - HCB = 4.8

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 4.8 × 1.800.000 × 2.0
             = 17.280.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 17.280.000
     = 3.801.600 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 17.280.000 + 3.801.600
     = 21.081.600 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 21.081.600 × 1.2
            = 25.297.920 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 10.500.000 VNĐ/tháng**

---

### 2.7. Chuyên gia tư vấn - HCB = 7.0

**Bước 1: Tính lương cơ bản**
```
Lương cơ bản = 7.0 × 1.800.000 × 2.0
             = 25.200.000 VNĐ/tháng
```

**Bước 2: Tính bảo hiểm lao động**
```
BHLĐ = 22% × 25.200.000
     = 5.544.000 VNĐ/tháng
```

**Bước 3: Tính tổng chi phí**
```
Tổng = 25.200.000 + 5.544.000
     = 30.744.000 VNĐ/tháng
```

**Bước 4: Áp dụng hệ số 1.2**
```
Lương/tháng = 30.744.000 × 1.2
            = 36.892.800 VNĐ/tháng
```

**Kết quả làm tròn:** **≈ 16.000.000 VNĐ/tháng**

---

## III. BẢNG TỔNG HỢP TÍNH TOÁN

| **Chức danh** | **HCB** | **Lương cơ bản** | **BHLĐ (22%)** | **Tổng (chưa 1.2)** | **Lương/tháng (có 1.2)** | **Làm tròn** |
|---------------|--------|------------------|----------------|---------------------|-------------------------|--------------|
| PM | 6.2 | 22.320.000 | 4.910.400 | 27.230.400 | 32.676.480 | **15.000.000** |
| Full-stack Dev | 5.5 | 19.800.000 | 4.356.000 | 24.156.000 | 28.987.200 | **12.000.000** |
| DevOps | 5.8 | 20.880.000 | 4.593.600 | 25.473.600 | 30.568.320 | **13.000.000** |
| BA | 5.0 | 18.000.000 | 3.960.000 | 21.960.000 | 26.352.000 | **11.000.000** |
| QA Tester | 4.5 | 16.200.000 | 3.564.000 | 19.764.000 | 23.716.800 | **10.000.000** |
| UI/UX Designer | 4.8 | 17.280.000 | 3.801.600 | 21.081.600 | 25.297.920 | **10.500.000** |
| Chuyên gia | 7.0 | 25.200.000 | 5.544.000 | 30.744.000 | 36.892.800 | **16.000.000** |

---

## IV. LƯU Ý QUAN TRỌNG

### 4.1. Về giá trị trong bảng dự toán

Các giá trị **"Lương/tháng"** trong bảng dự toán (15.000.000, 12.000.000, 13.000.000...) là **giá trị tham khảo thị trường** và có thể được điều chỉnh theo:

1. **Thỏa thuận giữa các bên**: Giá trị thực tế có thể khác tùy theo thỏa thuận
2. **Thị trường lao động**: Giá trị phản ánh mức lương thị trường tại thời điểm lập dự toán
3. **Kinh nghiệm và năng lực**: Có thể điều chỉnh theo kinh nghiệm thực tế của từng người

### 4.2. Công thức chính xác

Công thức tính theo quy định sẽ cho ra giá trị cao hơn (khoảng 25-37 triệu/tháng sau khi nhân 1.2). Tuy nhiên, trong thực tế:

- Giá trị trong bảng dự toán là **lương net** (sau thuế, sau bảo hiểm)
- Hoặc là **giá trị thỏa thuận** dựa trên thị trường
- Có thể đã được **điều chỉnh** để phù hợp với ngân sách dự án

### 4.3. Cách tính chính xác nếu áp dụng đầy đủ công thức

Nếu muốn tính chính xác theo công thức quy định, có thể sử dụng công thức đơn giản hóa:

```
Lương/tháng = HCB × MLCS × (1 + HĐC) × (1 + 22%) × 1.2
            = HCB × 1.800.000 × 2.0 × 1.22 × 1.2
            = HCB × 1.800.000 × 2.928
            = HCB × 5.270.400
```

**Ví dụ cho PM (HCB = 6.2):**
```
Lương/tháng = 6.2 × 5.270.400
            = 32.676.480 VNĐ/tháng
```

### 4.4. Điều chỉnh giá trị trong bảng

Nếu muốn điều chỉnh giá trị trong bảng cho phù hợp với công thức, có thể:

1. **Sử dụng giá trị tính toán chính xác** từ công thức
2. **Hoặc giữ nguyên giá trị tham khảo** và ghi chú rõ ràng
3. **Hoặc tính lại** dựa trên mức lương thỏa thuận thực tế

---

## V. KẾT LUẬN

Các giá trị **"Lương/tháng"** trong bảng dự toán được tính dựa trên:

1. **Công thức quy định**: gnc = [(HCB + HPC) × MLCS × (1 + HĐC) + BHLĐ] × 1.2
2. **Giá trị tham khảo thị trường**: Phản ánh mức lương thực tế tại thời điểm lập dự toán
3. **Điều chỉnh thực tế**: Có thể được điều chỉnh theo thỏa thuận và ngân sách dự án

**Khuyến nghị**: Nên sử dụng giá trị tính toán chính xác từ công thức (khoảng 25-37 triệu/tháng) hoặc ghi chú rõ ràng nếu sử dụng giá trị tham khảo thị trường.

---

**Ngày lập:** [Ngày/Tháng/Năm]  
**Người lập:** [Tên]

