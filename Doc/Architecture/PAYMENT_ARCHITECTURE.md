# Kiến trúc Hệ thống Thanh toán

## Tổng quan

Hệ thống thanh toán được thiết kế với **1 trang thanh toán duy nhất** kết hợp với:
- **Filter/Tab theo nhóm công việc** (Dịch thuật, Biên tập, CNTT, v.v.)
- **Phân quyền chi tiết** theo từng nhóm công việc
- **Cấu hình linh hoạt** cho các hạng mục thanh toán

## Cấu trúc Dữ liệu

### Payment Model (Backend)

```python
class Payment(models.Model):
    """Thanh toán tổng quát cho tất cả các nhóm công việc"""
    
    WORK_GROUP_CHOICES = [
        ('dich_thuat', 'Dịch thuật'),
        ('bien_tap', 'Biên tập'),
        ('cntt', 'CNTT'),
        ('hanh_chinh', 'Hành chính'),
        ('khac', 'Khác'),
    ]
    
    # Thông tin cơ bản
    work_group = models.CharField(max_length=50, choices=WORK_GROUP_CHOICES)
    payment_category = models.CharField(max_length=100)  # Hạng mục thanh toán
    payment_type = models.CharField(max_length=50)  # Loại thanh toán
    
    # Liên kết với đối tượng liên quan
    contract = models.ForeignKey('contracts.Contract', null=True, blank=True)
    work = models.ForeignKey('works.TranslationWork', null=True, blank=True)
    review = models.ForeignKey('reviews.Review', null=True, blank=True)
    editing = models.ForeignKey('editing.Editing', null=True, blank=True)
    
    # Thông tin thanh toán
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='VND')
    description = models.TextField(blank=True)
    
    # Người nhận thanh toán
    recipient = models.ForeignKey(User, related_name='received_payments')
    recipient_type = models.CharField(max_length=50)  # 'translator', 'expert', 'editor', etc.
    
    # Trạng thái và thời gian
    status = models.CharField(max_length=20)
    request_date = models.DateField()
    approved_date = models.DateField(null=True, blank=True)
    paid_date = models.DateField(null=True, blank=True)
    
    # Phê duyệt
    requested_by = models.ForeignKey(User, related_name='requested_payments')
    approved_by = models.ForeignKey(User, null=True, blank=True, related_name='approved_payments')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Payment Category Configuration

```python
class PaymentCategoryConfig(models.Model):
    """Cấu hình hạng mục thanh toán cho từng nhóm công việc"""
    
    work_group = models.CharField(max_length=50)
    category_code = models.CharField(max_length=100)
    category_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Phân quyền
    can_view_roles = models.JSONField(default=list)  # Danh sách roles có thể xem
    can_create_roles = models.JSONField(default=list)  # Danh sách roles có thể tạo
    can_approve_roles = models.JSONField(default=list)  # Danh sách roles có thể phê duyệt
    
    # Cấu hình khác
    requires_approval = models.BooleanField(default=True)
    approval_workflow = models.JSONField(default=dict)  # Quy trình phê duyệt
    
    is_active = models.BooleanField(default=True)
```

## Ví dụ Cấu hình Hạng mục Thanh toán

### Nhóm: Dịch thuật
- **Chi phí dịch thuật**: Tạm ứng lần 1, Tạm ứng lần 2, Quyết toán
- **Chi phí thẩm định**: Thẩm định dịch thử, Thẩm định chuyên gia
- **Chi phí hiệu đính**: Hiệu đính bản dịch
- **Chi phí họp**: Họp thường trực, Họp nghiệm thu

### Nhóm: Biên tập
- **Chi phí biên tập**: Biên tập thô, Bông 1, Bông 2, Bông 3, Bông 4
- **Chi phí dàn trang**: Dàn trang, Mi trang
- **Chi phí thiết kế**: Thiết kế bìa, Thiết kế nội dung

### Nhóm: CNTT
- **Chi phí phát triển**: Phát triển hệ thống, Bảo trì
- **Chi phí quét trùng lặp**: Quét và phân tích

## Phân quyền

### Quy tắc Phân quyền

1. **Xem thanh toán**:
   - Kế toán: Xem tất cả
   - Chủ nhiệm/Trưởng ban: Xem tất cả
   - Trưởng nhóm: Xem thanh toán trong nhóm của mình
   - Người dùng thường: Chỉ xem thanh toán của mình

2. **Tạo yêu cầu thanh toán**:
   - Mỗi nhóm có roles riêng được cấu hình trong `PaymentCategoryConfig`

3. **Phê duyệt thanh toán**:
   - Kế toán: Phê duyệt tất cả
   - Chủ nhiệm: Phê duyệt các khoản lớn
   - Trưởng nhóm: Phê duyệt trong nhóm của mình

### Implementation

```python
class PaymentPermission(permissions.BasePermission):
    """Permission class cho Payment"""
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True
        
        # Xem danh sách: Tất cả authenticated users
        if view.action in ['list', 'retrieve']:
            return True
        
        # Tạo: Kiểm tra theo work_group và category
        if view.action == 'create':
            work_group = request.data.get('work_group')
            category = request.data.get('payment_category')
            return self._can_create(user, work_group, category)
        
        # Phê duyệt: Kiểm tra theo category config
        if view.action == 'approve':
            return self._can_approve(user, view.get_object())
        
        return False
    
    def _can_create(self, user, work_group, category):
        """Kiểm tra user có thể tạo thanh toán không"""
        config = PaymentCategoryConfig.objects.filter(
            work_group=work_group,
            category_code=category,
            is_active=True
        ).first()
        
        if not config:
            return False
        
        return user.role in config.can_create_roles
    
    def _can_approve(self, user, payment):
        """Kiểm tra user có thể phê duyệt không"""
        config = PaymentCategoryConfig.objects.filter(
            work_group=payment.work_group,
            category_code=payment.payment_category,
            is_active=True
        ).first()
        
        if not config:
            return False
        
        return user.role in config.can_approve_roles
```

## Frontend Structure

### Trang Thanh toán (`/payments`)

```typescript
// Cấu trúc component
<PaymentsPage>
  <PaymentFilters>
    - Filter theo Work Group (Tab)
    - Filter theo Category
    - Filter theo Status
    - Filter theo Date Range
  </PaymentFilters>
  
  <PaymentSummary>
    - Tổng quan theo từng nhóm
    - Thống kê theo trạng thái
  </PaymentSummary>
  
  <PaymentList>
    - Danh sách thanh toán (filtered)
    - Actions: View, Approve, Reject (theo quyền)
  </PaymentList>
  
  <PaymentForm>
    - Form tạo thanh toán mới
    - Dynamic fields theo work_group và category
  </PaymentForm>
</PaymentsPage>
```

### Tabs theo Work Group

```typescript
const WORK_GROUP_TABS = [
  { id: 'all', label: 'Tất cả', icon: List },
  { id: 'dich_thuat', label: 'Dịch thuật', icon: BookOpen },
  { id: 'bien_tap', label: 'Biên tập', icon: Edit3 },
  { id: 'cntt', label: 'CNTT', icon: Code },
  { id: 'hanh_chinh', label: 'Hành chính', icon: Briefcase },
];
```

## Workflow Thanh toán

1. **Tạo yêu cầu**:
   - User có quyền tạo yêu cầu thanh toán
   - Chọn work_group và category
   - Điền thông tin thanh toán
   - Submit → Status: "pending"

2. **Phê duyệt**:
   - User có quyền phê duyệt xem và phê duyệt
   - Có thể approve hoặc reject
   - Approve → Status: "approved"
   - Reject → Status: "rejected"

3. **Thanh toán**:
   - Kế toán thực hiện thanh toán
   - Cập nhật paid_date
   - Status: "paid"

## Lợi ích của Kiến trúc này

1. **Tập trung**: Tất cả thanh toán ở một nơi, dễ quản lý
2. **Linh hoạt**: Dễ thêm nhóm/hạng mục mới qua config
3. **Bảo mật**: Phân quyền chi tiết theo từng category
4. **Mở rộng**: Dễ thêm tính năng mới (export, report, v.v.)
5. **UX tốt**: Người dùng chỉ cần học một giao diện

## Migration Path

1. Tạo Payment model mới
2. Tạo PaymentCategoryConfig model
3. Migrate dữ liệu từ hệ thống cũ (nếu có)
4. Implement permissions
5. Update frontend với tabs và filters
6. Test và deploy

