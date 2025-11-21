from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django_fsm import FSMField, transition
from django.contrib.auth import get_user_model

User = get_user_model()


class Stage(models.Model):
    """Giai đoạn thực hiện dịch thuật"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Tên giai đoạn')
    code = models.CharField(max_length=20, unique=True, verbose_name='Mã giai đoạn')
    order = models.IntegerField(unique=True, verbose_name='Thứ tự', help_text='Thứ tự sắp xếp (1, 2, 3, 4, 5...)')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'stages'
        verbose_name = 'Giai đoạn'
        verbose_name_plural = 'Giai đoạn'
        ordering = ['order']
        indexes = [
            models.Index(fields=['code'], name='idx_stages_code'),
            models.Index(fields=['order'], name='idx_stages_order'),
            models.Index(fields=['is_active'], name='idx_stages_active'),
        ]
    
    def __str__(self):
        return self.name


class TranslationPart(models.Model):
    """Hợp phần dịch thuật"""
    name = models.CharField(max_length=200, verbose_name='Tên hợp phần')
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã hợp phần')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Quản lý
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_parts',
        verbose_name='Người quản lý'
    )
    team_leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_parts',
        verbose_name='Trưởng nhóm'
    )
    co_team_leader = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='co_led_parts',
        verbose_name='Đồng Trưởng nhóm'
    )
    
    # Computed fields
    work_count = models.IntegerField(
        default=0,
        verbose_name='Số tác phẩm',
        help_text='Tự động tính từ số lượng works'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'translation_parts'
        verbose_name = 'Hợp phần dịch thuật'
        verbose_name_plural = 'Hợp phần dịch thuật'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save để tự động tính work_count"""
        super().save(*args, **kwargs)
        self._compute_work_count()
    
    def _compute_work_count(self):
        """Tính số lượng tác phẩm"""
        count = self.works.filter(active=True).count()
        TranslationPart.objects.filter(id=self.id).update(work_count=count)


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
        verbose_name='Hợp phần dịch thuật',
        db_index=True
    )
    translator = models.ForeignKey(
        'translators.Translator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='translated_works',
        verbose_name='Dịch giả',
        db_index=True
    )
    stage = models.ForeignKey(
        Stage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='works',
        verbose_name='Giai đoạn',
        help_text='Giai đoạn thực hiện dịch thuật',
        db_index=True
    )
    # Keep old translator_user field for backward compatibility during migration
    translator_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='old_translated_works',
        verbose_name='Dịch giả (User - deprecated)',
        help_text='Deprecated: Sử dụng translator thay thế'
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
        indexes = [
            models.Index(fields=['translation_part', 'stage'], name='idx_works_part_stage'),
            models.Index(fields=['translator', 'state'], name='idx_works_trans_state'),
            models.Index(fields=['state'], name='idx_works_state'),
            models.Index(fields=['active'], name='idx_works_active'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['translation_part', 'stage', 'name'],
                name='unique_work_part_stage_name',
                condition=models.Q(active=True),
                violation_error_message='Đã tồn tại tác phẩm với cùng tên trong hợp phần và giai đoạn này'
            ),
        ]
    
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


class WorkTask(models.Model):
    """Công việc quản lý dự án (khác với TranslationWork)"""
    
    WORK_GROUP_CHOICES = [
        ('chung', 'Công việc chung'),
        ('bien_tap', 'Biên tập'),
        ('thiet_ke_cntt', 'Thiết kế + CNTT'),
        ('quet_trung_lap', 'Quét trùng lặp'),
        ('hanh_chinh', 'Hành chính'),
        ('tham_dinh_ban_dich_thu', 'Thẩm định bản dịch thử'),
        ('tham_dinh_cap_cg', 'Thẩm định cấp CG'),
        ('nghiem_thu_cap_da', 'Nghiệm thu cấp DA'),
        ('hop_thuong_truc', 'Họp thường trực'),
    ]
    
    STATUS_CHOICES = [
        ('chua_bat_dau', 'Chưa bắt đầu'),
        ('dang_tien_hanh', 'Đang tiến hành'),
        ('hoan_thanh', 'Hoàn thành'),
        ('khong_hoan_thanh', 'Không hoàn thành'),
        ('cham_tien_do', 'Chậm tiến độ'),
        ('hoan_thanh_truoc_han', 'Hoàn thành trước hạn'),
        ('da_huy', 'Đã hủy'),
        ('tam_hoan', 'Tạm hoãn'),
    ]
    
    FREQUENCY_CHOICES = [
        ('hang_ngay', 'Hằng ngày'),
        ('hang_tuan', 'Hằng tuần'),
        ('hang_thang', 'Hằng tháng'),
        ('dot_xuat', 'Đột xuất'),
    ]
    
    PRIORITY_CHOICES = [
        ('thap', 'Thấp'),
        ('trung_binh', 'Trung bình'),
        ('cao', 'Cao'),
        ('rat_cao', 'Rất cao'),
    ]
    
    # Basic info
    title = models.CharField(max_length=500, verbose_name='Tiêu đề công việc')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Classification
    work_group = models.CharField(
        max_length=50,
        choices=WORK_GROUP_CHOICES,
        default='chung',
        verbose_name='Nhóm công việc',
        db_index=True
    )
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default='dot_xuat',
        verbose_name='Tần suất',
        db_index=True
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='trung_binh',
        verbose_name='Ưu tiên',
        db_index=True
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks',
        verbose_name='Người được giao',
        db_index=True
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks',
        verbose_name='Người tạo'
    )
    
    # Status and dates
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='chua_bat_dau',
        verbose_name='Trạng thái',
        db_index=True
    )
    start_date = models.DateField(null=True, blank=True, verbose_name='Ngày bắt đầu')
    due_date = models.DateField(null=True, blank=True, verbose_name='Hạn hoàn thành', db_index=True)
    completed_date = models.DateField(null=True, blank=True, verbose_name='Ngày hoàn thành')
    
    # Progress
    progress_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Tiến độ (%)'
    )
    
    # Additional info
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'work_tasks'
        verbose_name = 'Công việc'
        verbose_name_plural = 'Công việc'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['work_group', 'status'], name='idx_tasks_group_status'),
            models.Index(fields=['assigned_to', 'status'], name='idx_tasks_user_status'),
            models.Index(fields=['status'], name='idx_tasks_status'),
            models.Index(fields=['due_date'], name='idx_tasks_due_date'),
            models.Index(fields=['is_active'], name='idx_tasks_active'),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        """Kiểm tra công việc có quá hạn không"""
        if self.due_date and self.status not in ['hoan_thanh', 'da_huy']:
            from django.utils import timezone
            return timezone.now().date() > self.due_date
        return False
    
    @property
    def is_on_time(self):
        """Kiểm tra công việc có đúng tiến độ không"""
        if self.due_date and self.status == 'hoan_thanh' and self.completed_date:
            return self.completed_date <= self.due_date
        return False