from django.contrib import admin
from .models import TranslationContract


@admin.register(TranslationContract)
class TranslationContractAdmin(admin.ModelAdmin):
    list_display = ['contract_number', 'work', 'translator', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['contract_number', 'work__name']
    readonly_fields = ['created_at', 'updated_at']
