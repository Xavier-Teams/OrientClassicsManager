from django.contrib import admin
from .models import TranslationWork, TranslationPart, WorkTask


@admin.register(TranslationPart)
class TranslationPartAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'manager', 'team_leader', 'work_count', 'is_active']
    list_filter = ['is_active', 'manager', 'team_leader']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['work_count', 'created_at', 'updated_at']


@admin.register(TranslationWork)
class TranslationWorkAdmin(admin.ModelAdmin):
    list_display = ['name', 'author', 'translator', 'state', 'priority', 'translation_progress', 'created_at']
    list_filter = ['state', 'priority', 'translation_part', 'created_at']
    search_fields = ['name', 'author', 'name_original']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(WorkTask)
class WorkTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'work_group', 'assigned_to', 'status', 'priority', 'due_date', 'progress_percent', 'created_at']
    list_filter = ['work_group', 'status', 'priority', 'frequency', 'assigned_to', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
