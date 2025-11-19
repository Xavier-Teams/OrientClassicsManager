from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer that accepts both username and email for login"""
    
    username_field = 'email'  # Use email as the username field
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow both 'username' and 'email' fields
        self.fields['username'] = serializers.CharField(required=False)
        self.fields['email'] = serializers.EmailField(required=False)
    
    def validate(self, attrs):
        # Get email from either 'email' or 'username' field
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        
        if not email:
            raise serializers.ValidationError({
                'email': 'Email hoặc tên đăng nhập là bắt buộc.',
                'username': 'Email hoặc tên đăng nhập là bắt buộc.'
            })
        
        if not password:
            raise serializers.ValidationError({
                'password': 'Mật khẩu là bắt buộc.'
            })
        
        # Update attrs to use email for token generation (parent will authenticate)
        attrs['email'] = email
        attrs['password'] = password
        
        # Remove username if it exists to avoid confusion
        if 'username' in attrs:
            del attrs['username']
        
        # Call parent validate to authenticate and generate tokens
        # Parent will use username_field ('email') to authenticate
        data = super().validate(attrs)
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """User serializer - Full information"""
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role',
            'phone', 'avatar', 'bio', 'active',
            'is_superuser', 'is_staff',
            'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'is_superuser', 'is_staff', 'full_name']
    
    def get_full_name(self, obj):
        """Return full_name from first_name + last_name or use existing full_name"""
        if obj.first_name or obj.last_name:
            return f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return obj.full_name or ''
    
    def update(self, instance, validated_data):
        """Update user and sync full_name"""
        # Update first_name and last_name
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        if first_name is not None:
            instance.first_name = first_name
        if last_name is not None:
            instance.last_name = last_name
        
        # Auto-generate full_name from first_name + last_name
        if first_name is not None or last_name is not None:
            instance.full_name = f"{instance.first_name or ''} {instance.last_name or ''}".strip()
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class UserBasicSerializer(serializers.ModelSerializer):
    """User serializer - Basic information only (for regular users viewing others)"""
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'phone', 'email'
        ]
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=True, allow_blank=False)
    last_name = serializers.CharField(max_length=150, required=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone', 'bio', 'active'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        # Don't allow creating translators through user management
        if attrs.get('role') == 'dich_gia':
            raise serializers.ValidationError({"role": "Dịch giả không thuộc đối tượng người dùng của phần mềm quản lý dịch thuật này."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Auto-generate full_name from first_name + last_name
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        validated_data['full_name'] = f"{first_name} {last_name}".strip()
        user = User.objects.create_user(**validated_data)
        return user

