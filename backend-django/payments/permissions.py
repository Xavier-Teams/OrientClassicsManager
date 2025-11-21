"""
Custom permissions for Payment based on user roles and PaymentCategoryConfig
"""
from rest_framework import permissions
from .models import PaymentCategoryConfig


class PaymentPermission(permissions.BasePermission):
    """Permission class cho Payment"""
    
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True
        
        # Xem danh sách: Tất cả authenticated users (sẽ filter trong queryset)
        if view.action in ['list', 'retrieve']:
            return True
        
        # Tạo: Kiểm tra theo work_group và category
        if view.action == 'create':
            work_group = request.data.get('work_group')
            category = request.data.get('payment_category')
            if work_group and category:
                return self._can_create(user, work_group, category)
            return False
        
        # Phê duyệt: Kiểm tra trong has_object_permission
        if view.action in ['approve', 'reject']:
            return True  # Will check in has_object_permission
        
        # Thanh toán: Chỉ kế toán
        if view.action == 'mark_paid':
            return user.role == 'ke_toan'
        
        # Update: Chỉ người tạo hoặc admin
        if view.action in ['update', 'partial_update']:
            return True  # Will check in has_object_permission
        
        # Delete: Chỉ admin
        if view.action == 'destroy':
            return user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Kiểm tra user có quyền với object cụ thể không"""
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True
        
        # Xem: Kiểm tra theo category config
        if view.action in ['retrieve']:
            return self._can_view(user, obj)
        
        # Phê duyệt/Từ chối: Kiểm tra theo category config
        if view.action in ['approve', 'reject']:
            return self._can_approve(user, obj)
        
        # Update: Chỉ người tạo hoặc admin
        if view.action in ['update', 'partial_update']:
            if obj.requested_by == user:
                return True
            return user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'ke_toan']
        
        # Delete: Chỉ admin
        if view.action == 'destroy':
            return user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky']
        
        # Thanh toán: Chỉ kế toán và payment phải ở trạng thái approved
        if view.action == 'mark_paid':
            return user.role == 'ke_toan' and obj.status == 'approved'
        
        return False
    
    def _can_view(self, user, payment):
        """Kiểm tra user có thể xem thanh toán không"""
        # Kế toán và Chủ nhiệm: Xem tất cả
        if user.role in ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky']:
            return True
        
        # Người nhận: Xem thanh toán của mình
        if payment.recipient == user:
            return True
        
        # Người tạo: Xem thanh toán mình tạo
        if payment.requested_by == user:
            return True
        
        # Kiểm tra theo category config
        config = PaymentCategoryConfig.objects.filter(
            work_group=payment.work_group,
            category_code=payment.payment_category,
            is_active=True
        ).first()
        
        if config:
            return user.role in config.can_view_roles
        
        return False
    
    def _can_create(self, user, work_group, category):
        """Kiểm tra user có thể tạo thanh toán không"""
        config = PaymentCategoryConfig.objects.filter(
            work_group=work_group,
            category_code=category,
            is_active=True
        ).first()
        
        if not config:
            return False
        
        return user.role in config.can_create_roles
    
    def _can_approve(self, user, payment):
        """Kiểm tra user có thể phê duyệt không"""
        # Kế toán: Phê duyệt tất cả
        if user.role == 'ke_toan':
            return True
        
        # Chủ nhiệm: Phê duyệt các khoản lớn
        if user.role in ['chu_nhiem', 'pho_chu_nhiem']:
            return True
        
        # Kiểm tra theo category config
        config = PaymentCategoryConfig.objects.filter(
            work_group=payment.work_group,
            category_code=payment.payment_category,
            is_active=True
        ).first()
        
        if not config:
            return False
        
        return user.role in config.can_approve_roles
