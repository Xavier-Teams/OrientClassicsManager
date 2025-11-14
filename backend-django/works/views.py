from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TranslationWork
from .serializers import TranslationWorkSerializer


class TranslationWorkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Translation Work management
    """
    queryset = TranslationWork.objects.filter(active=True)
    serializer_class = TranslationWorkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'author', 'name_original']
    ordering_fields = ['created_at', 'name', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(state=status)
        
        # Filter by translator
        translator_id = self.request.query_params.get('translator_id', None)
        if translator_id:
            queryset = queryset.filter(translator_id=translator_id)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Duyệt tác phẩm"""
        work = self.get_object()
        try:
            work.approve()
            work.save()
            return Response({'status': 'approved', 'message': 'Tác phẩm đã được duyệt'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def assign_translator(self, request, pk=None):
        """Gán dịch giả"""
        work = self.get_object()
        translator_id = request.data.get('translator_id')
        if not translator_id:
            return Response({'error': 'translator_id is required'}, status=400)
        
        try:
            from users.models import User
            translator = User.objects.get(id=translator_id, role='dich_gia')
            work.translator = translator
            work.assign_translator()
            work.save()
            return Response({'status': 'translator_assigned', 'message': 'Đã gán dịch giả'})
        except User.DoesNotExist:
            return Response({'error': 'Translator not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def start_trial(self, request, pk=None):
        """Bắt đầu dịch thử"""
        work = self.get_object()
        try:
            work.start_trial()
            work.save()
            return Response({'status': 'trial_started', 'message': 'Đã bắt đầu dịch thử'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
