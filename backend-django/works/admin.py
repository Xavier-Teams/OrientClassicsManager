from django.contrib import admin
from .models import TranslationWork, TranslationPart


@admin.register(TranslationPart)
class TranslationPartAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'leader', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']


@admin.register(TranslationWork)
class TranslationWorkAdmin(admin.ModelAdmin):
    list_display = ['name', 'author', 'translator', 'state', 'priority', 'translation_progress', 'created_at']
    list_filter = ['state', 'priority', 'translation_part', 'created_at']
    search_fields = ['name', 'author', 'name_original']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
