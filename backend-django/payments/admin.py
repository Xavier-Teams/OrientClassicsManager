from django.contrib import admin
from .models import Payment, PaymentCategoryConfig


@admin.register(PaymentCategoryConfig)
class PaymentCategoryConfigAdmin(admin.ModelAdmin):
    list_display = ['work_group', 'category_code', 'category_name', 'is_active', 'requires_approval']
    list_filter = ['work_group', 'is_active', 'requires_approval']
    search_fields = ['category_code', 'category_name', 'description']
    ordering = ['work_group', 'category_code']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'work_group', 'payment_category', 'payment_type',
        'recipient', 'amount', 'currency', 'status',
        'request_date', 'approved_date', 'paid_date'
    ]
    list_filter = ['work_group', 'status', 'currency', 'request_date']
    search_fields = ['payment_category', 'payment_type', 'description', 'recipient__full_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('work_group', 'payment_category', 'payment_type')
        }),
        ('Liên kết', {
            'fields': ('contract', 'work')  # 'review', 'editing' - uncomment when models are created
        }),
        ('Thông tin thanh toán', {
            'fields': ('amount', 'currency', 'description')
        }),
        ('Người nhận', {
            'fields': ('recipient', 'recipient_type')
        }),
        ('Trạng thái', {
            'fields': ('status', 'request_date', 'approved_date', 'paid_date')
        }),
        ('Phê duyệt', {
            'fields': ('requested_by', 'approved_by', 'rejection_reason')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )