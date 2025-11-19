from rest_framework import serializers
from .models import Translator


class TranslatorSerializer(serializers.ModelSerializer):
    """Serializer cho Translator - Full information"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Translator
        fields = [
            'id', 'full_name', 'first_name', 'last_name',
            'id_card_number', 'id_card_issue_date', 'id_card_issue_place',
            'workplace', 'address', 'phone', 'email',
            'bank_account_number', 'bank_name', 'bank_branch',
            'tax_code', 'active', 'user',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']
    
    def get_full_name(self, obj):
        """Return full_name from first_name + last_name or use existing full_name"""
        if obj.first_name or obj.last_name:
            return f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return obj.full_name or ''
    
    def update(self, instance, validated_data):
        """Update translator and sync full_name"""
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        if first_name is not None:
            instance.first_name = first_name
        if last_name is not None:
            instance.last_name = last_name
        
        # Auto-generate full_name
        if first_name is not None or last_name is not None:
            instance.full_name = f"{instance.first_name or ''} {instance.last_name or ''}".strip()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class TranslatorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating translators"""
    first_name = serializers.CharField(max_length=150, required=True, allow_blank=False)
    last_name = serializers.CharField(max_length=150, required=True, allow_blank=False)
    
    class Meta:
        model = Translator
        fields = [
            'first_name', 'last_name',
            'id_card_number', 'id_card_issue_date', 'id_card_issue_place',
            'workplace', 'address', 'phone', 'email',
            'bank_account_number', 'bank_name', 'bank_branch',
            'tax_code', 'active', 'user'
        ]
    
    def create(self, validated_data):
        # Auto-generate full_name from first_name + last_name
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        validated_data['full_name'] = f"{first_name} {last_name}".strip()
        translator = Translator.objects.create(**validated_data)
        return translator


class TranslatorBasicSerializer(serializers.ModelSerializer):
    """Serializer cho Translator - Basic information only"""
    
    class Meta:
        model = Translator
        fields = [
            'id', 'full_name', 'phone', 'email'
        ]
        read_only_fields = ['id']

