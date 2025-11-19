from django.contrib import admin
from .models import Translator


@admin.register(Translator)
class TranslatorAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'full_name', 'id_card_number', 'email', 'phone', 'active', 'created_at'
    ]
    list_filter = ['active', 'created_at']
    search_fields = ['full_name', 'email', 'phone', 'id_card_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('first_name', 'last_name', 'full_name', 'user')
        }),
        ('CMND/CCCD', {
            'fields': ('id_card_number', 'id_card_issue_date', 'id_card_issue_place')
        }),
        ('Thông tin liên hệ', {
            'fields': ('workplace', 'address', 'phone', 'email')
        }),
        ('Thông tin ngân hàng', {
            'fields': ('bank_account_number', 'bank_name', 'bank_branch')
        }),
        ('Thông tin thuế', {
            'fields': ('tax_code',)
        }),
        ('Trạng thái', {
            'fields': ('active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

