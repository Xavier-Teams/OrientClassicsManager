from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Translator
from .serializers import (
    TranslatorSerializer,
    TranslatorCreateSerializer,
    TranslatorBasicSerializer
)
from .permissions import TranslatorPermission


class TranslatorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Translator management
    
    Admin (superuser, chu_nhiem, pho_chu_nhiem, truong_ban_thu_ky):
    - Full access: view, create, edit, activate/deactivate all translators
    
    Thu_ky_hop_phan:
    - Full access: view, create, edit, activate/deactivate all translators
    
    Other users: No access
    """
    queryset = Translator.objects.all()
    serializer_class = TranslatorSerializer
    permission_classes = [IsAuthenticated, TranslatorPermission]
    
    def get_queryset(self):
        """Filter translators based on permissions"""
        queryset = Translator.objects.all()
        
        # Filter by active status if needed
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(id_card_number__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TranslatorCreateSerializer
        return TranslatorSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a translator - Admin/Manager only"""
        translator = self.get_object()
        translator.active = True
        translator.save()
        serializer = self.get_serializer(translator)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a translator - Admin/Manager only"""
        translator = self.get_object()
        translator.active = False
        translator.save()
        serializer = self.get_serializer(translator)
        return Response(serializer.data)

