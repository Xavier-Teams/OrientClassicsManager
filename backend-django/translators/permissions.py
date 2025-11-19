"""
Custom permissions for Translator management
"""
from rest_framework import permissions


class TranslatorPermission(permissions.BasePermission):
    """
    Permission class for Translator operations
    
    Rules:
    - Admin (superuser, chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky): Full access
    - Thu_ky_hop_phan: Full access
    - Other users: No access
    """
    
    ADMIN_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
    ]
    
    MANAGER_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
        'thu_ky_hop_phan',
    ]
    
    def has_permission(self, request, view):
        """Check if user has permission for the action"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser (Admin) has highest priority - always return True first
        if request.user.is_superuser:
            return True
        
        # Check if user is admin or manager role
        can_manage = request.user.role in self.MANAGER_ROLES
        
        # All authenticated admin/manager roles can access
        return can_manage
    
    def has_object_permission(self, request, view, obj):
        """Check if user has permission for a specific object"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser (Admin) has highest priority - always return True first
        if request.user.is_superuser:
            return True
        
        # Admin and manager roles can do everything
        can_manage = request.user.role in self.MANAGER_ROLES
        return can_manage

