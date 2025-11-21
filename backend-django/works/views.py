from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q, Avg
from django.db import models
from .models import TranslationWork, TranslationPart, Stage
from .serializers import (
    TranslationWorkSerializer,
    TranslationPartSerializer,
    TranslationPartDetailSerializer,
    StageSerializer
)
from .permissions import WorkPermission


class TranslationPartViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Translation Part management
    """
    queryset = TranslationPart.objects.filter(is_active=True)
    serializer_class = TranslationPartSerializer
    # Temporarily allow unauthenticated access for development
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at', 'work_count']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TranslationPartDetailSerializer
        return TranslationPartSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by manager
        manager_id = self.request.query_params.get('manager_id', None)
        if manager_id:
            queryset = queryset.filter(manager_id=manager_id)
        
        # Filter by team_leader
        team_leader_id = self.request.query_params.get('team_leader_id', None)
        if team_leader_id:
            queryset = queryset.filter(team_leader_id=team_leader_id)
        
        # Annotate với work_count nếu chưa có
        queryset = queryset.annotate(
            computed_work_count=Count('works', filter=Q(works__active=True))
        )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def works(self, request, pk=None):
        """Lấy danh sách works của hợp phần"""
        part = self.get_object()
        works = part.works.filter(active=True)
        
        # Apply filters
        status_filter = request.query_params.get('status', None)
        if status_filter:
            works = works.filter(state=status_filter)
        
        serializer = TranslationWorkSerializer(works, many=True)
        return Response({
            'part': TranslationPartSerializer(part).data,
            'works': serializer.data,
            'total': works.count()
        })
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Thống kê hợp phần"""
        part = self.get_object()
        works = part.works.filter(active=True)
        
        # Thống kê theo trạng thái
        status_stats = works.values('state').annotate(count=Count('id'))
        
        # Thống kê theo priority
        priority_stats = works.values('priority').annotate(count=Count('id'))
        
        # Tổng số works
        total_works = works.count()
        
        # Works đang trong tiến trình
        in_progress = works.filter(
            state__in=['in_progress', 'progress_checked', 'final_translation']
        ).count()
        
        # Works hoàn thành
        completed = works.filter(state='completed').count()
        
        # Tiến độ trung bình
        avg_progress = works.aggregate(
            avg=Avg('translation_progress')
        )['avg'] or 0
        
        return Response({
            'part': TranslationPartSerializer(part).data,
            'statistics': {
                'total_works': total_works,
                'in_progress': in_progress,
                'completed': completed,
                'average_progress': round(avg_progress, 2),
                'by_status': list(status_stats),
                'by_priority': list(priority_stats),
            }
        })


class TranslationWorkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Translation Work management
    """
    queryset = TranslationWork.objects.filter(active=True)
    serializer_class = TranslationWorkSerializer
    # Use custom permission class for role-based access control
    # Temporarily allow unauthenticated for development - change to [WorkPermission] in production
    permission_classes = [AllowAny]  # TODO: Change to [WorkPermission] when auth is ready
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'author', 'name_original']
    ordering_fields = ['created_at', 'name', 'priority']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Set created_by when creating a work"""
        # Set created_by if user is authenticated
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
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
        
        # Filter by translation_part
        part_id = self.request.query_params.get('part_id', None)
        if part_id:
            queryset = queryset.filter(translation_part_id=part_id)
        
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
    
    @action(detail=False, methods=['get'], url_path='board')
    def board(self, request):
        """Get works organized by status for board view"""
        works = self.get_queryset()
        
        # Group by status - include all statuses (even empty ones) for consistent frontend display
        board_data = {}
        for status_code, status_label in TranslationWork.STATE_CHOICES:
            status_works = works.filter(state=status_code)
            serializer = TranslationWorkSerializer(status_works, many=True)
            board_data[status_code] = serializer.data
        
        return Response(board_data)


class StageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Stage (read-only, stages are managed by admin)
    """
    queryset = Stage.objects.filter(is_active=True).order_by('order')
    serializer_class = StageSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'name']
    ordering = ['order']
