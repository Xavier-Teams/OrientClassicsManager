from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Payment, PaymentCategoryConfig
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentApproveSerializer,
    PaymentCategoryConfigSerializer
)
from .permissions import PaymentPermission


class PaymentCategoryConfigViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho PaymentCategoryConfig (read-only, quản lý qua admin)
    """
    queryset = PaymentCategoryConfig.objects.filter(is_active=True)
    serializer_class = PaymentCategoryConfigSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['category_name', 'category_code', 'description']
    ordering_fields = ['work_group', 'category_code', 'category_name']
    ordering = ['work_group', 'category_code']
    pagination_class = None  # Disable pagination for categories
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by work_group
        work_group = self.request.query_params.get('work_group', None)
        if work_group:
            queryset = queryset.filter(work_group=work_group)
        
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho Payment management
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, PaymentPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['payment_category', 'payment_type', 'description', 'recipient__full_name']
    ordering_fields = ['created_at', 'request_date', 'amount', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """Filter payments theo quyền của user"""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_superuser:
            return queryset
        
        # Kế toán và Chủ nhiệm: Xem tất cả
        if user.role in ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky']:
            pass  # Return all
        else:
            # Người dùng thường: Chỉ xem thanh toán của mình hoặc mình tạo
            queryset = queryset.filter(
                Q(recipient=user) | Q(requested_by=user)
            )
        
        # Filter by work_group
        work_group = self.request.query_params.get('work_group', None)
        if work_group:
            queryset = queryset.filter(work_group=work_group)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(payment_category=category)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(request_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(request_date__lte=date_to)
        
        # Filter by recipient
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Phê duyệt hoặc từ chối thanh toán"""
        payment = self.get_object()
        serializer = PaymentApproveSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action_type = serializer.validated_data['action']
        
        if action_type == 'approve':
            if payment.status != 'pending':
                return Response(
                    {'error': 'Chỉ có thể phê duyệt thanh toán ở trạng thái chờ phê duyệt'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            payment.status = 'approved'
            payment.approved_by = request.user
            payment.approved_date = timezone.now().date()
            payment.save()
            
            return Response({
                'message': 'Thanh toán đã được phê duyệt',
                'payment': PaymentSerializer(payment).data
            })
        
        elif action_type == 'reject':
            if payment.status != 'pending':
                return Response(
                    {'error': 'Chỉ có thể từ chối thanh toán ở trạng thái chờ phê duyệt'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            payment.status = 'rejected'
            payment.approved_by = request.user
            payment.approved_date = timezone.now().date()
            payment.rejection_reason = serializer.validated_data.get('rejection_reason', '')
            payment.save()
            
            return Response({
                'message': 'Thanh toán đã bị từ chối',
                'payment': PaymentSerializer(payment).data
            })
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Đánh dấu thanh toán đã được thanh toán"""
        payment = self.get_object()
        
        if payment.status != 'approved':
            return Response(
                {'error': 'Chỉ có thể thanh toán các khoản đã được phê duyệt'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'paid'
        payment.paid_date = timezone.now().date()
        payment.save()
        
        return Response({
            'message': 'Thanh toán đã được đánh dấu là đã thanh toán',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Tổng quan thanh toán theo work group và status"""
        user = request.user
        
        # Base queryset
        if user.is_superuser or user.role in ['ke_toan', 'chu_nhiem', 'pho_chu_nhiem', 'truong_ban_thu_ky']:
            queryset = Payment.objects.all()
        else:
            queryset = Payment.objects.filter(
                Q(recipient=user) | Q(requested_by=user)
            )
        
        # Filter by work_group if provided
        work_group = request.query_params.get('work_group', None)
        if work_group:
            queryset = queryset.filter(work_group=work_group)
        
        # Summary by status
        status_summary = {}
        for status_code, status_label in Payment.STATUS_CHOICES:
            status_payments = queryset.filter(status=status_code)
            status_summary[status_code] = {
                'label': status_label,
                'count': status_payments.count(),
                'total_amount': float(status_payments.aggregate(Sum('amount'))['amount__sum'] or 0)
            }
        
        # Summary by work group
        group_summary = {}
        for group_code, group_label in Payment.WORK_GROUP_CHOICES:
            group_payments = queryset.filter(work_group=group_code)
            group_summary[group_code] = {
                'label': group_label,
                'count': group_payments.count(),
                'total_amount': float(group_payments.aggregate(Sum('amount'))['amount__sum'] or 0),
                'by_status': {}
            }
            
            # Status breakdown for each group
            for status_code, status_label in Payment.STATUS_CHOICES:
                status_count = group_payments.filter(status=status_code).count()
                if status_count > 0:
                    group_summary[group_code]['by_status'][status_code] = {
                        'label': status_label,
                        'count': status_count
                    }
        
        return Response({
            'by_status': status_summary,
            'by_work_group': group_summary,
            'total': {
                'count': queryset.count(),
                'total_amount': float(queryset.aggregate(Sum('amount'))['amount__sum'] or 0)
            }
        })