from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Sum, Case, When, IntegerField
from django.db.models.functions import Coalesce
from .models import TranslationContract, ContractTemplate
from .serializers import TranslationContractSerializer, ContractTemplateSerializer


class TranslationContractViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Translation Contract management
    """
    queryset = TranslationContract.objects.all()
    serializer_class = TranslationContractSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['contract_number', 'work__name']
    ordering_fields = ['created_at', 'contract_number']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by work
        work_id = self.request.query_params.get('work_id', None)
        if work_id:
            queryset = queryset.filter(work_id=work_id)
        
        # Filter by translation_part
        translation_part = self.request.query_params.get('translation_part', None)
        if translation_part:
            queryset = queryset.filter(translation_part=translation_part)
        
        # Filter by stage
        stage = self.request.query_params.get('stage', None)
        if stage:
            queryset = queryset.filter(stage=stage)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Thống kê hợp đồng theo hợp phần và giai đoạn"""
        from collections import defaultdict
        
        # Lấy tất cả hợp đồng đã ký
        signed_contracts = self.get_queryset().filter(status='signed')
        
        # Thống kê theo hợp phần và giai đoạn
        stats = defaultdict(lambda: defaultdict(int))
        total_by_part = defaultdict(int)
        
        for contract in signed_contracts:
            part = contract.translation_part.name if contract.translation_part else (contract.work.translation_part.name if contract.work and contract.work.translation_part else 'Không xác định')
            stage_order = contract.stage.order if contract.stage else 0  # 0 = không xác định
            
            stats[part][stage_order] += 1
            total_by_part[part] += 1
        
        # Format kết quả
        result = []
        for part, stages in stats.items():
            part_stats = {
                'translation_part': part,
                'stage_1': stages.get(1, 0),
                'stage_2': stages.get(2, 0),
                'stage_3': stages.get(3, 0),
                'stage_4': stages.get(4, 0),
                'stage_5': stages.get(5, 0),
                'total': total_by_part[part],
            }
            result.append(part_stats)
        
        # Thống kê tổng
        total_stats = {
            'stage_1': sum(s.get(1, 0) for s in stats.values()),
            'stage_2': sum(s.get(2, 0) for s in stats.values()),
            'stage_3': sum(s.get(3, 0) for s in stats.values()),
            'stage_4': sum(s.get(4, 0) for s in stats.values()),
            'stage_5': sum(s.get(5, 0) for s in stats.values()),
            'total': sum(total_by_part.values()),
        }
        
        return Response({
            'by_part': result,
            'total': total_stats,
            'total_contracts': signed_contracts.count(),
        })
    
    @action(detail=False, methods=['get'])
    def progress_report(self, request):
        """Báo cáo tiến độ hợp đồng các hợp phần"""
        from django.db.models import Count, Q
        
        # Lấy tất cả hợp đồng
        all_contracts = self.get_queryset()
        
        # Thống kê theo trạng thái và hợp phần
        progress_stats = []
        
        # Lấy danh sách hợp phần từ works
        from works.models import TranslationPart
        parts = TranslationPart.objects.filter(is_active=True)
        
        for part in parts:
            contracts = all_contracts.filter(
                Q(translation_part=part) | Q(work__translation_part=part)
            )
            
            part_stats = {
                'translation_part': part.name,
                'translation_part_code': part.code,
                'draft': contracts.filter(status='draft').count(),
                'pending': contracts.filter(status='pending').count(),
                'signed': contracts.filter(status='signed').count(),
                'active': contracts.filter(status='active').count(),
                'completed': contracts.filter(status='completed').count(),
                'cancelled': contracts.filter(status='cancelled').count(),
                'total': contracts.count(),
            }
            progress_stats.append(part_stats)
        
        return Response({
            'progress_by_part': progress_stats,
            'summary': {
                'total_contracts': all_contracts.count(),
                'signed_contracts': all_contracts.filter(status='signed').count(),
                'active_contracts': all_contracts.filter(status='active').count(),
                'completed_contracts': all_contracts.filter(status='completed').count(),
            }
        })


class ContractTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contract Template management
    """
    queryset = ContractTemplate.objects.all()
    serializer_class = ContractTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'is_default']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by translation_part
        translation_part = self.request.query_params.get('translation_part', None)
        if translation_part:
            queryset = queryset.filter(translation_part=translation_part)
        
        # Filter by type
        template_type = self.request.query_params.get('type', None)
        if template_type:
            queryset = queryset.filter(type=template_type)
        
        return queryset
    
    def get_serializer_context(self):
        """Thêm request vào context để serializer có thể build absolute URL"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Set created_by khi tạo mới"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate contract document from template"""
        template = self.get_object()
        # TODO: Implement contract generation logic
        return Response({
            'message': 'Contract generation not yet implemented',
            'template_id': template.id
        }, status=501)
