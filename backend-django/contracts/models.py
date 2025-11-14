from django.db import models
from django.contrib.auth import get_user_model
from works.models import TranslationWork

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
        User,
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name='Dịch giả'
    )
    
    # Terms
    start_date = models.DateField(verbose_name='Ngày bắt đầu')
    end_date = models.DateField(verbose_name='Ngày kết thúc')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='Tổng giá trị')
    advance_payment_1 = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Tạm ứng lần 1')
    advance_payment_2 = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Tạm ứng lần 2')
    final_payment = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name='Quyết toán')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Trạng thái')
    
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
    
    def __str__(self):
        return f"{self.contract_number} - {self.work.name}"
