from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Translator(models.Model):
    """Dịch giả - Tách riêng khỏi users"""
    
    # Thông tin cơ bản
    full_name = models.CharField(max_length=200, verbose_name='Họ và tên')
    first_name = models.CharField(max_length=150, blank=True, default='', verbose_name='Họ và tên đệm')
    last_name = models.CharField(max_length=150, blank=True, default='', verbose_name='Tên')
    
    # Thông tin CMND/CCCD
    id_card_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        verbose_name='Số CMND/CCCD'
    )
    id_card_issue_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Ngày cấp'
    )
    id_card_issue_place = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Nơi cấp'
    )
    
    # Thông tin liên hệ
    workplace = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Nơi công tác'
    )
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name='Địa chỉ'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Số điện thoại'
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name='Email'
    )
    
    # Thông tin ngân hàng
    bank_account_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Số tài khoản'
    )
    bank_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Tên ngân hàng'
    )
    bank_branch = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='Chi nhánh ngân hàng'
    )
    
    # Thông tin thuế
    tax_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Mã số thuế TNCN'
    )
    
    # Trạng thái
    active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    # Optional: Link với user nếu dịch giả cũng là user của hệ thống
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='translator_profile',
        verbose_name='Tài khoản hệ thống'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'translators'
        verbose_name = 'Dịch giả'
        verbose_name_plural = 'Dịch giả'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['full_name'], name='idx_translators_full_name'),
            models.Index(fields=['id_card_number'], name='idx_translators_id_card'),
            models.Index(fields=['email'], name='idx_translators_email'),
            models.Index(fields=['phone'], name='idx_translators_phone'),
            models.Index(fields=['active'], name='idx_translators_active'),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-generate full_name from first_name + last_name"""
        if self.first_name or self.last_name:
            self.full_name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.full_name or f"Translator #{self.id}"

