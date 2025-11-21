from rest_framework import serializers
from .models import TranslationContract, ContractTemplate


class TranslationContractSerializer(serializers.ModelSerializer):
    work_name = serializers.CharField(source='work.name', read_only=True)
    translator_name = serializers.SerializerMethodField()
    translator_details = serializers.SerializerMethodField()
    
    template_id = serializers.IntegerField(source='template.id', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    stage_id = serializers.IntegerField(source='stage.id', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    stage_order = serializers.IntegerField(source='stage.order', read_only=True)
    
    translation_part_id = serializers.IntegerField(source='translation_part.id', read_only=True)
    translation_part_name = serializers.CharField(source='translation_part.name', read_only=True)
    translation_part_code = serializers.CharField(source='translation_part.code', read_only=True)
    
    class Meta:
        model = TranslationContract
        fields = [
            'id', 'contract_number', 'work', 'work_name',
            'translator', 'translator_name', 'translator_details',
            'template', 'template_id', 'template_name',
            'start_date', 'end_date',
            'base_page_count', 'translation_unit_price', 'translation_cost',
            'overview_writing_cost', 'total_amount',
            'advance_payment_1_percent', 'advance_payment_2_percent',
            'advance_payment_include_overview',
            'advance_payment_1', 'advance_payment_2', 'final_payment',
            'status', 'stage', 'stage_id', 'stage_name', 'stage_order',
            'translation_part', 'translation_part_id', 'translation_part_name', 'translation_part_code',
            'contract_file',
            'signed_at', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_id', 'template_name']
    
    def to_representation(self, instance):
        """Override để tự động tính toán các giá trị nếu NULL và đảm bảo convert Decimal đúng"""
        representation = super().to_representation(instance)
        
        # Helper function to safely convert Decimal/string to float
        def safe_float(value):
            """Convert Decimal, string, or number to float safely
            CRITICAL: DecimalField stores values as-is (e.g., 300000.00 = 300000.00, NOT 3000.00)
            We must NOT divide by 100 or multiply by 100
            DRF serializes DecimalField as string like "300000.00" - we need to parse it correctly
            """
            if value is None:
                return 0.0
            
            # Handle Decimal objects directly (from instance)
            from decimal import Decimal
            if isinstance(value, Decimal):
                return float(value)
            
            if isinstance(value, str):
                # DRF serializes DecimalField as string "300000.00"
                # We need to parse it as a decimal number, NOT remove the decimal point
                try:
                    # Direct parse - "300000.00" should become 300000.0
                    return float(value)
                except (ValueError, TypeError):
                    return 0.0
            
            # Handle numbers
            try:
                return float(value)
            except (TypeError, ValueError):
                return 0.0
        
        # Convert all Decimal fields to proper float values
        # CRITICAL: DecimalField with decimal_places=2 stores values as-is (e.g., 300000.00)
        # DRF serializes them as strings "300000.00" which float() will parse correctly
        # We must NOT divide by 100 - the value in DB is already the correct amount
        representation['base_page_count'] = int(representation.get('base_page_count', 0) or 0)
        representation['translation_unit_price'] = safe_float(representation.get('translation_unit_price'))
        representation['translation_cost'] = safe_float(representation.get('translation_cost'))
        representation['overview_writing_cost'] = safe_float(representation.get('overview_writing_cost'))
        representation['total_amount'] = safe_float(representation.get('total_amount'))
        representation['advance_payment_1_percent'] = safe_float(representation.get('advance_payment_1_percent'))
        representation['advance_payment_2_percent'] = safe_float(representation.get('advance_payment_2_percent'))
        representation['advance_payment_1'] = safe_float(representation.get('advance_payment_1'))
        representation['advance_payment_2'] = safe_float(representation.get('advance_payment_2'))
        representation['final_payment'] = safe_float(representation.get('final_payment'))
        
        # Tính toán base_page_count nếu NULL
        if representation['base_page_count'] == 0:
            if instance.work and hasattr(instance.work, 'page_count'):
                representation['base_page_count'] = instance.work.page_count or 0
        
        # Tính toán translation_cost nếu NULL hoặc 0
        if representation['translation_cost'] == 0:
            total = representation['total_amount']
            advance1 = representation['advance_payment_1']
            advance2 = representation['advance_payment_2']
            
            if advance1 > 0 or advance2 > 0:
                # Ước tính từ advance payments (thường là 30-60% của translation_cost)
                total_advance = advance1 + advance2
                estimated_percent = 0.5  # 50% estimate
                estimated_cost = total_advance / estimated_percent if estimated_percent > 0 else total
                representation['translation_cost'] = min(estimated_cost, total)
            else:
                representation['translation_cost'] = total
        
        # Tính toán overview_writing_cost nếu NULL hoặc 0
        if representation['overview_writing_cost'] == 0:
            total = representation['total_amount']
            translation_cost = representation['translation_cost']
            representation['overview_writing_cost'] = max(0, total - translation_cost)
        
        # Tính toán translation_unit_price nếu NULL hoặc 0
        if representation['translation_unit_price'] == 0:
            translation_cost = representation['translation_cost']
            base_page_count = representation['base_page_count']
            if base_page_count > 0:
                representation['translation_unit_price'] = translation_cost / base_page_count
        
        # Tính toán advance_payment_1_percent nếu NULL hoặc 0
        if representation['advance_payment_1_percent'] == 0:
            advance1 = representation['advance_payment_1']
            if advance1 > 0:
                include_overview = instance.advance_payment_include_overview or False
                if include_overview:
                    base = representation['total_amount']
                else:
                    base = representation['translation_cost']
                if base > 0:
                    representation['advance_payment_1_percent'] = (advance1 / base) * 100
        
        # Tính toán advance_payment_2_percent nếu NULL hoặc 0
        if representation['advance_payment_2_percent'] == 0:
            advance2 = representation['advance_payment_2']
            if advance2 > 0:
                include_overview = instance.advance_payment_include_overview or False
                if include_overview:
                    base = representation['total_amount']
                else:
                    base = representation['translation_cost']
                if base > 0:
                    representation['advance_payment_2_percent'] = (advance2 / base) * 100
        
        return representation
    
    def get_base_page_count(self, obj):
        """Lấy từ DB nếu có, nếu không thì từ work"""
        if obj.base_page_count and obj.base_page_count > 0:
            return obj.base_page_count
        # Try to get from work
        if obj.work and hasattr(obj.work, 'page_count'):
            return obj.work.page_count or 0
        return 0
    
    def get_translation_cost(self, obj):
        """Tính toán từ dữ liệu hiện có nếu NULL"""
        if obj.translation_cost and obj.translation_cost > 0:
            return float(obj.translation_cost)
        
        # Tính toán từ total_amount và advance payments
        total = float(obj.total_amount or 0)
        advance1 = float(obj.advance_payment_1 or 0)
        advance2 = float(obj.advance_payment_2 or 0)
        
        if advance1 > 0 or advance2 > 0:
            # Ước tính translation_cost từ advance payments
            # Giả sử advance payments thường là 30-60% của translation_cost
            total_advance = advance1 + advance2
            estimated_percent = 0.5  # 50% estimate
            estimated_cost = total_advance / estimated_percent if estimated_percent > 0 else total
            return min(estimated_cost, total)  # Không vượt quá total_amount
        
        return total  # Mặc định bằng total_amount
    
    def get_overview_writing_cost(self, obj):
        """Tính toán từ dữ liệu hiện có nếu NULL"""
        if obj.overview_writing_cost and obj.overview_writing_cost > 0:
            return float(obj.overview_writing_cost)
        
        # Tính toán từ total_amount và translation_cost
        total = float(obj.total_amount or 0)
        translation_cost = self.get_translation_cost(obj)
        return max(0, total - translation_cost)
    
    def get_translation_unit_price(self, obj):
        """Tính toán từ translation_cost và base_page_count"""
        if obj.translation_unit_price and obj.translation_unit_price > 0:
            return float(obj.translation_unit_price)
        
        translation_cost = self.get_translation_cost(obj)
        base_page_count = self.get_base_page_count(obj)
        
        if base_page_count > 0:
            return translation_cost / base_page_count
        return 0
    
    def get_advance_payment_1_percent(self, obj):
        """Tính toán từ advance_payment_1 và base amount"""
        if obj.advance_payment_1_percent and obj.advance_payment_1_percent > 0:
            return float(obj.advance_payment_1_percent)
        
        advance1 = float(obj.advance_payment_1 or 0)
        if advance1 == 0:
            return 0
        
        # Xác định base amount để tính phần trăm
        include_overview = obj.advance_payment_include_overview or False
        if include_overview:
            base = float(obj.total_amount or 0)
        else:
            base = self.get_translation_cost(obj)
        
        if base > 0:
            return (advance1 / base) * 100
        return 0
    
    def get_advance_payment_2_percent(self, obj):
        """Tính toán từ advance_payment_2 và base amount"""
        if obj.advance_payment_2_percent and obj.advance_payment_2_percent > 0:
            return float(obj.advance_payment_2_percent)
        
        advance2 = float(obj.advance_payment_2 or 0)
        if advance2 == 0:
            return 0
        
        # Xác định base amount để tính phần trăm
        include_overview = obj.advance_payment_include_overview or False
        if include_overview:
            base = float(obj.total_amount or 0)
        else:
            base = self.get_translation_cost(obj)
        
        if base > 0:
            return (advance2 / base) * 100
        return 0
    
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


class ContractTemplateSerializer(serializers.ModelSerializer):
    """Serializer cho ContractTemplate"""
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ContractTemplate
        fields = [
            'id', 'name', 'description', 'type', 'content',
            'file', 'file_url', 'file_name', 'is_default',
            'translation_part', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_url']
    
    def get_file_url(self, obj):
        """Trả về URL của file nếu có"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

