from rest_framework import serializers
from .models import Payment, PaymentCategoryConfig
from django.contrib.auth import get_user_model

User = get_user_model()


class PaymentCategoryConfigSerializer(serializers.ModelSerializer):
    """Serializer cho PaymentCategoryConfig"""
    work_group_display = serializers.CharField(source='get_work_group_display', read_only=True)
    
    class Meta:
        model = PaymentCategoryConfig
        fields = [
            'id', 'work_group', 'work_group_display',
            'category_code', 'category_name', 'description',
            'can_view_roles', 'can_create_roles', 'can_approve_roles',
            'requires_approval', 'approval_workflow',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer cho Payment"""
    work_group_display = serializers.CharField(source='get_work_group_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Related object names
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, allow_null=True)
    
    # Related object details
    contract_number = serializers.CharField(source='contract.contract_number', read_only=True, allow_null=True)
    work_name = serializers.CharField(source='work.name', read_only=True, allow_null=True)
    
    # Computed properties
    can_be_approved = serializers.ReadOnlyField()
    can_be_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'work_group', 'work_group_display',
            'payment_category', 'payment_type',
            'contract', 'contract_number',
            'work', 'work_name',
            # 'review', 'editing',  # Uncomment when models are created
            'amount', 'currency', 'description',
            'recipient', 'recipient_name', 'recipient_type',
            'status', 'status_display',
            'request_date', 'approved_date', 'paid_date',
            'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name',
            'rejection_reason',
            'can_be_approved', 'can_be_paid',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'approved_date', 'paid_date', 'approved_by',
            'can_be_approved', 'can_be_paid'
        ]
    
    def create(self, validated_data):
        """Set requested_by khi tạo payment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['requested_by'] = request.user
        return super().create(validated_data)


class PaymentCreateSerializer(PaymentSerializer):
    """Serializer cho việc tạo Payment với validation"""
    
    def validate(self, data):
        """Validate payment data"""
        work_group = data.get('work_group')
        payment_category = data.get('payment_category')
        
        # Kiểm tra category config tồn tại và active
        if work_group and payment_category:
            config = PaymentCategoryConfig.objects.filter(
                work_group=work_group,
                category_code=payment_category,
                is_active=True
            ).first()
            
            if not config:
                raise serializers.ValidationError({
                    'payment_category': f'Hạng mục thanh toán không tồn tại hoặc không hoạt động cho nhóm {work_group}'
                })
        
        return data


class PaymentApproveSerializer(serializers.Serializer):
    """Serializer cho việc approve/reject payment"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        action = data.get('action')
        rejection_reason = data.get('rejection_reason')
        
        if action == 'reject' and not rejection_reason:
            raise serializers.ValidationError({
                'rejection_reason': 'Lý do từ chối là bắt buộc khi từ chối thanh toán'
            })
        
        return data
