from rest_framework import serializers
from .models import TranslationWork, TranslationPart


class TranslationPartSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    team_leader_name = serializers.CharField(source='team_leader.full_name', read_only=True)
    co_team_leader_name = serializers.CharField(source='co_team_leader.full_name', read_only=True)
    
    class Meta:
        model = TranslationPart
        fields = [
            'id', 'name', 'code', 'description',
            'manager', 'manager_name',
            'team_leader', 'team_leader_name',
            'co_team_leader', 'co_team_leader_name',
            'work_count', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'work_count', 'created_at', 'updated_at']


class TranslationPartDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết với danh sách works"""
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    team_leader_name = serializers.CharField(source='team_leader.full_name', read_only=True)
    co_team_leader_name = serializers.CharField(source='co_team_leader.full_name', read_only=True)
    works = serializers.SerializerMethodField()
    
    class Meta:
        model = TranslationPart
        fields = [
            'id', 'name', 'code', 'description',
            'manager', 'manager_name',
            'team_leader', 'team_leader_name',
            'co_team_leader', 'co_team_leader_name',
            'work_count', 'works', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'work_count', 'created_at', 'updated_at']
    
    def get_works(self, obj):
        """Lấy danh sách works của hợp phần"""
        from .serializers import TranslationWorkSerializer
        works = obj.works.filter(active=True)[:20]  # Limit để tránh quá tải
        return TranslationWorkSerializer(works, many=True).data


class TranslationWorkSerializer(serializers.ModelSerializer):
    progress = serializers.ReadOnlyField()
    translator_name = serializers.SerializerMethodField()
    translator_details = serializers.SerializerMethodField()
    translation_part_name = serializers.CharField(source='translation_part.name', read_only=True, allow_null=True)
    translation_part_code = serializers.CharField(source='translation_part.code', read_only=True, allow_null=True)
    
    class Meta:
        model = TranslationWork
        fields = [
            'id', 'name', 'name_original', 'author',
            'source_language', 'target_language',
            'page_count', 'word_count', 'description',
            'translation_part', 'translation_part_name', 'translation_part_code',
            'translator', 'translator_name', 'translator_details',
            'state', 'priority', 'translation_progress', 'progress',
            'notes', 'active',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress', 'created_by']
    
    def get_translator_name(self, obj):
        """Lấy tên dịch giả từ Translator hoặc User (backward compatibility)"""
        if obj.translator:
            return obj.translator.full_name
        elif obj.translator_user:
            return obj.translator_user.full_name
        return None
    
    def get_translator_details(self, obj):
        """Lấy chi tiết dịch giả để hiển thị trong modal"""
        if obj.translator:
            translator = obj.translator
            return {
                'id': translator.id,
                'full_name': translator.full_name,
                'first_name': translator.first_name,
                'last_name': translator.last_name,
                'id_card_number': translator.id_card_number,
                'id_card_issue_date': translator.id_card_issue_date,
                'id_card_issue_place': translator.id_card_issue_place,
                'workplace': translator.workplace,
                'address': translator.address,
                'phone': translator.phone,
                'email': translator.email,
                'bank_account_number': translator.bank_account_number,
                'bank_name': translator.bank_name,
                'bank_branch': translator.bank_branch,
                'tax_code': translator.tax_code,
            }
        return None
    
    def update(self, instance, validated_data):
        """Override update to handle FSMField state changes properly"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Handle state separately if it's being updated
        new_state = validated_data.pop('state', None)
        
        # Update other fields first
        for attr, value in validated_data.items():
            try:
                setattr(instance, attr, value)
            except Exception as e:
                logger.error(f"Error setting {attr} to {value}: {str(e)}")
                raise serializers.ValidationError({attr: str(e)})
        
        # Handle state change if provided
        if new_state is not None and new_state != instance.state:
            # For FSMField with protected=True, we need to bypass protection
            # Use raw SQL to directly update database, bypassing FSM protection
            try:
                # Save other fields first (without state)
                update_fields = [f.name for f in instance._meta.fields 
                               if f.name != 'state' and f.name != 'id' 
                               and f.name != 'created_at' and f.name != 'updated_at'
                               and f.name != 'created_by' and f.name in validated_data]
                if update_fields:
                    instance.save(update_fields=update_fields)
                
                # Bypass FSM protection by using raw SQL
                # This directly updates the database without triggering FSM protection
                from django.db import connection
                from django.utils import timezone
                with connection.cursor() as cursor:
                    cursor.execute(
                        "UPDATE translation_works SET state = %s, updated_at = %s WHERE id = %s",
                        [new_state, timezone.now(), instance.pk]
                    )
                
                # Reload instance to get updated state
                instance.refresh_from_db()
            except Exception as e:
                logger.error(f"Error updating state from {instance.state} to {new_state}: {str(e)}")
                # If update fails, raise validation error
                raise serializers.ValidationError({
                    'state': f'Cannot update state from {instance.state} to {new_state}: {str(e)}'
                })
        else:
            # No state change, just save normally
            try:
                instance.save()
            except Exception as e:
                logger.error(f"Error saving instance: {str(e)}")
                raise serializers.ValidationError({'non_field_errors': [str(e)]})
        
        return instance