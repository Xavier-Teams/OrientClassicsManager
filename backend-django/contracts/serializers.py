from rest_framework import serializers
from .models import TranslationContract


class TranslationContractSerializer(serializers.ModelSerializer):
    work_name = serializers.CharField(source='work.name', read_only=True)
    translator_name = serializers.SerializerMethodField()
    translator_details = serializers.SerializerMethodField()
    
    class Meta:
        model = TranslationContract
        fields = [
            'id', 'contract_number', 'work', 'work_name',
            'translator', 'translator_name', 'translator_details',
            'start_date', 'end_date',
            'total_amount', 'advance_payment_1', 'advance_payment_2', 'final_payment',
            'status', 'contract_file',
            'signed_at', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_translator_name(self, obj):
        """Lấy tên dịch giả từ Translator hoặc User (backward compatibility)"""
        if obj.translator:
            return obj.translator.full_name
        elif obj.translator_user:
            return obj.translator_user.full_name
        return None
    
    def get_translator_details(self, obj):
        """Lấy chi tiết dịch giả để tự động điền vào form hợp đồng"""
        if obj.translator:
            translator = obj.translator
            return {
                'id': translator.id,
                'full_name': translator.full_name,
                'first_name': translator.first_name,
                'last_name': translator.last_name,
                'id_card_number': translator.id_card_number,
                'id_card_issue_date': translator.id_card_issue_date,
                'id_card_issue_place': translator.id_card_issue_place,
                'workplace': translator.workplace,
                'address': translator.address,
                'phone': translator.phone,
                'email': translator.email,
                'bank_account_number': translator.bank_account_number,
                'bank_name': translator.bank_name,
                'bank_branch': translator.bank_branch,
                'tax_code': translator.tax_code,
            }
        return None

