from rest_framework import serializers
from .models import TranslationWork, TranslationPart


class TranslationPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = TranslationPart
        fields = ['id', 'name', 'code', 'description', 'leader', 'is_active']


class TranslationWorkSerializer(serializers.ModelSerializer):
    progress = serializers.ReadOnlyField()
    translator_name = serializers.CharField(source='translator.full_name', read_only=True)
    translation_part_name = serializers.CharField(source='translation_part.name', read_only=True)
    
    class Meta:
        model = TranslationWork
        fields = [
            'id', 'name', 'name_original', 'author',
            'source_language', 'target_language',
            'page_count', 'word_count', 'description',
            'translation_part', 'translation_part_name',
            'translator', 'translator_name',
            'state', 'priority', 'translation_progress', 'progress',
            'notes', 'active',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress']

