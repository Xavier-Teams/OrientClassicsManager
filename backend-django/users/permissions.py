"""
Custom permissions for User management
"""
from rest_framework import permissions
from django.conf import settings


class UserPermission(permissions.BasePermission):
    """
    Permission class for User operations
    
    Rules:
    - Admin (superuser, chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky): Full access
    - Regular users: Can view/edit their own full info, view basic info of others
    - Translators (dich_gia) are excluded from user management
    """
    
    ADMIN_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
    ]
    
    USER_MANAGEMENT_ROLES = [
        'chu_nhiem',
        'pho_chu_nhiem',
        'truong_ban_thu_ky',
        'phu_trach_nhan_su',
    ]
    
    def has_permission(self, request, view):
        """Check if user has permission for the action"""
        # In development mode, allow unauthenticated access for list and retrieve
        DEBUG = getattr(settings, 'DEBUG', False)
        if DEBUG and view.action in ['list', 'retrieve']:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser has all permissions
        if request.user.is_superuser:
            return True
        
        # Check if user is admin or user management role
        is_admin = request.user.role in self.ADMIN_ROLES
        can_manage_users = request.user.role in self.USER_MANAGEMENT_ROLES
        
        # List: Admin can see all (excluding translators), regular users can see all (excluding translators)
        if view.action == 'list':
            return True
        
        # Retrieve: Admin can see all, regular users can see all (but with limited fields)
        if view.action == 'retrieve':
            return True
        
        # Create: Only admin and user management roles
        if view.action == 'create':
            return can_manage_users
        
        # Update, partial_update: Check in has_object_permission
        if view.action in ['update', 'partial_update', 'destroy', 'activate', 'deactivate']:
            return True  # Will check in has_object_permission
        
        # Me: All authenticated users
        if view.action == 'me':
            return True
        
        # Update profile: All authenticated users (for their own profile)
        if view.action == 'update_profile':
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check if user has permission for a specific object"""
        # In development mode, allow unauthenticated access for retrieve
        DEBUG = getattr(settings, 'DEBUG', False)
        if DEBUG and view.action == 'retrieve':
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser has all permissions
        if request.user.is_superuser:
            return True
        
        # Check if user is admin or user management role
        is_admin = request.user.role in self.ADMIN_ROLES
        can_manage_users = request.user.role in self.USER_MANAGEMENT_ROLES
        
        # Admin and user management roles can do everything
        if can_manage_users:
            return True
        
        # Regular users can only edit their own profile
        if view.action in ['update', 'partial_update', 'update_profile']:
            return obj.id == request.user.id
        
        # Regular users cannot delete, activate, or deactivate anyone
        if view.action in ['destroy', 'activate', 'deactivate']:
            return False
        
        # Regular users can view others (but serializer will limit fields)
        if view.action == 'retrieve':
            return True
        
        return False

