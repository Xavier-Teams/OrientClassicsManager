from rest_framework import serializers
from .models import (
    TranslationWork, TranslationPart, Stage, WorkTask,
    CustomField, CustomFieldValue, CustomGroup, ViewPreference,
    TaskAssignmentRequest, TaskNotification
)


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


class StageSerializer(serializers.ModelSerializer):
    """Serializer cho Stage"""
    class Meta:
        model = Stage
        fields = ['id', 'name', 'code', 'order', 'description', 'is_active']
        read_only_fields = ['id']


class TranslationWorkSerializer(serializers.ModelSerializer):
    progress = serializers.ReadOnlyField()
    translator_name = serializers.SerializerMethodField()
    translator_details = serializers.SerializerMethodField()
    translation_part_name = serializers.CharField(source='translation_part.name', read_only=True, allow_null=True)
    translation_part_code = serializers.CharField(source='translation_part.code', read_only=True, allow_null=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True, allow_null=True)
    stage_code = serializers.CharField(source='stage.code', read_only=True, allow_null=True)
    
    class Meta:
        model = TranslationWork
        fields = [
            'id', 'name', 'name_original', 'author',
            'source_language', 'target_language',
            'page_count', 'word_count', 'description',
            'translation_part', 'translation_part_name', 'translation_part_code',
            'translator', 'translator_name', 'translator_details',
            'stage', 'stage_name', 'stage_code',
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


class WorkTaskSerializer(serializers.ModelSerializer):
    """Serializer cho WorkTask"""
    assigned_to_names = serializers.SerializerMethodField()  # Changed from assigned_to_name
    assigned_to_ids = serializers.SerializerMethodField()    # New field for IDs
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, allow_null=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True, allow_null=True)
    supervisor_name = serializers.CharField(source='supervisor.full_name', read_only=True, allow_null=True)
    original_task_title = serializers.CharField(source='original_task.title', read_only=True, allow_null=True)
    is_overdue = serializers.ReadOnlyField()
    is_on_time = serializers.ReadOnlyField()
    custom_field_values = serializers.SerializerMethodField()
    can_edit_dates = serializers.SerializerMethodField()
    can_evaluate = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkTask
        fields = [
            'id', 'title', 'description',
            'work_group', 'frequency', 'priority',
            'assigned_to', 'assigned_to_names', 'assigned_to_ids',  # Updated fields
            'created_by', 'created_by_name',
            'assigned_by', 'assigned_by_name',
            'supervisor', 'supervisor_name',
            'status', 'start_date', 'due_date', 'completed_date',
            'is_assigned', 'assignment_date',
            'progress_percent', 'notes', 'is_active',
            'supervisor_rating', 'supervisor_comment', 'evaluation_date',
            'is_redo', 'original_task', 'original_task_title', 'redo_count', 'redo_reason',
            'is_overdue', 'is_on_time',
            'can_edit_dates', 'can_evaluate',
            'custom_field_values',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'is_overdue', 'is_on_time',
            'can_edit_dates', 'can_evaluate', 'assignment_date', 'evaluation_date',
            'is_redo', 'original_task', 'original_task_title', 'redo_count', 'redo_reason'
        ]
    
    def get_assigned_to_names(self, obj):
        """Lấy danh sách tên của assignees"""
        assignees = obj.assigned_to.all()
        return [user.full_name or user.username for user in assignees]
    
    def get_assigned_to_ids(self, obj):
        """Lấy danh sách ID của assignees"""
        return list(obj.assigned_to.values_list('id', flat=True))
    
    def get_custom_field_values(self, obj):
        """Lấy giá trị các custom fields"""
        values = obj.custom_field_values.all()
        return {
            value.field.id: {
                'field_id': value.field.id,
                'field_name': value.field.name,
                'field_type': value.field.field_type,
                'value': value.get_value()
            }
            for value in values
        }
    
    def get_can_edit_dates(self, obj):
        """Kiểm tra user hiện tại có thể chỉnh sửa ngày không"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.can_edit_dates(request.user)
        return False
    
    def get_can_evaluate(self, obj):
        """Kiểm tra user hiện tại có thể đánh giá không"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.can_evaluate(request.user)
        return False
    
    def validate_completed_date(self, value):
        """
        Validate ngày hoàn thành:
        1. Không được là ngày trong tương lai (chống gian lận)
        """
        if value:
            from django.utils import timezone
            today = timezone.now().date()
            if value > today:
                raise serializers.ValidationError(
                    "Ngày hoàn thành không được là ngày trong tương lai. "
                    "Vui lòng chọn ngày hôm nay hoặc trước đó."
                )
        return value
    
    def validate(self, data):
        """
        Validate toàn bộ dữ liệu:
        1. Hạn hoàn thành >= Ngày bắt đầu
        2. Ngày hoàn thành >= Ngày bắt đầu
        """
        start_date = data.get('start_date')
        due_date = data.get('due_date') 
        completed_date = data.get('completed_date')
        
        # Nếu đang update, lấy giá trị hiện tại nếu không có trong data
        if self.instance:
            start_date = start_date or self.instance.start_date
            due_date = due_date or self.instance.due_date
            completed_date = completed_date or self.instance.completed_date
        
        # Validation 1: Hạn hoàn thành >= Ngày bắt đầu
        if start_date and due_date:
            if due_date < start_date:
                raise serializers.ValidationError({
                    'due_date': 'Hạn hoàn thành phải lớn hơn hoặc bằng ngày bắt đầu công việc.'
                })
        
        # Validation 2: Ngày hoàn thành >= Ngày bắt đầu
        if start_date and completed_date:
            if completed_date < start_date:
                raise serializers.ValidationError({
                    'completed_date': 'Ngày hoàn thành không được nhỏ hơn ngày bắt đầu công việc.'
                })
        
        return data


class CustomFieldSerializer(serializers.ModelSerializer):
    """Serializer cho CustomField"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = CustomField
        fields = [
            'id', 'name', 'field_type', 'description',
            'options', 'is_required', 'is_visible', 'order',
            'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomFieldValueSerializer(serializers.ModelSerializer):
    """Serializer cho CustomFieldValue"""
    field_name = serializers.CharField(source='field.name', read_only=True)
    field_type = serializers.CharField(source='field.field_type', read_only=True)
    value = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomFieldValue
        fields = [
            'id', 'task', 'field', 'field_name', 'field_type',
            'value_text', 'value_number', 'value_date', 'value_boolean', 'value_json',
            'value', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
    
    def get_value(self, obj):
        """Lấy giá trị từ object"""
        return obj.get_value()
    
    def validate(self, data):
        """Validate dựa trên field type"""
        field = data.get('field')
        if not field:
            return data
        
        # Set appropriate value field based on field_type
        if field.field_type in ['text', 'textarea', 'email', 'phone', 'website']:
            if 'value_text' not in data:
                raise serializers.ValidationError({'value_text': 'This field is required'})
        elif field.field_type in ['number', 'money']:
            if 'value_number' not in data:
                raise serializers.ValidationError({'value_number': 'This field is required'})
        elif field.field_type == 'date':
            if 'value_date' not in data:
                raise serializers.ValidationError({'value_date': 'This field is required'})
        elif field.field_type == 'checkbox':
            if 'value_boolean' not in data:
                raise serializers.ValidationError({'value_boolean': 'This field is required'})
        elif field.field_type in ['dropdown', 'labels']:
            if 'value_json' not in data:
                raise serializers.ValidationError({'value_json': 'This field is required'})
        
        return data
    
    def create(self, validated_data):
        """Create và set value"""
        instance = super().create(validated_data)
        # Value sẽ được set từ validated_data
        return instance
    
    def update(self, instance, validated_data):
        """Update và set value"""
        instance = super().update(instance, validated_data)
        return instance


class CustomGroupSerializer(serializers.ModelSerializer):
    """Serializer cho CustomGroup"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, allow_null=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomGroup
        fields = [
            'id', 'name', 'color', 'order', 'is_default', 'is_active',
            'status_mapping', 'created_by', 'created_by_name',
            'task_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_task_count(self, obj):
        """Đếm số task trong nhóm này"""
        if obj.status_mapping:
            from .models import WorkTask
            return WorkTask.objects.filter(
                is_active=True,
                status__in=obj.status_mapping
            ).count()
        return 0


class ViewPreferenceSerializer(serializers.ModelSerializer):
    """Serializer cho ViewPreference"""
    
    class Meta:
        model = ViewPreference
        fields = [
            'id', 'user', 'view_type', 'config', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskAssignmentRequestSerializer(serializers.ModelSerializer):
    """Serializer cho TaskAssignmentRequest"""
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TaskAssignmentRequest
        fields = [
            'id', 'task', 'task_title',
            'requester', 'requester_name',
            'approver', 'approver_name',
            'request_type', 'request_type_display',
            'current_value', 'requested_value', 'reason',
            'status', 'status_display',
            'response_message', 'processed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'processed_at',
            'task_title', 'requester_name', 'approver_name',
            'request_type_display', 'status_display'
        ]
    
    def validate(self, data):
        """Validate yêu cầu"""
        task = data.get('task')
        requester = data.get('requester')
        
        # Kiểm tra requester phải là assignee của task
        if task and requester and task.assigned_to != requester:
            raise serializers.ValidationError({
                'requester': 'Chỉ người được giao việc mới có thể tạo yêu cầu điều chỉnh'
            })
        
        # Kiểm tra task phải được giao (is_assigned=True)
        if task and not task.is_assigned:
            raise serializers.ValidationError({
                'task': 'Chỉ có thể tạo yêu cầu điều chỉnh cho công việc đã được giao'
            })
        
        return data


class TaskNotificationSerializer(serializers.ModelSerializer):
    """Serializer cho TaskNotification"""
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    sender_name = serializers.CharField(source='sender.full_name', read_only=True, allow_null=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    assignment_request_id = serializers.IntegerField(source='assignment_request.id', read_only=True, allow_null=True)
    
    class Meta:
        model = TaskNotification
        fields = [
            'id', 'recipient', 'recipient_name',
            'sender', 'sender_name',
            'task', 'task_title',
            'assignment_request', 'assignment_request_id',
            'notification_type', 'notification_type_display',
            'title', 'message',
            'is_read', 'read_at',
            'extra_data', 'created_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'read_at',
            'recipient_name', 'sender_name', 'task_title',
            'notification_type_display', 'assignment_request_id'
        ]


class TaskAssignmentSerializer(serializers.Serializer):
    """Serializer cho việc giao công việc"""
    assignee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text='Danh sách ID của những người được giao việc'
    )
    supervisor_id = serializers.IntegerField(required=False, allow_null=True, help_text='ID của người giám sát (tùy chọn)')
    start_date = serializers.DateField(required=False, allow_null=True, help_text='Ngày bắt đầu')
    due_date = serializers.DateField(required=False, allow_null=True, help_text='Hạn hoàn thành')
    message = serializers.CharField(required=False, allow_blank=True, help_text='Lời nhắn kèm theo')
    
    def validate(self, data):
        """Validate dữ liệu giao việc"""
        start_date = data.get('start_date')
        due_date = data.get('due_date')
        assignee_ids = data.get('assignee_ids', [])
        
        # Kiểm tra có ít nhất một assignee
        if not assignee_ids:
            raise serializers.ValidationError({
                'assignee_ids': 'Phải chọn ít nhất một người để giao việc'
            })
        
        # Kiểm tra ngày bắt đầu <= hạn hoàn thành
        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError({
                'due_date': 'Hạn hoàn thành phải lớn hơn hoặc bằng ngày bắt đầu'
            })
        
        return data


class TaskEvaluationSerializer(serializers.Serializer):
    """Serializer cho việc đánh giá công việc"""
    rating = serializers.IntegerField(
        min_value=1, 
        max_value=5,
        help_text='Đánh giá từ 1-5 sao'
    )
    comment = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text='Bình luận đánh giá'
    )
    require_redo = serializers.BooleanField(
        required=False,
        default=False,
        help_text='Có yêu cầu làm lại không'
    )
    redo_reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Lý do yêu cầu làm lại'
    )