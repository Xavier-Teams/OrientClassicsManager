from rest_framework import serializers
from .models import TranslationContract


class TranslationContractSerializer(serializers.ModelSerializer):
    work_name = serializers.CharField(source='work.name', read_only=True)
    translator_name = serializers.CharField(source='translator.full_name', read_only=True)
    
    class Meta:
        model = TranslationContract
        fields = [
            'id', 'contract_number', 'work', 'work_name',
            'translator', 'translator_name',
            'start_date', 'end_date',
            'total_amount', 'advance_payment_1', 'advance_payment_2', 'final_payment',
            'status', 'contract_file',
            'signed_at', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

