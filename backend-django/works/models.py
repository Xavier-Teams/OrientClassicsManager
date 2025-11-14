from django.db import models
from django_fsm import FSMField, transition
from django.contrib.auth import get_user_model

User = get_user_model()


class TranslationPart(models.Model):
    """Hợp phần dịch thuật"""
    name = models.CharField(max_length=200, verbose_name='Tên hợp phần')
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã hợp phần')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_parts',
        verbose_name='Trưởng hợp phần'
    )
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'translation_parts'
        verbose_name = 'Hợp phần dịch thuật'
        verbose_name_plural = 'Hợp phần dịch thuật'
    
    def __str__(self):
        return self.name


class TranslationWork(models.Model):
    """Tác phẩm dịch thuật"""
    
    STATE_CHOICES = [
        ('draft', 'Dự kiến'),
        ('approved', 'Đã duyệt'),
        ('translator_assigned', 'Đã gán dịch giả'),
        ('trial_translation', 'Dịch thử'),
        ('trial_reviewed', 'Đã thẩm định dịch thử'),
        ('contract_signed', 'Đã ký hợp đồng'),
        ('in_progress', 'Đang dịch'),
        ('progress_checked', 'Đã kiểm tra tiến độ'),
        ('final_translation', 'Dịch hoàn thiện'),
        ('expert_reviewed', 'Đã thẩm định chuyên gia'),
        ('project_accepted', 'Đã nghiệm thu Dự án'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    PRIORITY_CHOICES = [
        ('0', 'Bình thường'),
        ('1', 'Cao'),
        ('2', 'Khẩn'),
    ]
    
    # Basic info
    name = models.CharField(max_length=500, verbose_name='Tên tác phẩm')
    name_original = models.CharField(max_length=500, blank=True, verbose_name='Tên gốc')
    author = models.CharField(max_length=200, blank=True, verbose_name='Tác giả')
    source_language = models.CharField(max_length=50, default='Hán văn', verbose_name='Ngôn ngữ nguồn')
    target_language = models.CharField(max_length=50, default='Tiếng Việt', verbose_name='Ngôn ngữ đích')
    
    # Details
    page_count = models.IntegerField(default=0, verbose_name='Số trang cơ sở')
    word_count = models.IntegerField(default=0, verbose_name='Số từ')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Relationships
    translation_part = models.ForeignKey(
        TranslationPart,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='works',
        verbose_name='Hợp phần dịch thuật'
    )
    translator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='translated_works',
        verbose_name='Dịch giả'
    )
    
    # State (using django-fsm)
    state = FSMField(
        default='draft',
        choices=STATE_CHOICES,
        protected=True,
        verbose_name='Trạng thái'
    )
    
    # Other fields
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='0', verbose_name='Ưu tiên')
    translation_progress = models.IntegerField(default=0, verbose_name='Tiến độ (%)')
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_works',
        verbose_name='Người tạo'
    )
    
    class Meta:
        db_table = 'translation_works'
        verbose_name = 'Tác phẩm dịch thuật'
        verbose_name_plural = 'Tác phẩm dịch thuật'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    # Workflow transitions
    @transition(field=state, source='draft', target='approved')
    def approve(self):
        """Duyệt tác phẩm"""
        pass
    
    @transition(field=state, source='approved', target='translator_assigned')
    def assign_translator(self):
        """Gán dịch giả"""
        if not self.translator:
            raise ValueError('Vui lòng chọn dịch giả trước khi gán')
    
    @transition(field=state, source='translator_assigned', target='trial_translation')
    def start_trial(self):
        """Bắt đầu dịch thử"""
        pass
    
    @property
    def progress(self):
        """Tính tiến độ dựa trên state"""
        progress_map = {
            'draft': 0,
            'approved': 10,
            'translator_assigned': 15,
            'trial_translation': 20,
            'trial_reviewed': 30,
            'contract_signed': 40,
            'in_progress': 50,
            'progress_checked': 60,
            'final_translation': 70,
            'expert_reviewed': 85,
            'project_accepted': 95,
            'completed': 100,
            'cancelled': 0,
        }
        return progress_map.get(self.state, 0)
