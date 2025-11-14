from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import TranslationContract
from .serializers import TranslationContractSerializer


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
        
        return queryset
