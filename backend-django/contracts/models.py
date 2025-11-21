from django.db import models
from django.contrib.auth import get_user_model
from works.models import TranslationWork, TranslationPart, Stage

User = get_user_model()


class TranslationContract(models.Model):
    """Hợp đồng dịch thuật"""
    
    STATUS_CHOICES = [
        ('draft', 'Nháp'),
        ('pending', 'Chờ ký'),
        ('signed', 'Đã ký'),
        ('active', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    # Basic info
    contract_number = models.CharField(max_length=100, unique=True, verbose_name='Số hợp đồng')
    work = models.OneToOneField(
        TranslationWork,
        on_delete=models.CASCADE,
        related_name='contract',
        verbose_name='Tác phẩm'
    )
    translator = models.ForeignKey(
        'translators.Translator',
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name='Dịch giả',
        null=True,
        blank=True,
        db_index=True
    )
    # Keep old translator_user field for backward compatibility during migration
    translator_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='old_contracts',
        verbose_name='Dịch giả (User - deprecated)',
        null=True,
        blank=True,
        help_text='Deprecated: Sử dụng translator thay thế'
    )
    
    # Template
    template = models.ForeignKey(
        'ContractTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contracts',
        verbose_name='Mẫu hợp đồng'
    )
    
    # Terms
    start_date = models.DateField(verbose_name='Ngày bắt đầu')
    end_date = models.DateField(verbose_name='Ngày kết thúc')
    
    # Financial details
    base_page_count = models.IntegerField(default=0, verbose_name='Số trang cơ sở')
    translation_unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Đơn giá dịch thuật')
    translation_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Kinh phí dịch thuật')
    overview_writing_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Kinh phí viết bài tổng quan')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='Tổng giá trị')
    
    # Advance payment percentages
    advance_payment_1_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='Tỷ lệ tạm ứng lần 1 (%)')
    advance_payment_2_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='Tỷ lệ tạm ứng lần 2 (%)')
    advance_payment_include_overview = models.BooleanField(default=False, verbose_name='Bao gồm kinh phí bài tổng quan trong tạm ứng')
    
    # Payment amounts
    advance_payment_1 = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Tạm ứng lần 1')
    advance_payment_2 = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Tạm ứng lần 2')
    final_payment = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Quyết toán')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Trạng thái', db_index=True)
    
    # Stage/Phase (Giai đoạn) - FK với Stage
    stage = models.ForeignKey(
        Stage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contracts',
        verbose_name='Giai đoạn',
        help_text='Giai đoạn thực hiện hợp đồng',
        db_index=True
    )
    
    # Translation part - FK với TranslationPart
    translation_part = models.ForeignKey(
        TranslationPart,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contracts',
        verbose_name='Hợp phần',
        help_text='Hợp phần dịch thuật (tự động lấy từ tác phẩm nếu không chỉ định)',
        db_index=True
    )
    
    # Documents
    contract_file = models.FileField(upload_to='contracts/', blank=True, verbose_name='File hợp đồng')
    
    # Timestamps
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name='Ngày ký')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contracts',
        verbose_name='Người tạo'
    )
    
    class Meta:
        db_table = 'translation_contracts'
        verbose_name = 'Hợp đồng dịch thuật'
        verbose_name_plural = 'Hợp đồng dịch thuật'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['translation_part', 'stage'], name='idx_contracts_part_stage'),
            models.Index(fields=['translator', 'status'], name='idx_contracts_trans_stat'),
            models.Index(fields=['status'], name='idx_contracts_status'),
            models.Index(fields=['contract_number'], name='idx_contracts_number'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['contract_number'],
                name='unique_contract_number'
            ),
        ]
    
    def __str__(self):
        return f"{self.contract_number} - {self.work.name}"


class ContractTemplate(models.Model):
    """Mẫu hợp đồng - Template cho hợp đồng dịch thuật"""
    
    TEMPLATE_TYPE_CHOICES = [
        ('rich_text', 'Rich Text Editor'),
        ('word_file', 'File Word (.docx)'),
    ]
    
    name = models.CharField(max_length=255, verbose_name='Tên mẫu')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    type = models.CharField(
        max_length=20,
        choices=TEMPLATE_TYPE_CHOICES,
        default='rich_text',
        verbose_name='Loại mẫu'
    )
    content = models.TextField(blank=True, null=True, verbose_name='Nội dung HTML (cho rich_text)')
    file = models.FileField(
        upload_to='contract_templates/',
        blank=True,
        null=True,
        verbose_name='File Word template'
    )
    file_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Tên file')
    is_default = models.BooleanField(default=False, verbose_name='Mẫu mặc định')
    translation_part = models.CharField(max_length=100, blank=True, null=True, verbose_name='Hợp phần áp dụng')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_contract_templates',
        verbose_name='Người tạo'
    )
    
    class Meta:
        db_table = 'contract_templates'
        verbose_name = 'Mẫu hợp đồng'
        verbose_name_plural = 'Mẫu hợp đồng'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Nếu set làm mặc định, bỏ mặc định của các template khác
        if self.is_default:
            ContractTemplate.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)