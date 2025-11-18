"""
Custom permissions for Translation Work based on user roles
Based on BA_PM_Quan_ly_Du_an_dich_thuat.md
"""
from rest_framework import permissions


class WorkPermission(permissions.BasePermission):
    """
    Permission class for Translation Work operations
    
    Rules:
    - Create: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký, Thư ký hợp phần
    - Update: Admin roles can update all, Dịch giả can only update their own works
    - Delete: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký
    - Approve: Chủ nhiệm, Phó Chủ nhiệm, Trưởng ban Thư ký
    - View: All authenticated users
    """
    
    ADMIN_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
        'thu_ky_hop_phan',
    ]
    
    APPROVE_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
    ]
    
    DELETE_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
    ]
    
    def has_permission(self, request, view):
        """Check if user has permission for the action"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser has all permissions
        if request.user.is_superuser:
            return True
        
        # View: All authenticated users
        if view.action in ['list', 'retrieve', 'board']:
            return True
        
        # Create: Admin roles
        if view.action == 'create':
            return request.user.role in self.ADMIN_ROLES
        
        # Update, Delete, Approve: Check in has_object_permission
        if view.action in ['update', 'partial_update', 'destroy', 'approve', 'assign_translator']:
            return True  # Will check in has_object_permission
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check if user has permission for specific object"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser has all permissions
        if request.user.is_superuser:
            return True
        
        # View: All authenticated users
        if view.action in ['retrieve']:
            return True
        
        # Delete: Only DELETE_ROLES
        if view.action == 'destroy':
            return request.user.role in self.DELETE_ROLES
        
        # Approve: Only APPROVE_ROLES
        if view.action == 'approve':
            return request.user.role in self.APPROVE_ROLES
        
        # Assign translator: Admin roles
        if view.action == 'assign_translator':
            return request.user.role in self.ADMIN_ROLES
        
        # Update: Admin roles can update all, Dịch giả can only update their own
        if view.action in ['update', 'partial_update']:
            if request.user.role in self.ADMIN_ROLES:
                return True
            # Dịch giả can only update works assigned to them
            if request.user.role == 'dich_gia':
                return obj.translator_id == request.user.id
            return False
        
        return False

