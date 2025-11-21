from django.contrib import admin
from .models import TranslationContract, ContractTemplate


@admin.register(TranslationContract)
class TranslationContractAdmin(admin.ModelAdmin):
    list_display = ['contract_number', 'work', 'translator', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['contract_number', 'work__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ContractTemplate)
class ContractTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'is_default', 'translation_part', 'created_at']
    list_filter = ['type', 'is_default', 'translation_part', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
