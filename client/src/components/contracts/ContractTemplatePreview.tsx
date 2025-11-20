"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContractTemplate } from "@/lib/api";
import { mergeTemplateContent } from "@/lib/contractTemplateMerge";
import { Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface ContractTemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContractTemplate | null;
}

// Sample data for preview
const sampleFormData = {
  contract_number: "HD-2024-001",
  work: null,
  work_name_input: "Tác phẩm mẫu",
  translator: null,
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  base_page_count: 100,
  translation_unit_price: 50000,
  translation_cost: 5000000,
  overview_writing_cost: 1000000,
  total_amount: 6000000,
  management_fee: 300000,
  tax_amount: 570000,
  advance_payment_1_percent: 30,
  advance_payment_1: 1500000,
  advance_payment_2_percent: 30,
  advance_payment_2: 1500000,
  advance_payment_include_overview: false,
  final_payment: 3000000,
  status: "draft",
  signed_at: undefined,
  contract_file: undefined,
  translator_full_name: "Nguyễn Văn A",
  translator_id_card: "001234567890",
  translator_address: "123 Đường ABC, Quận XYZ, TP. Hà Nội",
  translator_phone: "0123456789",
  translator_email: "nguyenvana@example.com",
  translator_bank_account: "1234567890",
  translator_bank_name: "Ngân hàng ABC",
  translator_bank_branch: "Chi nhánh Hà Nội",
  translator_tax_code: "1234567890",
};

const sampleWork = {
  id: 1,
  name: "Tác phẩm mẫu",
  title: "Tác phẩm mẫu",
  page_count: 100,
  word_count: 50000,
  translation_part_code: "PHTY",
};

const sampleTranslator = {
  id: 1,
  full_name: "Nguyễn Văn A",
  id_card_number: "001234567890",
  address: "123 Đường ABC, Quận XYZ, TP. Hà Nội",
  phone: "0123456789",
  email: "nguyenvana@example.com",
  bank_account_number: "1234567890",
  bank_name: "Ngân hàng ABC",
  bank_branch: "Chi nhánh Hà Nội",
  tax_code: "1234567890",
};

export function ContractTemplatePreview({
  open,
  onOpenChange,
  template,
}: ContractTemplatePreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: templateContent } = useQuery<string>({
    queryKey: ["templateContent", template?.id],
    queryFn: async () => {
      if (!template) return "";
      if (template.type === "rich_text") {
        return template.content || "";
      } else if (template.file_url) {
        // For Word files, we would need to fetch and convert to HTML
        // For now, return a placeholder
        return "<p>Preview không khả dụng cho file Word. Vui lòng tải xuống để xem.</p>";
      }
      return "";
    },
    enabled: !!template && open,
  });

  const mergedContent = template && templateContent
    ? mergeTemplateContent(templateContent, sampleFormData as any, sampleWork as any, sampleTranslator as any)
    : "";

  const handleDownload = async () => {
    if (!template) return;
    
    setIsGenerating(true);
    try {
      if (template.type === "rich_text") {
        // Generate Word from HTML content
        const blob = await apiClient.generateContractFromTemplate(
          template.id,
          sampleFormData as any,
          sampleWork as any,
          sampleTranslator as any
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Hop-dong-mau-${template.name}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Download Word template
        if (template.file_url) {
          window.open(template.file_url, "_blank");
        }
      }
    } catch (error: any) {
      console.error("Error generating contract:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước mẫu hợp đồng: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleDownload} disabled={isGenerating} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Đang tạo..." : "Tải xuống với dữ liệu mẫu"}
            </Button>
          </div>

          {template.type === "rich_text" ? (
            <div
              className="prose prose-sm max-w-none p-4 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: mergedContent }}
              style={{
                fontFamily: "Times New Roman, serif",
                fontSize: "13pt",
                lineHeight: "1.6",
              }}
            />
          ) : (
            <div className="p-4 border rounded-lg text-center text-muted-foreground">
              <p>Preview không khả dụng cho file Word.</p>
              <p className="text-sm mt-2">Vui lòng tải xuống để xem template với dữ liệu mẫu.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

