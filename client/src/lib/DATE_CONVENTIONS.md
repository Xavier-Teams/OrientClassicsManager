# Quy ước Ngày Tháng - Date Conventions

## Tổng quan

Dự án này sử dụng định dạng ngày tháng **DD/MM/YYYY** (ngày/tháng/năm) theo chuẩn Việt Nam cho tất cả các giao diện người dùng và nhập liệu.

## Định dạng

### Hiển thị và Nhập liệu

- **Format**: `DD/MM/YYYY`
- **Ví dụ**: `25/11/2025`, `01/01/2024`
- **Placeholder**: `dd/mm/yyyy`

### Lưu trữ và API

- **Format**: `YYYY-MM-DD` (ISO 8601)
- **Ví dụ**: `2025-11-25`, `2024-01-01`
- Đây là format chuẩn cho HTML5 date input và API REST

## Components và Utilities

### 1. DateInput Component

**Location**: `client/src/components/ui/date-input.tsx`

Component nhập ngày tháng với định dạng DD/MM/YYYY.

**Usage**:

```tsx
import { DateInput } from "@/components/ui/date-input";

<DateInput
  value={dateValue} // YYYY-MM-DD format
  onChange={(value) => setDateValue(value)} // Returns YYYY-MM-DD
  placeholder="dd/mm/yyyy"
/>;
```

**Features**:

- Tự động format khi nhập (tự động thêm dấu `/`)
- Validate và format lại khi blur
- Convert tự động giữa DD/MM/YYYY (hiển thị) và YYYY-MM-DD (API)

### 2. DatePicker Component

**Location**: `client/src/components/ui/date-picker.tsx`

Component date picker với calendar popup và input text.

**Usage**:

```tsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  value={dateValue} // YYYY-MM-DD format
  onChange={(value) => setDateValue(value)} // Returns YYYY-MM-DD
  placeholder="dd/mm/yyyy"
/>;
```

**Features**:

- Calendar popup để chọn ngày
- Input text để nhập tay theo format DD/MM/YYYY
- Tự động convert giữa các format

### 3. Utility Functions

**Location**: `client/src/lib/utils.ts`

#### `formatDateToVietnamese(dateString: string | null | undefined): string`

Chuyển đổi từ YYYY-MM-DD sang DD/MM/YYYY.

```typescript
formatDateToVietnamese("2025-11-25"); // Returns "25/11/2025"
formatDateToVietnamese(null); // Returns ""
```

#### `parseVietnameseDate(dateString: string): string`

Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD.

```typescript
parseVietnameseDate("25/11/2025"); // Returns "2025-11-25"
parseVietnameseDate("25/11"); // Returns "" (invalid)
```

## Quy tắc Sử dụng

### 1. Khi tạo Component mới có Date Input

- **Luôn sử dụng** `DateInput` hoặc `DatePicker` từ `@/components/ui`
- **Không sử dụng** HTML5 `<input type="date">` trực tiếp
- **Placeholder** luôn là `"dd/mm/yyyy"`

### 2. Khi hiển thị ngày tháng

- **Luôn sử dụng** `formatDateToVietnamese()` để format
- Hoặc sử dụng hàm `formatDate()` local trong component (nếu có)

### 3. Khi gửi dữ liệu lên API

- **Luôn gửi** format YYYY-MM-DD
- Component `DateInput` và `DatePicker` tự động convert

### 4. Khi nhận dữ liệu từ API

- API trả về format YYYY-MM-DD
- Component tự động convert sang DD/MM/YYYY để hiển thị

## Ví dụ Implementation

### Form với Date Input

```tsx
import { DateInput } from "@/components/ui/date-input";

const [startDate, setStartDate] = useState("");

<DateInput
  value={startDate}
  onChange={(value) => setStartDate(value)}
  placeholder="dd/mm/yyyy"
/>;
```

### Hiển thị ngày tháng

```tsx
import { formatDateToVietnamese } from "@/lib/utils";

const displayDate = formatDateToVietnamese(task.start_date);
// "2025-11-25" -> "25/11/2025"
```

### Inline Editing trong Table

```tsx
import { DateInput } from "@/components/ui/date-input";

<DateInput
  value={task.start_date}
  onChange={(value) => handleUpdate(task.id, { start_date: value })}
  placeholder="dd/mm/yyyy"
  className="h-8 text-sm"
/>;
```

## Migration Guide

Nếu bạn đang migrate code cũ:

1. **Thay thế** `<Input type="date">` bằng `<DateInput>`
2. **Cập nhật** `onChange` handler để nhận string thay vì event
3. **Đảm bảo** value prop là YYYY-MM-DD format
4. **Thêm** placeholder `"dd/mm/yyyy"`

## Notes

- Tất cả date input trong dự án đều phải tuân theo quy ước này
- Backend API luôn expect và return YYYY-MM-DD format
- Frontend chỉ convert format khi hiển thị và nhập liệu
