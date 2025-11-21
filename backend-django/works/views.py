from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Q, Avg, Sum, Case, When, IntegerField
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    TranslationWork, TranslationPart, Stage, WorkTask,
    CustomField, CustomFieldValue, CustomGroup, ViewPreference
)
from .serializers import (
    TranslationWorkSerializer,
    TranslationPartSerializer,
    TranslationPartDetailSerializer,
    StageSerializer,
    WorkTaskSerializer,
    CustomFieldSerializer,
    CustomFieldValueSerializer,
    CustomGroupSerializer,
    ViewPreferenceSerializer
)
from .permissions import WorkPermission, WorkReportPermission


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


class WorkTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WorkTask management
    """
    queryset = WorkTask.objects.filter(is_active=True)
    serializer_class = WorkTaskSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Set created_by when creating a task"""
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by work_group
        work_group = self.request.query_params.get('work_group', None)
        if work_group:
            queryset = queryset.filter(work_group=work_group)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by assigned_to
        assigned_to = self.request.query_params.get('assigned_to', None)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter by frequency
        frequency = self.request.query_params.get('frequency', None)
        if frequency:
            queryset = queryset.filter(frequency=frequency)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset


class WorkTaskStatisticsView(APIView):
    """
    API endpoint for work task statistics
    Requires WorkReportPermission - only specific roles can access general reports
    """
    permission_classes = [WorkReportPermission]
    
    def get(self, request):
        """Get comprehensive statistics for work tasks"""
        # Get month filter (default to current month)
        month = request.query_params.get('month', None)
        year = request.query_params.get('year', None)
        
        if month and year:
            try:
                month_int = int(month)
                year_int = int(year)
                start_date = timezone.datetime(year_int, month_int, 1).date()
                if month_int == 12:
                    end_date = timezone.datetime(year_int + 1, 1, 1).date()
                else:
                    end_date = timezone.datetime(year_int, month_int + 1, 1).date()
            except (ValueError, TypeError):
                month = None
                year = None
        
        if not month or not year:
            now = timezone.now()
            start_date = timezone.datetime(now.year, now.month, 1).date()
            if now.month == 12:
                end_date = timezone.datetime(now.year + 1, 1, 1).date()
            else:
                end_date = timezone.datetime(now.year, now.month + 1, 1).date()
        
        # Filter tasks for the month
        tasks = WorkTask.objects.filter(
            is_active=True,
            created_at__date__gte=start_date,
            created_at__date__lt=end_date
        )
        
        # Statistics by status
        status_stats = tasks.values('status').annotate(count=Count('id'))
        
        # Statistics by work group
        group_stats = tasks.values('work_group').annotate(count=Count('id'))
        
        # Statistics by frequency
        frequency_stats = tasks.values('frequency').annotate(count=Count('id'))
        
        # Statistics by priority
        priority_stats = tasks.values('priority').annotate(count=Count('id'))
        
        # Completed vs Not completed vs In progress
        completed = tasks.filter(status='hoan_thanh').count()
        not_completed = tasks.filter(status='khong_hoan_thanh').count()
        in_progress = tasks.filter(status='dang_tien_hanh').count()
        
        # Tasks by status breakdown
        status_breakdown = {
            'hoan_thanh': tasks.filter(status='hoan_thanh').count(),
            'khong_hoan_thanh': tasks.filter(status='khong_hoan_thanh').count(),
            'dang_tien_hanh': tasks.filter(status='dang_tien_hanh').count(),
            'cham_tien_do': tasks.filter(status='cham_tien_do').count(),
            'hoan_thanh_truoc_han': tasks.filter(status='hoan_thanh_truoc_han').count(),
            'da_huy': tasks.filter(status='da_huy').count(),
            'tam_hoan': tasks.filter(status='tam_hoan').count(),
            'chua_bat_dau': tasks.filter(status='chua_bat_dau').count(),
        }
        
        # Tasks by work group breakdown
        group_breakdown = {}
        for group_code, group_name in WorkTask.WORK_GROUP_CHOICES:
            group_breakdown[group_code] = {
                'name': group_name,
                'total': tasks.filter(work_group=group_code).count(),
                'completed': tasks.filter(work_group=group_code, status='hoan_thanh').count(),
                'in_progress': tasks.filter(work_group=group_code, status='dang_tien_hanh').count(),
                'behind_schedule': tasks.filter(work_group=group_code, status='cham_tien_do').count(),
            }
        
        # Tasks by frequency breakdown
        frequency_breakdown = {}
        for freq_code, freq_name in WorkTask.FREQUENCY_CHOICES:
            frequency_breakdown[freq_code] = {
                'name': freq_name,
                'count': tasks.filter(frequency=freq_code).count(),
            }
        
        # Incomplete tasks by group
        incomplete_by_group = {}
        for group_code, group_name in WorkTask.WORK_GROUP_CHOICES:
            incomplete_by_group[group_code] = {
                'name': group_name,
                'count': tasks.filter(work_group=group_code).exclude(status='hoan_thanh').count(),
            }
        
        # Tasks behind schedule by group
        behind_schedule_by_group = {}
        for group_code, group_name in WorkTask.WORK_GROUP_CHOICES:
            behind_schedule_by_group[group_code] = {
                'name': group_name,
                'count': tasks.filter(work_group=group_code, status='cham_tien_do').count(),
            }
        
        # High priority tasks
        high_priority_tasks = tasks.filter(priority__in=['cao', 'rat_cao']).values('work_group').annotate(
            in_progress=Count('id', filter=Q(status='dang_tien_hanh')),
            completed=Count('id', filter=Q(status='hoan_thanh')),
            not_completed=Count('id', filter=Q(status='khong_hoan_thanh')),
        )
        
        # Completed tasks behind schedule
        completed_behind_schedule = tasks.filter(
            status='hoan_thanh',
            completed_date__gt=models.F('due_date')
        ).count()
        
        # Progress by work group
        progress_by_group = {}
        for group_code, group_name in WorkTask.WORK_GROUP_CHOICES:
            group_tasks = tasks.filter(work_group=group_code)
            total = group_tasks.count()
            if total > 0:
                in_progress_count = group_tasks.filter(status='dang_tien_hanh').count()
                behind_schedule_count = group_tasks.filter(status='cham_tien_do').count()
                progress_by_group[group_code] = {
                    'name': group_name,
                    'in_progress': in_progress_count,
                    'behind_schedule': behind_schedule_count,
                    'ratio': round((behind_schedule_count / total * 100) if total > 0 else 0, 2),
                }
        
        return Response({
            'month': month or timezone.now().month,
            'year': year or timezone.now().year,
            'total_tasks': tasks.count(),
            'by_status': list(status_stats),
            'by_group': list(group_stats),
            'by_frequency': list(frequency_stats),
            'by_priority': list(priority_stats),
            'summary': {
                'completed': completed,
                'not_completed': not_completed,
                'in_progress': in_progress,
            },
            'status_breakdown': status_breakdown,
            'group_breakdown': group_breakdown,
            'frequency_breakdown': frequency_breakdown,
            'incomplete_by_group': incomplete_by_group,
            'behind_schedule_by_group': behind_schedule_by_group,
            'high_priority_tasks': list(high_priority_tasks),
            'completed_behind_schedule': completed_behind_schedule,
            'progress_by_group': progress_by_group,
        })


class WorkTaskPersonalStatisticsView(APIView):
    """
    API endpoint for personal work task statistics
    All authenticated users can access their own statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get personal statistics for a specific user"""
        # Use user_id from URL or current user
        if user_id:
            target_user_id = user_id
        elif request.user and request.user.is_authenticated:
            target_user_id = request.user.id
        else:
            return Response({'error': 'User ID required'}, status=400)
        
        # Get month filter (default to current month)
        month = request.query_params.get('month', None)
        year = request.query_params.get('year', None)
        
        if month and year:
            try:
                month_int = int(month)
                year_int = int(year)
                start_date = timezone.datetime(year_int, month_int, 1).date()
                if month_int == 12:
                    end_date = timezone.datetime(year_int + 1, 1, 1).date()
                else:
                    end_date = timezone.datetime(year_int, month_int + 1, 1).date()
            except (ValueError, TypeError):
                month = None
                year = None
        
        if not month or not year:
            now = timezone.now()
            start_date = timezone.datetime(now.year, now.month, 1).date()
            if now.month == 12:
                end_date = timezone.datetime(now.year + 1, 1, 1).date()
            else:
                end_date = timezone.datetime(now.year, now.month + 1, 1).date()
        
        # Filter tasks assigned to user for the month
        tasks = WorkTask.objects.filter(
            is_active=True,
            assigned_to_id=target_user_id,
            created_at__date__gte=start_date,
            created_at__date__lt=end_date
        )
        
        # Statistics similar to general statistics but filtered by user
        status_stats = tasks.values('status').annotate(count=Count('id'))
        group_stats = tasks.values('work_group').annotate(count=Count('id'))
        frequency_stats = tasks.values('frequency').annotate(count=Count('id'))
        
        completed = tasks.filter(status='hoan_thanh').count()
        not_completed = tasks.filter(status='khong_hoan_thanh').count()
        in_progress = tasks.filter(status='dang_tien_hanh').count()
        
        status_breakdown = {
            'hoan_thanh': tasks.filter(status='hoan_thanh').count(),
            'khong_hoan_thanh': tasks.filter(status='khong_hoan_thanh').count(),
            'dang_tien_hanh': tasks.filter(status='dang_tien_hanh').count(),
            'cham_tien_do': tasks.filter(status='cham_tien_do').count(),
            'hoan_thanh_truoc_han': tasks.filter(status='hoan_thanh_truoc_han').count(),
            'da_huy': tasks.filter(status='da_huy').count(),
            'tam_hoan': tasks.filter(status='tam_hoan').count(),
            'chua_bat_dau': tasks.filter(status='chua_bat_dau').count(),
        }
        
        group_breakdown = {}
        for group_code, group_name in WorkTask.WORK_GROUP_CHOICES:
            group_tasks = tasks.filter(work_group=group_code)
            group_breakdown[group_code] = {
                'name': group_name,
                'total': group_tasks.count(),
                'completed': group_tasks.filter(status='hoan_thanh').count(),
                'in_progress': group_tasks.filter(status='dang_tien_hanh').count(),
                'behind_schedule': group_tasks.filter(status='cham_tien_do').count(),
            }
        
        return Response({
            'user_id': target_user_id,
            'month': month or timezone.now().month,
            'year': year or timezone.now().year,
            'total_tasks': tasks.count(),
            'by_status': list(status_stats),
            'by_group': list(group_stats),
            'by_frequency': list(frequency_stats),
            'summary': {
                'completed': completed,
                'not_completed': not_completed,
                'in_progress': in_progress,
            },
            'status_breakdown': status_breakdown,
            'group_breakdown': group_breakdown,
        })


class CustomFieldViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Custom Field management
    """
    queryset = CustomField.objects.all()
    serializer_class = CustomFieldSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']
    
    def perform_create(self, serializer):
        """Set created_by when creating a custom field"""
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()


class CustomFieldValueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Custom Field Value management
    """
    queryset = CustomFieldValue.objects.all()
    serializer_class = CustomFieldValueSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by task
        task_id = self.request.query_params.get('task_id', None)
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        # Filter by field
        field_id = self.request.query_params.get('field_id', None)
        if field_id:
            queryset = queryset.filter(field_id=field_id)
        
        return queryset


class CustomGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Custom Group management (for Kanban Board)
    """
    queryset = CustomGroup.objects.filter(is_active=True)
    serializer_class = CustomGroupSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']
    
    def perform_create(self, serializer):
        """Set created_by when creating a custom group"""
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def board_data(self, request):
        """Get tasks organized by custom groups for board view"""
        from .models import WorkTask
        
        groups = self.get_queryset()
        board_data = {}
        
        for group in groups:
            if group.status_mapping:
                tasks = WorkTask.objects.filter(
                    is_active=True,
                    status__in=group.status_mapping
                )
            else:
                # If no status mapping, show all tasks
                tasks = WorkTask.objects.filter(is_active=True)
            
            serializer = WorkTaskSerializer(tasks, many=True)
            board_data[group.id] = {
                'group': CustomGroupSerializer(group).data,
                'tasks': serializer.data,
                'count': tasks.count()
            }
        
        return Response(board_data)


class ViewPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for View Preference management
    """
    queryset = ViewPreference.objects.all()
    serializer_class = ViewPreferenceSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['view_type', 'is_default']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        elif self.request.user and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by view_type
        view_type = self.request.query_params.get('view_type', None)
        if view_type:
            queryset = queryset.filter(view_type=view_type)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set user when creating a view preference"""
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
