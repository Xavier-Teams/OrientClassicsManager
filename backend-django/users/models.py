from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User Model"""
    
    ROLE_CHOICES = [
        ('chu_nhiem', 'Chủ nhiệm'),
        ('pho_chu_nhiem', 'Phó Chủ nhiệm'),
        ('truong_ban_thu_ky', 'Trưởng ban Thư ký'),
        ('thu_ky_hop_phan', 'Thư ký hợp phần'),
        ('van_phong', 'Văn phòng'),
        ('ke_toan', 'Kế toán'),
        ('van_thu', 'Văn thư'),
        ('bien_tap_vien', 'Biên tập viên (BTV)'),
        ('ky_thuat_vien', 'Kỹ thuật viên (KTV)'),
        ('dich_gia', 'Dịch giả'),
        ('chuyen_gia', 'Chuyên gia'),
        ('phu_trach_nhan_su', 'Phụ trách Nhân sự'),
    ]
    
    # Override username to use email
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200, verbose_name='Họ và tên')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='thu_ky_hop_phan', verbose_name='Vai trò')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Số điện thoại')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Ảnh đại diện')
    bio = models.TextField(blank=True, verbose_name='Tiểu sử')
    active = models.BooleanField(default=True, verbose_name='Hoạt động')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Auto-generate full_name from first_name + last_name"""
        # If first_name or last_name is set, update full_name
        if self.first_name or self.last_name:
            self.full_name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        # If full_name is empty but we have first_name or last_name, generate it
        elif not self.full_name and (self.first_name or self.last_name):
            self.full_name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.full_name or self.email
