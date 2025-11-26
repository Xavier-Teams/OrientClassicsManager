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
    CustomField, CustomFieldValue, CustomGroup, ViewPreference,
    TaskAssignmentRequest, TaskNotification
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
    ViewPreferenceSerializer,
    TaskAssignmentRequestSerializer,
    TaskNotificationSerializer,
    TaskAssignmentSerializer,
    TaskEvaluationSerializer
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
    
    @action(detail=True, methods=['post'])
    def assign_task(self, request, pk=None):
        """Giao việc cho người khác"""
        task = self.get_object()
        serializer = TaskAssignmentSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                from users.models import User
                
                assignee_ids = serializer.validated_data['assignee_ids']
                supervisor_id = serializer.validated_data.get('supervisor_id')
                start_date = serializer.validated_data.get('start_date')
                due_date = serializer.validated_data.get('due_date')
                
                # Lấy user objects
                assignees = User.objects.filter(id__in=assignee_ids, active=True)
                if len(assignees) != len(assignee_ids):
                    return Response({
                        'error': 'Một hoặc nhiều người được giao không tồn tại hoặc không hoạt động'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                supervisor = None
                if supervisor_id:
                    supervisor = User.objects.get(id=supervisor_id, active=True)
                
                # Giao việc cho nhiều người
                task.assign_to_users(
                    assignees=assignees,
                    assigner=request.user,
                    supervisor=supervisor,
                    start_date=start_date,
                    due_date=due_date
                )
                
                return Response({
                    'status': 'success',
                    'message': f'Đã giao việc "{task.title}" cho {assignee.full_name}',
                    'task': WorkTaskSerializer(task, context={'request': request}).data
                })
                
            except User.DoesNotExist:
                return Response({
                    'error': 'Không tìm thấy người dùng được chỉ định'
                }, status=400)
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=400)
        
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def evaluate_task(self, request, pk=None):
        """Đánh giá công việc (chỉ dành cho supervisor)"""
        task = self.get_object()
        
        if not task.can_evaluate(request.user):
            return Response({
                'error': 'Bạn không có quyền đánh giá công việc này'
            }, status=403)
        
        serializer = TaskEvaluationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                rating = serializer.validated_data['rating']
                comment = serializer.validated_data.get('comment', '')
                require_redo = serializer.validated_data.get('require_redo', False)
                redo_reason = serializer.validated_data.get('redo_reason', '')
                
                redo_task = task.evaluate_task(request.user, rating, comment, require_redo, redo_reason)
                
                response_data = {
                    'status': 'success',
                    'message': f'Đã đánh giá công việc "{task.title}" với {rating} sao',
                    'task': WorkTaskSerializer(task, context={'request': request}).data
                }
                
                if redo_task:
                    response_data['redo_task'] = WorkTaskSerializer(redo_task, context={'request': request}).data
                    response_data['message'] += f'. Đã tạo công việc làm lại với ID #{redo_task.id}'
                
                return Response(response_data)
                
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=400)
        
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Đánh dấu công việc hoàn thành và thông báo supervisor"""
        from django.utils import timezone
        
        task = self.get_object()
        
        # Kiểm tra quyền (chỉ assignee mới có thể đánh dấu hoàn thành)
        if request.user not in task.assigned_to.all():
            return Response({
                'error': 'Bạn không có quyền đánh dấu hoàn thành công việc này'
            }, status=403)
        
        try:
            # Cập nhật trạng thái
            task.status = 'hoan_thanh'
            task.completed_date = timezone.now().date()
            task.progress_percent = 100
            task.save()
            
            # Thông báo cho supervisor
            task.mark_completed_and_notify_supervisor(request.user)
            
            return Response({
                'status': 'success',
                'message': f'Đã đánh dấu hoàn thành công việc "{task.title}". Supervisor sẽ nhận được thông báo để đánh giá.',
                'task': WorkTaskSerializer(task, context={'request': request}).data
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=400)
    
    @action(detail=False, methods=['get'])
    def my_assigned_tasks(self, request):
        """Lấy danh sách công việc được giao cho user hiện tại"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        tasks = self.get_queryset().filter(
            assigned_to=request.user,
            is_assigned=True
        )
        
        # Apply additional filters
        status = request.query_params.get('status')
        if status:
            tasks = tasks.filter(status=status)
        
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_supervised_tasks(self, request):
        """Lấy danh sách công việc mà user hiện tại giám sát"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        tasks = self.get_queryset().filter(supervisor=request.user)
        
        # Apply additional filters
        status = request.query_params.get('status')
        if status:
            tasks = tasks.filter(status=status)
        
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


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


class TaskAssignmentRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TaskAssignmentRequest management
    """
    queryset = TaskAssignmentRequest.objects.all()
    serializer_class = TaskAssignmentRequestSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['task__title', 'reason', 'requested_value']
    ordering_fields = ['created_at', 'status', 'processed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by task
        task_id = self.request.query_params.get('task_id', None)
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        # Filter by requester
        requester_id = self.request.query_params.get('requester_id', None)
        if requester_id:
            queryset = queryset.filter(requester_id=requester_id)
        
        # Filter by approver
        approver_id = self.request.query_params.get('approver_id', None)
        if approver_id:
            queryset = queryset.filter(approver_id=approver_id)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by request_type
        request_type = self.request.query_params.get('request_type', None)
        if request_type:
            queryset = queryset.filter(request_type=request_type)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set requester and approver when creating a request"""
        task = serializer.validated_data['task']
        serializer.save(
            requester=self.request.user,
            approver=task.assigned_by or task.created_by
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Chấp nhận yêu cầu điều chỉnh"""
        assignment_request = self.get_object()
        
        # Kiểm tra quyền
        if request.user != assignment_request.approver:
            return Response({
                'error': 'Bạn không có quyền xử lý yêu cầu này'
            }, status=403)
        
        if assignment_request.status != 'pending':
            return Response({
                'error': 'Yêu cầu đã được xử lý trước đó'
            }, status=400)
        
        try:
            from django.utils import timezone
            
            # Cập nhật task với giá trị mới
            task = assignment_request.task
            field_name = assignment_request.request_type
            new_value = assignment_request.requested_value
            
            # Áp dụng thay đổi
            if field_name == 'start_date':
                from datetime import datetime
                task.start_date = datetime.strptime(new_value, '%Y-%m-%d').date()
            elif field_name == 'due_date':
                from datetime import datetime
                task.due_date = datetime.strptime(new_value, '%Y-%m-%d').date()
            elif field_name in ['title', 'description', 'priority', 'work_group']:
                setattr(task, field_name, new_value)
            
            task.save()
            
            # Cập nhật trạng thái yêu cầu
            assignment_request.status = 'approved'
            assignment_request.processed_at = timezone.now()
            assignment_request.response_message = request.data.get('response_message', '')
            assignment_request.save()
            
            # Tạo thông báo cho requester
            TaskNotification.objects.create(
                recipient=assignment_request.requester,
                sender=request.user,
                task=task,
                assignment_request=assignment_request,
                notification_type='assignment_approved',
                title=f'Yêu cầu điều chỉnh được chấp nhận: {task.title}',
                message=f'''Yêu cầu điều chỉnh "{assignment_request.get_request_type_display()}" của bạn đã được chấp nhận.

Giá trị mới: {new_value}
Phản hồi: {assignment_request.response_message or 'Không có phản hồi'}

Công việc đã được cập nhật theo yêu cầu của bạn.''',
                extra_data={
                    'request_id': assignment_request.id,
                    'field_name': field_name,
                    'new_value': new_value,
                }
            )
            
            return Response({
                'status': 'success',
                'message': 'Đã chấp nhận yêu cầu điều chỉnh',
                'request': TaskAssignmentRequestSerializer(assignment_request).data
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=400)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Từ chối yêu cầu điều chỉnh"""
        assignment_request = self.get_object()
        
        # Kiểm tra quyền
        if request.user != assignment_request.approver:
            return Response({
                'error': 'Bạn không có quyền xử lý yêu cầu này'
            }, status=403)
        
        if assignment_request.status != 'pending':
            return Response({
                'error': 'Yêu cầu đã được xử lý trước đó'
            }, status=400)
        
        try:
            from django.utils import timezone
            
            # Cập nhật trạng thái yêu cầu
            assignment_request.status = 'rejected'
            assignment_request.processed_at = timezone.now()
            assignment_request.response_message = request.data.get('response_message', '')
            assignment_request.save()
            
            # Tạo thông báo cho requester
            TaskNotification.objects.create(
                recipient=assignment_request.requester,
                sender=request.user,
                task=assignment_request.task,
                assignment_request=assignment_request,
                notification_type='assignment_rejected',
                title=f'Yêu cầu điều chỉnh bị từ chối: {assignment_request.task.title}',
                message=f'''Yêu cầu điều chỉnh "{assignment_request.get_request_type_display()}" của bạn đã bị từ chối.

Lý do từ chối: {assignment_request.response_message or 'Không có lý do cụ thể'}

Vui lòng liên hệ với người giao việc để thảo luận thêm.''',
                extra_data={
                    'request_id': assignment_request.id,
                    'field_name': assignment_request.request_type,
                }
            )
            
            return Response({
                'status': 'success',
                'message': 'Đã từ chối yêu cầu điều chỉnh',
                'request': TaskAssignmentRequestSerializer(assignment_request).data
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=400)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Lấy danh sách yêu cầu của user hiện tại"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        requests = self.get_queryset().filter(requester=request.user)
        
        page = self.paginate_queryset(requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Lấy danh sách yêu cầu chờ phê duyệt của user hiện tại"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        requests = self.get_queryset().filter(
            approver=request.user,
            status='pending'
        )
        
        page = self.paginate_queryset(requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)


class TaskNotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TaskNotification management
    """
    queryset = TaskNotification.objects.all()
    serializer_class = TaskNotificationSerializer
    permission_classes = [AllowAny]  # TODO: Change to [IsAuthenticated] in production
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'message', 'task__title']
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by recipient
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        elif self.request.user and self.request.user.is_authenticated:
            # Mặc định chỉ hiển thị thông báo của user hiện tại
            queryset = queryset.filter(recipient=self.request.user)
        
        # Filter by notification_type
        notification_type = self.request.query_params.get('notification_type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by is_read
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by task
        task_id = self.request.query_params.get('task_id', None)
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Đánh dấu thông báo đã đọc"""
        notification = self.get_object()
        
        # Kiểm tra quyền
        if request.user != notification.recipient:
            return Response({
                'error': 'Bạn không có quyền thao tác với thông báo này'
            }, status=403)
        
        notification.mark_as_read()
        
        return Response({
            'status': 'success',
            'message': 'Đã đánh dấu thông báo đã đọc',
            'notification': TaskNotificationSerializer(notification).data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Đánh dấu tất cả thông báo đã đọc"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        from django.utils import timezone
        
        updated_count = TaskNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'status': 'success',
            'message': f'Đã đánh dấu {updated_count} thông báo đã đọc'
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Lấy số lượng thông báo chưa đọc"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        count = TaskNotification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({
            'unread_count': count
        })
