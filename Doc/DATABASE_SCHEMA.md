# 🗄️ DATABASE SCHEMA DESIGN
## HỆ THỐNG QUẢN LÝ DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG

---

## 📋 MỤC LỤC

1. [Core Models](#1-core-models)
2. [Works Models](#2-works-models)
3. [Contracts Models](#3-contracts-models)
4. [Reviews Models](#4-reviews-models)
5. [Editing Models](#5-editing-models)
6. [Administration Models](#6-administration-models)
7. [Documents Models](#7-documents-models)

---

## 1. CORE MODELS

### 1.1. User (Extended Django User)

```python
class User(AbstractUser):
    """Người dùng hệ thống"""
    
    # Basic info
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True)
    
    # Role & Permission
    role = models.ForeignKey('Role', on_delete=models.SET_NULL, null=True)
    department = models.CharField(max_length=100, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
```

### 1.2. Role

```python
class Role(models.Model):
    """Vai trò trong hệ thống"""
    
    ROLE_CHOICES = [
        ('chủ_nhiệm', 'Chủ nhiệm'),
        ('phó_chủ_nhiệm', 'Phó Chủ nhiệm'),
        ('trưởng_ban_thư_ký', 'Trưởng ban Thư ký'),
        ('thư_ký', 'Thư ký hợp phần'),
        ('văn_phòng', 'Văn phòng'),
        ('kế_toán', 'Kế toán'),
        ('văn_thư', 'Văn thư'),
        ('btv', 'BTV'),
        ('ktv', 'KTV'),
        ('dịch_giả', 'Dịch giả'),
        ('chuyên_gia', 'Chuyên gia'),
    ]
    
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    permissions = models.ManyToManyField('Permission', blank=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'roles'
```

### 1.3. Permission

```python
class Permission(models.Model):
    """Quyền hạn"""
    
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'permissions'
```

---

## 2. WORKS MODELS

### 2.1. TranslationPart (Hợp phần dịch thuật)

```python
class TranslationPart(models.Model):
    """Hợp phần dịch thuật"""
    
    name = models.CharField(max_length=200)  # VD: Phật giáo, Nho giáo...
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='led_parts')
    co_leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='co_led_parts')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'translation_parts'
        verbose_name = 'Hợp phần dịch thuật'
```

### 2.2. TranslationWork (Tác phẩm dịch thuật)

```python
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
    source_language = models.CharField(max_length=50, default='Hán văn')
    target_language = models.CharField(max_length=50, default='Tiếng Việt')
    
    # Details
    page_count = models.IntegerField(default=0, verbose_name='Số trang cơ sở')
    word_count = models.IntegerField(default=0, verbose_name='Số từ')
    description = models.TextField(blank=True)
    
    # Relationships
    translation_part = models.ForeignKey(
        TranslationPart,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='works'
    )
    translator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='translated_works'
    )
    contract = models.OneToOneField(
        'contracts.TranslationContract',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work'
    )
    
    # State (using django-fsm)
    state = FSMField(
        default='draft',
        choices=STATE_CHOICES,
        protected=True
    )
    
    # Other fields
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='0')
    notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_works')
    
    class Meta:
        db_table = 'translation_works'
        verbose_name = 'Tác phẩm dịch thuật'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
```

### 2.3. WorkDocument (Tài liệu tác phẩm)

```python
class WorkDocument(models.Model):
    """Tài liệu liên quan đến tác phẩm"""
    
    DOCUMENT_TYPES = [
        ('source', 'Bản nền'),
        ('trial_translation', 'Bản dịch thử'),
        ('progress_check', 'Bản kiểm tra tiến độ'),
        ('final_translation', 'Bản dịch hoàn thiện'),
        ('reviewed', 'Bản đã thẩm định'),
        ('edited', 'Bản đã biên tập'),
        ('proof_1', 'Bông 1'),
        ('proof_2', 'Bông 2'),
        ('proof_3', 'Bông 3'),
        ('proof_4', 'Bông 4'),
        ('final', 'Bản cuối'),
    ]
    
    work = models.ForeignKey(TranslationWork, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='works/documents/')
    file_name = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    
    # Metadata
    version = models.IntegerField(default=1)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'work_documents'
        ordering = ['-uploaded_at']
```

### 2.4. WorkHistory (Lịch sử thay đổi)

```python
class WorkHistory(models.Model):
    """Lịch sử thay đổi của tác phẩm"""
    
    work = models.ForeignKey(TranslationWork, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=100)  # VD: 'state_changed', 'translator_assigned'
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    # User & timestamp
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'work_history'
        ordering = ['-changed_at']
```

---

## 3. CONTRACTS MODELS

### 3.1. TranslationContract (Hợp đồng dịch thuật)

```python
class TranslationContract(models.Model):
    """Hợp đồng dịch thuật"""
    
    STATUS_CHOICES = [
        ('draft', 'Nháp'),
        ('pending', 'Chờ ký'),
        ('signed', 'Đã ký'),
        ('cancelled', 'Đã hủy'),
        ('completed', 'Hoàn thành'),
    ]
    
    # Basic info
    contract_number = models.CharField(max_length=100, unique=True)
    work = models.OneToOneField('works.TranslationWork', on_delete=models.CASCADE, related_name='contract')
    translator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contracts')
    
    # Terms
    start_date = models.DateField()
    end_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    advance_payment_1 = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    advance_payment_2 = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    final_payment = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Documents
    contract_file = models.FileField(upload_to='contracts/', blank=True)
    
    # Timestamps
    signed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_contracts')
    
    class Meta:
        db_table = 'translation_contracts'
        verbose_name = 'Hợp đồng dịch thuật'
```

### 3.2. Payment (Thanh toán)

```python
class Payment(models.Model):
    """Thanh toán"""
    
    PAYMENT_TYPES = [
        ('advance_1', 'Tạm ứng lần 1'),
        ('advance_2', 'Tạm ứng lần 2'),
        ('final', 'Quyết toán'),
        ('editing', 'Hiệu đính'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('approved', 'Đã duyệt'),
        ('processing', 'Đang xử lý'),
        ('completed', 'Hoàn thành'),
        ('rejected', 'Từ chối'),
    ]
    
    contract = models.ForeignKey(TranslationContract, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Documents
    request_document = models.FileField(upload_to='payments/requests/', blank=True)
    approval_document = models.FileField(upload_to='payments/approvals/', blank=True)
    payment_proof = models.FileField(upload_to='payments/proofs/', blank=True)
    
    # Processing
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requested_payments')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_payments')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments')
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Thanh toán'
        ordering = ['-requested_at']
```

---

## 4. REVIEWS MODELS

### 4.1. ReviewCouncil (Hội đồng/Tổ thẩm định)

```python
class ReviewCouncil(models.Model):
    """Hội đồng hoặc Tổ thẩm định"""
    
    COUNCIL_TYPES = [
        ('trial_review', 'Hội đồng thẩm định dịch thử'),
        ('progress_check', 'Tổ kiểm tra tiến độ'),
        ('expert_review', 'Hội đồng thẩm định chuyên gia'),
        ('project_acceptance', 'Hội đồng nghiệm thu cấp Dự án'),
    ]
    
    council_type = models.CharField(max_length=50, choices=COUNCIL_TYPES)
    name = models.CharField(max_length=200)
    work = models.ForeignKey('works.TranslationWork', on_delete=models.CASCADE, related_name='councils')
    
    # Members
    chairman = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='chaired_councils')
    secretary = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='secretary_councils')
    members = models.ManyToManyField(User, through='CouncilMembership', related_name='councils')
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('forming', 'Đang thành lập'),
        ('active', 'Đang hoạt động'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ], default='forming')
    
    # Meeting
    meeting_date = models.DateTimeField(null=True, blank=True)
    meeting_location = models.CharField(max_length=200, blank=True)
    meeting_type = models.CharField(max_length=20, choices=[
        ('in_person', 'Trực tiếp'),
        ('online', 'Trực tuyến'),
    ], blank=True)
    
    # Documents
    decision_file = models.FileField(upload_to='councils/decisions/', blank=True)
    minutes_file = models.FileField(upload_to='councils/minutes/', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'review_councils'
        verbose_name = 'Hội đồng thẩm định'
```

### 4.2. CouncilMembership

```python
class CouncilMembership(models.Model):
    """Thành viên Hội đồng"""
    
    ROLE_CHOICES = [
        ('chairman', 'Chủ tịch'),
        ('secretary', 'Thư ký'),
        ('member', 'Thành viên'),
        ('expert', 'Chuyên gia'),
    ]
    
    council = models.ForeignKey(ReviewCouncil, on_delete=models.CASCADE)
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    
    # Payment info
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Chờ thanh toán'),
        ('paid', 'Đã thanh toán'),
    ], default='pending')
    
    class Meta:
        db_table = 'council_memberships'
        unique_together = ['council', 'member']
```

### 4.3. ReviewForm (Phiếu thẩm định)

```python
class ReviewForm(models.Model):
    """Phiếu thẩm định"""
    
    FORM_TYPES = [
        ('trial_review', 'Phiếu thẩm định dịch thử'),
        ('progress_check', 'Phiếu kiểm tra tiến độ'),
        ('expert_review', 'Phiếu thẩm định chuyên gia'),
        ('project_acceptance', 'Phiếu nghiệm thu cấp Dự án'),
    ]
    
    form_type = models.CharField(max_length=50, choices=FORM_TYPES)
    council = models.ForeignKey(ReviewCouncil, on_delete=models.CASCADE, related_name='review_forms')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_forms')
    work = models.ForeignKey('works.TranslationWork', on_delete=models.CASCADE, related_name='review_forms')
    
    # Evaluation
    quality_score = models.IntegerField(null=True, blank=True)  # 1-10
    accuracy_score = models.IntegerField(null=True, blank=True)
    style_score = models.IntegerField(null=True, blank=True)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Conclusion
    conclusion = models.CharField(max_length=50, choices=[
        ('pass', 'Đạt'),
        ('pass_with_revision', 'Đạt có chỉnh sửa'),
        ('fail', 'Không đạt'),
    ], blank=True)
    
    # Comments
    comments = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    
    # Documents
    review_file = models.FileField(upload_to='reviews/forms/', blank=True)
    track_changes_file = models.FileField(upload_to='reviews/track_changes/', blank=True)
    
    # Status
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'review_forms'
        verbose_name = 'Phiếu thẩm định'
        unique_together = ['council', 'reviewer']
```

---

## 5. EDITING MODELS

### 5.1. EditingTask (Nhiệm vụ biên tập)

```python
class EditingTask(models.Model):
    """Nhiệm vụ biên tập"""
    
    TASK_TYPES = [
        ('proofreading', 'Hiệu đính'),
        ('cover_design', 'Thiết kế bìa'),
        ('rough_editing', 'Biên tập thô'),
        ('proof_1', 'Biên tập bông 1'),
        ('proof_2', 'Biên tập bông 2'),
        ('proof_3', 'Biên tập bông 3'),
        ('layout', 'Mi trang'),
        ('final_check', 'Kiểm tra cuối'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('in_progress', 'Đang xử lý'),
        ('completed', 'Hoàn thành'),
        ('rejected', 'Từ chối'),
    ]
    
    work = models.ForeignKey('works.TranslationWork', on_delete=models.CASCADE, related_name='editing_tasks')
    task_type = models.CharField(max_length=50, choices=TASK_TYPES)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='editing_tasks')
    
    # Details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Files
    input_file = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='input_tasks')
    output_file = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='output_tasks')
    
    # Deadline
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_editing_tasks')
    
    class Meta:
        db_table = 'editing_tasks'
        verbose_name = 'Nhiệm vụ biên tập'
        ordering = ['-created_at']
```

---

## 6. ADMINISTRATION MODELS

### 6.1. FormTemplate (Biểu mẫu)

```python
class FormTemplate(models.Model):
    """Biểu mẫu"""
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Template file
    template_file = models.FileField(upload_to='form_templates/')
    template_type = models.CharField(max_length=50, choices=[
        ('word', 'Word'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
    ])
    
    # Version
    version = models.CharField(max_length=20, default='1.0')
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'form_templates'
        verbose_name = 'Biểu mẫu'
```

### 6.2. AdministrativeTask (Nhiệm vụ hành chính)

```python
class AdministrativeTask(models.Model):
    """Nhiệm vụ hành chính"""
    
    STATUS_CHOICES = [
        ('pending', 'Chưa xử lý'),
        ('in_progress', 'Đang xử lý'),
        ('completed', 'Đã xử lý'),
        ('rejected', 'Từ chối'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_admin_tasks')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=1, choices=[
        ('0', 'Bình thường'),
        ('1', 'Cao'),
        ('2', 'Khẩn'),
    ], default='0')
    
    # Deadline
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Related work (optional)
    related_work = models.ForeignKey('works.TranslationWork', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'administrative_tasks'
        verbose_name = 'Nhiệm vụ hành chính'
        ordering = ['-created_at']
```

---

## 7. DOCUMENTS MODELS

### 7.1. Document (Tài liệu)

```python
class Document(models.Model):
    """Tài liệu hệ thống"""
    
    name = models.CharField(max_length=500)
    file = models.FileField(upload_to='documents/')
    file_name = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    
    # Category
    category = models.CharField(max_length=100, blank=True)
    tags = models.CharField(max_length=500, blank=True)  # Comma-separated
    
    # Access control
    is_public = models.BooleanField(default=False)
    accessible_by = models.ManyToManyField(User, blank=True, related_name='accessible_documents')
    
    # Metadata
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Versioning
    version = models.IntegerField(default=1)
    parent_document = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='versions')
    
    class Meta:
        db_table = 'documents'
        verbose_name = 'Tài liệu'
        ordering = ['-uploaded_at']
```

---

## 📊 ER DIAGRAM (Tóm tắt)

```
User ──┬── TranslationWork ──┬── TranslationContract
       │                    │
       ├── ReviewCouncil ───┼── ReviewForm
       │                    │
       ├── EditingTask      └── WorkDocument
       │
       └── AdministrativeTask

TranslationPart ── TranslationWork
```

---

## 🔑 INDEXES & OPTIMIZATION

### Recommended Indexes:

```sql
-- Works
CREATE INDEX idx_work_state ON translation_works(state);
CREATE INDEX idx_work_translator ON translation_works(translator_id);
CREATE INDEX idx_work_part ON translation_works(translation_part_id);
CREATE INDEX idx_work_created ON translation_works(created_at DESC);

-- Contracts
CREATE INDEX idx_contract_status ON translation_contracts(status);
CREATE INDEX idx_contract_translator ON translation_contracts(translator_id);

-- Payments
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_contract ON payments(contract_id);

-- Reviews
CREATE INDEX idx_review_council_type ON review_councils(council_type);
CREATE INDEX idx_review_form_reviewer ON review_forms(reviewer_id);
```

---

**Lưu ý:** Schema này sẽ được cập nhật trong quá trình phát triển dựa trên feedback và yêu cầu thực tế.

