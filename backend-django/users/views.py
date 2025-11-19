from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.conf import settings
from .serializers import (
    UserSerializer, UserCreateSerializer, UserBasicSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import UserPermission

User = get_user_model()

# Check if we're in development mode
DEBUG = getattr(settings, 'DEBUG', False)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns user data along with tokens"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the user from the token
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = response.data.get('access')
            
            if access_token:
                token = AccessToken(access_token)
                user_id = token.get('user_id')
                try:
                    user = User.objects.get(id=user_id)
                    user_serializer = UserSerializer(user)
                    response.data['user'] = user_serializer.data
                except User.DoesNotExist:
                    pass
        
        return response


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management
    
    Admin (superuser, chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky):
    - Full access: view, create, edit, activate/deactivate all users
    
    Regular users (thu_ky_hop_phan, bien_tap_vien, van_phong, ke_toan, van_thu, ky_thuat_vien, chuyen_gia):
    - Can view/edit their own full information
    - Can view basic information of others (full_name, phone, email)
    
    Translators (dich_gia) are excluded from user management
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, UserPermission]
    
    def get_queryset(self):
        """Filter out translators from user management"""
        queryset = User.objects.exclude(role='dich_gia')
        
        # Handle unauthenticated users (development mode)
        if not self.request.user or not self.request.user.is_authenticated:
            # In development, show only active users
            return queryset.filter(active=True)
        
        # Admin and user management roles can see all users (active and inactive)
        if self.request.user.is_superuser or self.request.user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'phu_trach_nhan_su']:
            return queryset
        
        # Regular users can only see active users
        return queryset.filter(active=True)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action and permissions"""
        if self.action == 'create':
            return UserCreateSerializer
        
        # Handle unauthenticated users (development mode)
        request_user = self.request.user
        is_authenticated = request_user and request_user.is_authenticated
        
        # For retrieve, check if user can see full info
        if self.action == 'retrieve':
            user = self.get_object()
            
            # Unauthenticated users see basic info
            if not is_authenticated:
                return UserBasicSerializer
            
            # Admin and user management roles can see full info
            if request_user.is_superuser or request_user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'phu_trach_nhan_su']:
                return UserSerializer
            
            # Users can see their own full info
            if user.id == request_user.id:
                return UserSerializer
            
            # Regular users see basic info of others
            return UserBasicSerializer
        
        # For list, return basic serializer for regular/unauthenticated users
        if self.action == 'list':
            if not is_authenticated:
                return UserBasicSerializer
            if request_user.is_superuser or request_user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'phu_trach_nhan_su']:
                return UserSerializer
            # Regular users see basic info in list
            return UserBasicSerializer
        
        return UserSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        # Allow unauthenticated access only for translators endpoint
        if self.action == 'translators':
            return [AllowAny()]
        
        # In development mode, allow unauthenticated access for list and retrieve
        # but still use UserPermission to handle field-level permissions
        if DEBUG and self.action in ['list', 'retrieve']:
            return [AllowAny(), UserPermission()]
        
        # For other actions or production, require authentication
        return [IsAuthenticated(), UserPermission()]
    
    def perform_create(self, serializer):
        """Override create to ensure role validation"""
        # Don't allow creating translators through user management
        role = serializer.validated_data.get('role')
        if role == 'dich_gia':
            raise serializers.ValidationError({
                "role": "Dịch giả không thuộc đối tượng người dùng của phần mềm quản lý dịch thuật này."
            })
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_profile(self, request, pk=None):
        """Update user profile - users can only update their own profile"""
        user = self.get_object()
        
        # Check if user is updating their own profile or is admin/user management
        if user.id != request.user.id:
            if not (request.user.is_superuser or request.user.role in ['chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky', 'phu_trach_nhan_su']):
                return Response(
                    {"detail": "Bạn chỉ có thể chỉnh sửa thông tin của chính mình."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user - Admin only"""
        user = self.get_object()
        user.active = True
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user - Admin only"""
        user = self.get_object()
        user.active = False
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='translators')
    def translators(self, request):
        """Get list of translators (users with role='dich_gia')"""
        translators = User.objects.filter(role='dich_gia', active=True)
        serializer = UserBasicSerializer(translators, many=True)
        return Response({
            'count': translators.count(),
            'results': serializer.data
        })