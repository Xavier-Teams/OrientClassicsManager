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
    
    # Assignment and supervision
    assigned_to = models.ManyToManyField(
        User,
        blank=True,
        related_name='assigned_tasks',
        verbose_name='Người được giao (Assignees)',
        help_text='Có thể giao cho nhiều người cùng làm'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks',
        verbose_name='Người tạo'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_by_tasks',
        verbose_name='Người giao việc (Assigner)',
        help_text='Người có quyền chỉnh sửa ngày bắt đầu và hạn hoàn thành',
        db_index=True
    )
    supervisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_tasks',
        verbose_name='Người giám sát (Supervisor)',
        help_text='Người có trách nhiệm đánh giá chất lượng công việc',
        db_index=True
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
    
    # Assignment tracking
    is_assigned = models.BooleanField(
        default=False,
        verbose_name='Đã được giao việc',
        help_text='True nếu công việc được giao bởi người khác'
    )
    assignment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Ngày giao việc',
        help_text='Thời điểm công việc được giao'
    )
    
    # Progress
    progress_percent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Tiến độ (%)'
    )
    
    # Supervisor evaluation
    supervisor_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Đánh giá chất lượng (1-5 sao)',
        help_text='Đánh giá của người giám sát về chất lượng công việc'
    )
    supervisor_comment = models.TextField(
        blank=True,
        verbose_name='Bình luận đánh giá',
        help_text='Bình luận của người giám sát về chất lượng công việc'
    )
    evaluation_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Ngày đánh giá',
        help_text='Thời điểm người giám sát thực hiện đánh giá'
    )
    
    # Redo functionality
    is_redo = models.BooleanField(
        default=False,
        verbose_name='Là công việc làm lại',
        help_text='Đánh dấu công việc này là làm lại từ công việc khác'
    )
    original_task = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='redo_tasks',
        verbose_name='Công việc gốc',
        help_text='Công việc gốc mà công việc này được tạo để làm lại'
    )
    redo_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Số lần làm lại',
        help_text='Số lần công việc này đã được yêu cầu làm lại'
    )
    redo_reason = models.TextField(
        blank=True,
        verbose_name='Lý do làm lại',
        help_text='Lý do tại sao công việc cần được làm lại'
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
            # Note: Cannot create index on ManyToManyField 'assigned_to'
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
    
    def can_edit_dates(self, user):
        """Kiểm tra user có quyền chỉnh sửa ngày bắt đầu và hạn hoàn thành không"""
        if not user or not user.is_authenticated:
            return False
        
        # Nếu công việc được giao (is_assigned=True), chỉ assigner mới có quyền chỉnh sửa
        if self.is_assigned and self.assigned_by:
            return user == self.assigned_by
        
        # Nếu công việc tự tạo, người tạo có quyền chỉnh sửa
        if not self.is_assigned:
            return user == self.created_by or user in self.assigned_to.all()
        
        return False
    
    def can_evaluate(self, user):
        """Kiểm tra user có quyền đánh giá công việc không"""
        if not user or not user.is_authenticated:
            return False
        
        # Chỉ supervisor mới có quyền đánh giá
        return user == self.supervisor
    
    def assign_to_users(self, assignees, assigner, supervisor=None, start_date=None, due_date=None):
        """Giao việc cho nhiều users"""
        from django.utils import timezone
        
        # Clear existing assignees and add new ones
        self.assigned_to.clear()
        if isinstance(assignees, (list, tuple)):
            self.assigned_to.add(*assignees)
        else:
            self.assigned_to.add(assignees)
            
        self.assigned_by = assigner
        self.supervisor = supervisor or assigner  # Nếu không chỉ định supervisor, assigner sẽ là supervisor
        self.is_assigned = True
        self.assignment_date = timezone.now()
        
        if start_date:
            self.start_date = start_date
        if due_date:
            self.due_date = due_date
        
        self.save()
        
        # Tạo thông báo cho tất cả assignees
        for assignee in self.assigned_to.all():
            self._create_assignment_notification(assignee, assigner)
    
    def assign_to_user(self, assignee, assigner, supervisor=None, start_date=None, due_date=None):
        """Giao việc cho một user (backward compatibility)"""
        self.assign_to_users([assignee], assigner, supervisor, start_date, due_date)
    
    def _create_assignment_notification(self, assignee, assigner):
        """Tạo thông báo giao việc"""
        from django.utils import timezone
        
        TaskNotification.objects.create(
            recipient=assignee,
            sender=assigner,
            task=self,
            notification_type='task_assigned',
            title=f'Bạn được giao việc mới: {self.title}',
            message=f'''Bạn vừa được giao một công việc mới:

Tên công việc: {self.title}
Người giao việc: {assigner.full_name}
Người giám sát: {self.supervisor.full_name if self.supervisor else 'Chưa chỉ định'}
Ngày bắt đầu: {self.start_date.strftime('%d/%m/%Y') if self.start_date else 'Chưa xác định'}
Hạn hoàn thành: {self.due_date.strftime('%d/%m/%Y') if self.due_date else 'Chưa xác định'}
Mức độ ưu tiên: {self.get_priority_display()}

Mô tả: {self.description or 'Không có mô tả'}

Vui lòng kiểm tra và bắt đầu thực hiện công việc.''',
            extra_data={
                'task_id': self.id,
                'assigner_id': assigner.id,
                'supervisor_id': self.supervisor.id if self.supervisor else None,
                'start_date': self.start_date.isoformat() if self.start_date else None,
                'due_date': self.due_date.isoformat() if self.due_date else None,
            }
        )
    
    def evaluate_work(self, supervisor, rating, comment=''):
        """Đánh giá công việc bởi supervisor"""
        from django.utils import timezone
        
        if not self.can_evaluate(supervisor):
            raise ValueError('Bạn không có quyền đánh giá công việc này')
        
        if not (1 <= rating <= 5):
            raise ValueError('Đánh giá phải từ 1 đến 5 sao')
        
        self.supervisor_rating = rating
        self.supervisor_comment = comment
        self.evaluation_date = timezone.now()
        self.save(update_fields=['supervisor_rating', 'supervisor_comment', 'evaluation_date'])
        
        # Tạo thông báo cho tất cả assignees
        for assignee in self.assigned_to.all():
            TaskNotification.objects.create(
                recipient=assignee,
                sender=supervisor,
                task=self,
                notification_type='evaluation_received',
                title=f'Nhận đánh giá cho công việc: {self.title}',
                message=f'''Công việc "{self.title}" của bạn đã được đánh giá:

Người đánh giá: {supervisor.full_name}
Điểm đánh giá: {rating}/5 sao
Bình luận: {comment or 'Không có bình luận'}

Ngày đánh giá: {timezone.now().strftime('%d/%m/%Y %H:%M')}''',
                extra_data={
                    'task_id': self.id,
                    'supervisor_id': supervisor.id,
                    'rating': rating,
                    'comment': comment,
                }
            )
    
    def evaluate_task(self, supervisor_user, rating, comment, require_redo=False, redo_reason=""):
        """Đánh giá công việc và có thể yêu cầu làm lại"""
        from django.utils import timezone
        from django.core.exceptions import PermissionDenied
        
        if self.supervisor != supervisor_user:
            raise PermissionDenied("Bạn không có quyền đánh giá công việc này.")
        if self.status != 'hoan_thanh':
            raise ValueError("Chỉ có thể đánh giá công việc đã hoàn thành.")

        self.supervisor_rating = rating
        self.supervisor_comment = comment
        self.evaluation_date = timezone.now()
        self.save()
        
        if require_redo:
            # Tạo công việc làm lại
            redo_task = self.create_redo_task(redo_reason)
            
            # Thông báo cho assignee về việc cần làm lại
            TaskNotification.objects.create(
                task=redo_task,
                recipient=self.assigned_to,
                sender=supervisor_user,
                notification_type='redo_required',
                title=f'Yêu cầu làm lại: {self.title}',
                message=f'Công việc "{self.title}" cần được làm lại. Lý do: {redo_reason}. Một công việc mới đã được tạo với ID #{redo_task.id}.'
            )
            return redo_task
        else:
            # Thông báo đánh giá bình thường
            TaskNotification.objects.create(
                task=self,
                recipient=self.assigned_to,
                sender=supervisor_user,
                notification_type='evaluation',
                title=f'Đánh giá công việc: {self.title}',
                message=f'Công việc "{self.title}" của bạn đã được đánh giá {rating} sao. {comment if comment else ""}'
            )
            return None
    
    def create_redo_task(self, reason=""):
        """Tạo công việc làm lại từ công việc hiện tại"""
        from django.utils import timezone
        
        # Tính số lần làm lại
        current_redo_count = self.redo_count + 1
        
        # Tạo công việc mới
        redo_task = WorkTask.objects.create(
            title=f"{self.title} (Làm lại lần {current_redo_count})",
            description=self.description,
            work_group=self.work_group,
            frequency=self.frequency,
            priority=self.priority,
            assigned_by=self.assigned_by,
            supervisor=self.supervisor,
            created_by=self.assigned_by,
            status='chua_bat_dau',
            is_assigned=True,
            assignment_date=timezone.now(),
            is_redo=True,
            original_task=self,
            redo_count=current_redo_count,
            redo_reason=reason,
            notes=f"Làm lại từ công việc #{self.id}. Lý do: {reason}"
        )
        
        # Gán lại tất cả assignees từ task gốc
        redo_task.assigned_to.set(self.assigned_to.all())
        
        return redo_task
    
    def mark_completed_and_notify_supervisor(self, completed_by_user):
        """Đánh dấu hoàn thành và thông báo cho supervisor"""
        if self.status != 'hoan_thanh':
            return
        
        if self.supervisor and self.is_assigned:
            # Lấy danh sách tên của tất cả assignees
            assignee_names = [user.full_name for user in self.assigned_to.all()]
            assignee_list = ', '.join(assignee_names)
            
            # Thông báo cho supervisor về việc hoàn thành
            TaskNotification.objects.create(
                task=self,
                recipient=self.supervisor,
                sender=completed_by_user,
                notification_type='completion_review',
                title=f'Yêu cầu đánh giá: {self.title}',
                message=f'Công việc "{self.title}" đã được đánh dấu hoàn thành bởi {completed_by_user.full_name}. Người được giao: {assignee_list}. Vui lòng kiểm tra và đánh giá chất lượng.'
            )


class CustomField(models.Model):
    """Trường tùy chỉnh cho WorkTask"""
    
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('textarea', 'Text Area (Long Text)'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('dropdown', 'Dropdown'),
        ('checkbox', 'Checkbox'),
        ('money', 'Money'),
        ('website', 'Website'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('labels', 'Labels'),
        ('formula', 'Formula'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Tên trường')
    field_type = models.CharField(
        max_length=50,
        choices=FIELD_TYPE_CHOICES,
        verbose_name='Loại trường'
    )
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Options for dropdown, labels, etc.
    options = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Tùy chọn',
        help_text='Danh sách các giá trị cho dropdown/labels'
    )
    
    # Display settings
    is_required = models.BooleanField(default=False, verbose_name='Bắt buộc')
    is_visible = models.BooleanField(default=True, verbose_name='Hiển thị')
    order = models.IntegerField(default=0, verbose_name='Thứ tự')
    
    # Created by
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_custom_fields',
        verbose_name='Người tạo'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'custom_fields'
        verbose_name = 'Trường tùy chỉnh'
        verbose_name_plural = 'Trường tùy chỉnh'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['field_type'], name='idx_custom_field_type'),
            models.Index(fields=['is_visible'], name='idx_custom_field_visible'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_field_type_display()})"


class CustomFieldValue(models.Model):
    """Giá trị của Custom Field cho một WorkTask cụ thể"""
    
    task = models.ForeignKey(
        WorkTask,
        on_delete=models.CASCADE,
        related_name='custom_field_values',
        verbose_name='Công việc'
    )
    field = models.ForeignKey(
        CustomField,
        on_delete=models.CASCADE,
        related_name='values',
        verbose_name='Trường'
    )
    
    # Store value as JSON to support different field types
    value_text = models.TextField(blank=True, null=True, verbose_name='Giá trị text')
    value_number = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Giá trị số'
    )
    value_date = models.DateField(null=True, blank=True, verbose_name='Giá trị ngày')
    value_boolean = models.BooleanField(null=True, blank=True, verbose_name='Giá trị boolean')
    value_json = models.JSONField(null=True, blank=True, verbose_name='Giá trị JSON')
    
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'custom_field_values'
        verbose_name = 'Giá trị trường tùy chỉnh'
        verbose_name_plural = 'Giá trị trường tùy chỉnh'
        unique_together = [['task', 'field']]
        indexes = [
            models.Index(fields=['task', 'field'], name='idx_custom_value_task_field'),
        ]
    
    def __str__(self):
        return f"{self.task.title} - {self.field.name}"
    
    def get_value(self):
        """Lấy giá trị dựa trên loại trường"""
        if self.field.field_type in ['text', 'textarea', 'email', 'phone', 'website']:
            return self.value_text
        elif self.field.field_type == 'number' or self.field.field_type == 'money':
            return self.value_number
        elif self.field.field_type == 'date':
            return self.value_date
        elif self.field.field_type == 'checkbox':
            return self.value_boolean
        elif self.field.field_type in ['dropdown', 'labels']:
            return self.value_json or []
        else:
            return self.value_json
    
    def set_value(self, value):
        """Đặt giá trị dựa trên loại trường"""
        if self.field.field_type in ['text', 'textarea', 'email', 'phone', 'website']:
            self.value_text = str(value) if value else None
        elif self.field.field_type == 'number' or self.field.field_type == 'money':
            self.value_number = float(value) if value else None
        elif self.field.field_type == 'date':
            self.value_date = value
        elif self.field.field_type == 'checkbox':
            self.value_boolean = bool(value) if value is not None else None
        elif self.field.field_type in ['dropdown', 'labels']:
            self.value_json = value if isinstance(value, list) else [value] if value else []
        else:
            self.value_json = value


class CustomGroup(models.Model):
    """Nhóm tùy chỉnh cho Kanban Board View"""
    
    name = models.CharField(max_length=200, verbose_name='Tên nhóm')
    color = models.CharField(
        max_length=7,
        default='#6366f1',
        verbose_name='Màu sắc',
        help_text='Màu hex (ví dụ: #6366f1)'
    )
    order = models.IntegerField(default=0, verbose_name='Thứ tự')
    is_default = models.BooleanField(
        default=False,
        verbose_name='Mặc định',
        help_text='Nhóm mặc định (ví dụ: TO DO, IN PROGRESS, DONE)'
    )
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    # Mapping với status values (optional)
    status_mapping = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Ánh xạ trạng thái',
        help_text='Danh sách các status values được map vào nhóm này'
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_custom_groups',
        verbose_name='Người tạo'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'custom_groups'
        verbose_name = 'Nhóm tùy chỉnh'
        verbose_name_plural = 'Nhóm tùy chỉnh'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['is_active'], name='idx_custom_group_active'),
            models.Index(fields=['is_default'], name='idx_custom_group_default'),
        ]
    
    def __str__(self):
        return self.name


class ViewPreference(models.Model):
    """Cấu hình view của user (List, Board, Calendar, Gantt)"""
    
    VIEW_TYPE_CHOICES = [
        ('list', 'List'),
        ('board', 'Board/Kanban'),
        ('calendar', 'Calendar'),
        ('gantt', 'Gantt'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='view_preferences',
        verbose_name='Người dùng'
    )
    view_type = models.CharField(
        max_length=20,
        choices=VIEW_TYPE_CHOICES,
        verbose_name='Loại view'
    )
    
    # Configuration as JSON
    config = models.JSONField(
        default=dict,
        verbose_name='Cấu hình',
        help_text='Cấu hình view (visible columns, grouping, sorting, etc.)'
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name='Mặc định',
        help_text='View mặc định cho user'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'view_preferences'
        verbose_name = 'Cấu hình view'
        verbose_name_plural = 'Cấu hình view'
        unique_together = [['user', 'view_type']]
        indexes = [
            models.Index(fields=['user', 'view_type'], name='idx_view_pref_user_type'),
            models.Index(fields=['is_default'], name='idx_view_pref_default'),
        ]
    
    def __str__(self):
        return f"{self.user.full_name if hasattr(self.user, 'full_name') else self.user.username} - {self.get_view_type_display()}"


class TaskAssignmentRequest(models.Model):
    """Yêu cầu điều chỉnh thông tin từ Assignee gửi tới Assigner"""
    
    REQUEST_TYPE_CHOICES = [
        ('start_date', 'Ngày bắt đầu'),
        ('due_date', 'Hạn hoàn thành'),
        ('title', 'Tiêu đề công việc'),
        ('description', 'Mô tả công việc'),
        ('priority', 'Mức độ ưu tiên'),
        ('work_group', 'Nhóm công việc'),
        ('other', 'Khác'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('approved', 'Đã chấp nhận'),
        ('rejected', 'Đã từ chối'),
        ('cancelled', 'Đã hủy'),
    ]
    
    task = models.ForeignKey(
        WorkTask,
        on_delete=models.CASCADE,
        related_name='assignment_requests',
        verbose_name='Công việc'
    )
    requester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_assignment_requests',
        verbose_name='Người yêu cầu (Assignee)'
    )
    approver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_assignment_requests',
        verbose_name='Người xử lý (Assigner)'
    )
    
    request_type = models.CharField(
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
        verbose_name='Loại yêu cầu'
    )
    current_value = models.TextField(
        blank=True,
        verbose_name='Giá trị hiện tại',
        help_text='Giá trị hiện tại của trường cần thay đổi'
    )
    requested_value = models.TextField(
        verbose_name='Giá trị yêu cầu',
        help_text='Giá trị mới được yêu cầu'
    )
    reason = models.TextField(
        verbose_name='Lý do yêu cầu',
        help_text='Lý do tại sao cần thay đổi thông tin này'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Trạng thái',
        db_index=True
    )
    
    # Response from approver
    response_message = models.TextField(
        blank=True,
        verbose_name='Phản hồi',
        help_text='Phản hồi từ người xử lý yêu cầu'
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Thời gian xử lý'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'task_assignment_requests'
        verbose_name = 'Yêu cầu điều chỉnh công việc'
        verbose_name_plural = 'Yêu cầu điều chỉnh công việc'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', 'status'], name='idx_assign_req_task_status'),
            models.Index(fields=['requester', 'status'], name='idx_assign_req_requester_st'),
            models.Index(fields=['approver', 'status'], name='idx_assign_req_approver_st'),
            models.Index(fields=['status'], name='idx_assign_req_status'),
        ]
    
    def __str__(self):
        return f"{self.task.title} - {self.get_request_type_display()} - {self.get_status_display()}"


class TaskNotification(models.Model):
    """Thông báo liên quan đến công việc"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('task_assigned', 'Được giao việc mới'),
        ('task_updated', 'Công việc được cập nhật'),
        ('task_completed', 'Công việc hoàn thành'),
        ('task_overdue', 'Công việc quá hạn'),
        ('assignment_request', 'Yêu cầu điều chỉnh'),
        ('assignment_approved', 'Yêu cầu được chấp nhận'),
        ('assignment_rejected', 'Yêu cầu bị từ chối'),
        ('evaluation_received', 'Nhận đánh giá từ supervisor'),
        ('completion_review', 'Yêu cầu đánh giá hoàn thành'),
        ('redo_required', 'Yêu cầu làm lại'),
        ('evaluation', 'Đánh giá'),
        ('reminder', 'Nhắc nhở'),
    ]
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Người nhận'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications',
        verbose_name='Người gửi'
    )
    task = models.ForeignKey(
        WorkTask,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Công việc liên quan'
    )
    assignment_request = models.ForeignKey(
        TaskAssignmentRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Yêu cầu điều chỉnh liên quan'
    )
    
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        verbose_name='Loại thông báo',
        db_index=True
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Tiêu đề thông báo'
    )
    message = models.TextField(
        verbose_name='Nội dung thông báo'
    )
    
    is_read = models.BooleanField(
        default=False,
        verbose_name='Đã đọc',
        db_index=True
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Thời gian đọc'
    )
    
    # Additional data as JSON
    extra_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Dữ liệu bổ sung',
        help_text='Dữ liệu bổ sung cho thông báo (JSON format)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    
    class Meta:
        db_table = 'task_notifications'
        verbose_name = 'Thông báo công việc'
        verbose_name_plural = 'Thông báo công việc'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read'], name='idx_notif_recipient_read'),
            models.Index(fields=['task', 'notification_type'], name='idx_notif_task_type'),
            models.Index(fields=['notification_type'], name='idx_notif_type'),
            models.Index(fields=['is_read'], name='idx_notif_read'),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.full_name}"
    
    def mark_as_read(self):
        """Đánh dấu thông báo đã đọc"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])