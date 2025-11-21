from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class PaymentCategoryConfig(models.Model):
    """Cấu hình hạng mục thanh toán cho từng nhóm công việc"""
    
    WORK_GROUP_CHOICES = [
        ('dich_thuat', 'Dịch thuật'),
        ('bien_tap', 'Biên tập'),
        ('cntt', 'CNTT'),
        ('hanh_chinh', 'Hành chính'),
        ('khac', 'Khác'),
    ]
    
    work_group = models.CharField(
        max_length=50,
        choices=WORK_GROUP_CHOICES,
        verbose_name='Nhóm công việc',
        db_index=True
    )
    category_code = models.CharField(max_length=100, verbose_name='Mã hạng mục', db_index=True)
    category_name = models.CharField(max_length=200, verbose_name='Tên hạng mục')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Phân quyền
    can_view_roles = models.JSONField(
        default=list,
        verbose_name='Roles có thể xem',
        help_text='Danh sách roles có thể xem hạng mục này'
    )
    can_create_roles = models.JSONField(
        default=list,
        verbose_name='Roles có thể tạo',
        help_text='Danh sách roles có thể tạo thanh toán cho hạng mục này'
    )
    can_approve_roles = models.JSONField(
        default=list,
        verbose_name='Roles có thể phê duyệt',
        help_text='Danh sách roles có thể phê duyệt thanh toán cho hạng mục này'
    )
    
    # Cấu hình khác
    requires_approval = models.BooleanField(default=True, verbose_name='Yêu cầu phê duyệt')
    approval_workflow = models.JSONField(
        default=dict,
        verbose_name='Quy trình phê duyệt',
        help_text='Cấu hình quy trình phê duyệt (ví dụ: {"levels": 1, "auto_approve_amount": 10000000})'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'payment_category_configs'
        verbose_name = 'Cấu hình hạng mục thanh toán'
        verbose_name_plural = 'Cấu hình hạng mục thanh toán'
        ordering = ['work_group', 'category_code']
        unique_together = [['work_group', 'category_code']]
        indexes = [
            models.Index(fields=['work_group', 'is_active'], name='idx_payment_cat_work_active'),
            models.Index(fields=['category_code'], name='idx_payment_cat_code'),
        ]
    
    def __str__(self):
        return f"{self.get_work_group_display()} - {self.category_name}"


class Payment(models.Model):
    """Thanh toán tổng quát cho tất cả các nhóm công việc"""
    
    WORK_GROUP_CHOICES = [
        ('dich_thuat', 'Dịch thuật'),
        ('bien_tap', 'Biên tập'),
        ('cntt', 'CNTT'),
        ('hanh_chinh', 'Hành chính'),
        ('khac', 'Khác'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ phê duyệt'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Đã từ chối'),
        ('paid', 'Đã thanh toán'),
        ('cancelled', 'Đã hủy'),
    ]
    
    # Thông tin cơ bản
    work_group = models.CharField(
        max_length=50,
        choices=WORK_GROUP_CHOICES,
        verbose_name='Nhóm công việc',
        db_index=True
    )
    payment_category = models.CharField(
        max_length=100,
        verbose_name='Hạng mục thanh toán',
        db_index=True
    )
    payment_type = models.CharField(
        max_length=50,
        verbose_name='Loại thanh toán',
        help_text='Ví dụ: Tạm ứng lần 1, Tạm ứng lần 2, Quyết toán'
    )
    
    # Liên kết với đối tượng liên quan
    contract = models.ForeignKey(
        'contracts.TranslationContract',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        verbose_name='Hợp đồng',
        db_index=True
    )
    work = models.ForeignKey(
        'works.TranslationWork',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        verbose_name='Tác phẩm',
        db_index=True
    )
    # Note: Review and Editing models may not exist yet, so these are commented out
    # Uncomment when those models are created
    # review = models.ForeignKey(
    #     'reviews.Review',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='payments',
    #     verbose_name='Thẩm định',
    #     db_index=True
    # )
    # editing = models.ForeignKey(
    #     'editing.Editing',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='payments',
    #     verbose_name='Biên tập',
    #     db_index=True
    # )
    
    # Thông tin thanh toán
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='Số tiền'
    )
    currency = models.CharField(
        max_length=3,
        default='VND',
        verbose_name='Loại tiền tệ'
    )
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Người nhận thanh toán
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_payments',
        verbose_name='Người nhận',
        db_index=True
    )
    recipient_type = models.CharField(
        max_length=50,
        verbose_name='Loại người nhận',
        help_text='translator, expert, editor, etc.'
    )
    
    # Trạng thái và thời gian
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Trạng thái',
        db_index=True
    )
    request_date = models.DateField(verbose_name='Ngày yêu cầu', db_index=True)
    approved_date = models.DateField(null=True, blank=True, verbose_name='Ngày phê duyệt')
    paid_date = models.DateField(null=True, blank=True, verbose_name='Ngày thanh toán')
    
    # Phê duyệt
    requested_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_payments',
        verbose_name='Người yêu cầu',
        db_index=True
    )
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_payments',
        verbose_name='Người phê duyệt'
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name='Lý do từ chối'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Thanh toán'
        verbose_name_plural = 'Thanh toán'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['work_group', 'status'], name='idx_payments_group_status'),
            models.Index(fields=['payment_category', 'status'], name='idx_payments_cat_status'),
            models.Index(fields=['recipient', 'status'], name='idx_payments_recipient_status'),
            models.Index(fields=['request_date'], name='idx_payments_request_date'),
            models.Index(fields=['status'], name='idx_payments_status'),
        ]
    
    def __str__(self):
        return f"{self.get_work_group_display()} - {self.payment_category} - {self.amount:,.0f} {self.currency}"
    
    @property
    def can_be_approved(self):
        """Kiểm tra thanh toán có thể được phê duyệt không"""
        return self.status == 'pending'
    
    @property
    def can_be_paid(self):
        """Kiểm tra thanh toán có thể được thanh toán không"""
        return self.status == 'approved'