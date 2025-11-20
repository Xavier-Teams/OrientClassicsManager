"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Work, Translator } from "@/lib/api";
import { CONTRACT_STATUS_LABELS } from "@/lib/constants";
import { Loader2, Plus, Edit, FileText, Upload, X } from "lucide-react";
import { WorkQuickCreateForm } from "./WorkQuickCreateForm";
import { ContractPreview } from "./ContractPreview";
import { WordEditor } from "./WordEditor";
import { apiClient, ContractTemplate } from "@/lib/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  formatVietnameseNumber,
  parseVietnameseNumber,
  formatCurrencyToWords,
  formatDateToVietnamese,
  parseVietnameseDate,
} from "@/lib/utils";

// Form values type
export type ContractFormValues = {
  contract_number: string;
  work: number | null;
  work_name_input: string; // For creating new work
  translator: number | null;
  start_date: string;
  end_date: string;
  // Kinh phí
  base_page_count: number; // Số trang cơ sở
  translation_unit_price: number; // Đơn giá dịch thuật
  translation_cost: number; // Kinh phí dịch thuật (tự động tính)
  overview_writing_cost: number; // Kinh phí viết bài tổng quan
  total_amount: number; // Tổng giá trị (tự động tính)
  // Chi phí khấu trừ
  management_fee: number; // Phí quản lý (5% tổng giá trị)
  tax_amount: number; // Thuế TNCN (10% * (tổng giá trị - phí quản lý))
  // Thanh toán
  advance_payment_1_percent: number; // Tạm ứng lần 1 (%)
  advance_payment_1: number; // Giá trị tạm ứng 1 (tự động tính)
  advance_payment_2_percent: number; // Tạm ứng lần 2 (%)
  advance_payment_2: number; // Giá trị tạm ứng 2 (tự động tính)
  advance_payment_include_overview: boolean; // Bao gồm kinh phí bài tổng quan trong tạm ứng (áp dụng chung cho cả 2 lần)
  final_payment: number; // Quyết toán (tự động tính)
  status: string;
  signed_at?: string; // Ngày ký hợp đồng
  contract_file?: File | string; // File PDF hợp đồng (File khi upload, string khi đã có)
  // Translator details for auto-fill (read-only display)
  translator_full_name?: string;
  translator_id_card?: string;
  translator_address?: string;
  translator_phone?: string;
  translator_email?: string;
  translator_bank_account?: string;
  translator_bank_name?: string;
  translator_bank_branch?: string;
  translator_tax_code?: string;
};

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: any; // Contract object for editing
  works?: Work[];
  translators?: Translator[];
  translationParts?: Array<{ id: number; name: string; code: string }>;
  onSubmit: (data: ContractFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ContractForm({
  open,
  onOpenChange,
  contract,
  works = [],
  translators = [],
  translationParts = [],
  onSubmit,
  isLoading = false,
}: ContractFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [workSelectMode, setWorkSelectMode] = useState<"select" | "create">(
    "select"
  );
  const [workQuickCreateOpen, setWorkQuickCreateOpen] = useState(false);
  const [workQuickCreateMode, setWorkQuickCreateMode] = useState<
    "simple" | "full"
  >("simple");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [wordEditorOpen, setWordEditorOpen] = useState(false);
  const [contractFilePreview, setContractFilePreview] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // Fetch templates
  const { data: templatesData } = useQuery<{
    count: number;
    results: ContractTemplate[];
  }>({
    queryKey: ["contractTemplates"],
    queryFn: () => apiClient.getContractTemplates({ page_size: 1000 }),
  });

  const templates = templatesData?.results || [];
  const defaultTemplate = templates.find((t) => t.is_default);

  const form = useForm<ContractFormValues>({
    defaultValues: {
      contract_number: "",
      work: null,
      work_name_input: "",
      translator: null,
      start_date: "",
      end_date: "",
      base_page_count: 0,
      translation_unit_price: 0,
      translation_cost: 0,
      overview_writing_cost: 0,
      total_amount: 0,
      management_fee: 0,
      tax_amount: 0,
      advance_payment_1_percent: 0,
      advance_payment_1: 0,
      advance_payment_2_percent: 0,
      advance_payment_2: 0,
      advance_payment_include_overview: false,
      final_payment: 0,
      status: "draft",
      signed_at: "",
      contract_file: undefined,
      translator_full_name: "",
      translator_id_card: "",
      translator_address: "",
      translator_phone: "",
      translator_email: "",
      translator_bank_account: "",
      translator_bank_name: "",
      translator_bank_branch: "",
      translator_tax_code: "",
    },
  });

  // Watch fields for auto-calculation
  const basePageCount = form.watch("base_page_count");
  const translationUnitPrice = form.watch("translation_unit_price");
  const overviewWritingCost = form.watch("overview_writing_cost");
  const advancePayment1Percent = form.watch("advance_payment_1_percent");
  const advancePayment2Percent = form.watch("advance_payment_2_percent");
  const advancePaymentIncludeOverview = form.watch(
    "advance_payment_include_overview"
  );
  const selectedWorkId = form.watch("work");
  const selectedTranslatorId = form.watch("translator");
  const workNameInput = form.watch("work_name_input");

  // Auto-calculate translation cost
  useEffect(() => {
    const translationCost = basePageCount * translationUnitPrice;
    form.setValue("translation_cost", translationCost);
  }, [basePageCount, translationUnitPrice, form]);

  // Auto-calculate total amount
  useEffect(() => {
    const translationCost = form.getValues("translation_cost") || 0;
    const overviewCost = overviewWritingCost || 0;
    const total = translationCost + overviewCost;
    form.setValue("total_amount", total);
  }, [form.getValues("translation_cost"), overviewWritingCost, form]);

  // Auto-calculate management fee (5% of total)
  useEffect(() => {
    const total = form.getValues("total_amount") || 0;
    const managementFee = total * 0.05;
    form.setValue("management_fee", managementFee);
  }, [form.getValues("total_amount"), form]);

  // Auto-calculate tax (10% of (total - management fee))
  useEffect(() => {
    const total = form.getValues("total_amount") || 0;
    const managementFee = form.getValues("management_fee") || 0;
    const taxAmount = (total - managementFee) * 0.1;
    form.setValue("tax_amount", taxAmount);
  }, [form.getValues("total_amount"), form.getValues("management_fee"), form]);

  // Auto-calculate advance payments
  useEffect(() => {
    const translationCost = form.getValues("translation_cost") || 0;
    const overviewCost = overviewWritingCost || 0;

    // Calculate base for advance payments (apply same rule to both)
    const advanceBase = advancePaymentIncludeOverview
      ? translationCost + overviewCost
      : translationCost;

    // Calculate advance payment 1
    const advance1 = (advanceBase * advancePayment1Percent) / 100;

    // Calculate advance payment 2
    const advance2 = (advanceBase * advancePayment2Percent) / 100;

    form.setValue("advance_payment_1", advance1);
    form.setValue("advance_payment_2", advance2);
  }, [
    form.getValues("translation_cost"),
    overviewWritingCost,
    advancePayment1Percent,
    advancePayment2Percent,
    advancePaymentIncludeOverview,
    form,
  ]);

  // Auto-calculate final payment
  useEffect(() => {
    const total = form.getValues("total_amount") || 0;
    const advance1 = form.getValues("advance_payment_1") || 0;
    const advance2 = form.getValues("advance_payment_2") || 0;
    const finalPayment = total - advance1 - advance2;
    form.setValue("final_payment", finalPayment);
  }, [
    form.getValues("total_amount"),
    form.getValues("advance_payment_1"),
    form.getValues("advance_payment_2"),
    form,
  ]);

  // Auto-fill translator details when translator is selected
  useEffect(() => {
    if (selectedTranslatorId) {
      const translator = translators.find(
        (t) => t.id === parseInt(selectedTranslatorId.toString())
      );
      if (translator) {
        form.setValue("translator_full_name", translator.full_name || "");
        form.setValue("translator_id_card", translator.id_card_number || "");
        form.setValue("translator_address", translator.address || "");
        form.setValue("translator_phone", translator.phone || "");
        form.setValue("translator_email", translator.email || "");
        form.setValue(
          "translator_bank_account",
          translator.bank_account_number || ""
        );
        form.setValue("translator_bank_name", translator.bank_name || "");
        form.setValue("translator_bank_branch", translator.bank_branch || "");
        form.setValue("translator_tax_code", translator.tax_code || "");
      }
    } else {
      // Clear translator details when no translator is selected
      form.setValue("translator_full_name", "");
      form.setValue("translator_id_card", "");
      form.setValue("translator_address", "");
      form.setValue("translator_phone", "");
      form.setValue("translator_email", "");
      form.setValue("translator_bank_account", "");
      form.setValue("translator_bank_name", "");
      form.setValue("translator_bank_branch", "");
      form.setValue("translator_tax_code", "");
    }
  }, [selectedTranslatorId, translators, form]);

  // Auto-fill work details when work is selected
  useEffect(() => {
    if (selectedWorkId) {
      const work = works.find(
        (w) => w.id === parseInt(selectedWorkId.toString())
      );
      if (work) {
        form.setValue("base_page_count", work.page_count || 0);
        // You might want to load unit price from work or contract settings

        // Auto-select template based on translation part
        if (
          work.translation_part_code &&
          templates.length > 0 &&
          !selectedTemplateId
        ) {
          // Try to find template matching translation part
          const matchingTemplate = templates.find(
            (t) => t.translation_part === work.translation_part_code
          );
          if (matchingTemplate) {
            setSelectedTemplateId(matchingTemplate.id);
          } else if (defaultTemplate) {
            // Fallback to default template
            setSelectedTemplateId(defaultTemplate.id);
          }
        }
      }
    }
  }, [
    selectedWorkId,
    works,
    form,
    templates,
    selectedTemplateId,
    defaultTemplate,
  ]);

  // Auto-select default template when form opens (if no template selected and no work selected)
  useEffect(() => {
    if (
      !contract &&
      !selectedTemplateId &&
      defaultTemplate &&
      templates.length > 0
    ) {
      setSelectedTemplateId(defaultTemplate.id);
    }
  }, [contract, selectedTemplateId, defaultTemplate, templates]);

  // Reset form when contract changes or dialog opens/closes
  useEffect(() => {
    if (contract) {
      // Calculate values from contract data
      const totalAmount = contract.total_amount || 0;
      const advance1 = contract.advance_payment_1 || 0;
      const advance2 = contract.advance_payment_2 || 0;
      const finalPayment = contract.final_payment || 0;

      // Try to get work details to calculate base_page_count and translation_unit_price
      const selectedWork = contract.work
        ? works.find((w) => w.id === contract.work)
        : null;
      const basePageCount = selectedWork?.page_count || 0;

      // Note: These fields are not stored in DB, so we need to estimate or let user re-enter
      // We'll try to calculate reasonable defaults:
      // - If we have advance payments, we can estimate translation_cost from advance percentages
      // - Otherwise, we'll use total_amount as translation_cost (assuming no overview cost)
      const advanceIncludeOverview =
        contract.advance_payment_include_overview ||
        contract.advance_payment_1_include_overview ||
        contract.advance_payment_2_include_overview ||
        false;

      let translationCost = totalAmount;
      let overviewCost = 0;

      // Calculate advance payment percentages first to estimate translation_cost
      // Try reverse calculation: if we know advance amounts and percentages, we can estimate base
      // But we don't have percentages stored, so we'll estimate from advance amounts
      if (!advanceIncludeOverview && (advance1 > 0 || advance2 > 0)) {
        // If advance payments don't include overview, estimate translation_cost
        // Assume typical percentages (e.g., 30% each) to estimate
        // This is a rough estimate - user may need to adjust
        const estimatedTotalAdvance = advance1 + advance2;
        // Estimate that advances are typically 30-60% of translation_cost
        // Use 50% as middle estimate
        const estimatedPercent = 0.5;
        translationCost = estimatedTotalAdvance / estimatedPercent;
        overviewCost = Math.max(0, totalAmount - translationCost);
      } else if (advanceIncludeOverview && (advance1 > 0 || advance2 > 0)) {
        // If includes overview, advances are based on total_amount
        // Estimate translation_cost by assuming overview is typically 10-20% of total
        const estimatedOverviewPercent = 0.15; // 15% estimate
        overviewCost = totalAmount * estimatedOverviewPercent;
        translationCost = totalAmount - overviewCost;
      }

      // Calculate translation_unit_price from translation_cost and base_page_count
      const unitPrice = basePageCount > 0 ? translationCost / basePageCount : 0;

      // Calculate advance payment percentages based on estimated values
      const advanceBase = advanceIncludeOverview
        ? totalAmount
        : translationCost;
      const advance1Percent =
        advanceBase > 0 ? (advance1 / advanceBase) * 100 : 0;
      const advance2Percent =
        advanceBase > 0 ? (advance2 / advanceBase) * 100 : 0;

      form.reset({
        contract_number: contract.contract_number || "",
        work: contract.work ? parseInt(contract.work.toString()) : null,
        work_name_input: "",
        translator: contract.translator
          ? parseInt(contract.translator.toString())
          : null,
        start_date: contract.start_date || "",
        end_date: contract.end_date || "",
        base_page_count: basePageCount,
        translation_unit_price: unitPrice,
        translation_cost: translationCost,
        overview_writing_cost: overviewCost,
        total_amount: totalAmount,
        management_fee: totalAmount * 0.05,
        tax_amount: (totalAmount - totalAmount * 0.05) * 0.1,
        advance_payment_1_percent: advance1Percent,
        advance_payment_1: advance1,
        advance_payment_2_percent: advance2Percent,
        advance_payment_2: advance2,
        advance_payment_include_overview: advanceIncludeOverview,
        final_payment: finalPayment,
        status: contract.status || "draft",
        signed_at: contract.signed_at || "",
        contract_file: contract.contract_file || undefined,
        translator_full_name: contract.translator_details?.full_name || "",
        translator_id_card: contract.translator_details?.id_card_number || "",
        translator_address: contract.translator_details?.address || "",
        translator_phone: contract.translator_details?.phone || "",
        translator_email: contract.translator_details?.email || "",
        translator_bank_account:
          contract.translator_details?.bank_account_number || "",
        translator_bank_name: contract.translator_details?.bank_name || "",
        translator_bank_branch: contract.translator_details?.bank_branch || "",
        translator_tax_code: contract.translator_details?.tax_code || "",
      });
      setWorkSelectMode("select");
    } else {
      form.reset({
        contract_number: "",
        work: null,
        work_name_input: "",
        translator: null,
        start_date: "",
        end_date: "",
        base_page_count: 0,
        translation_unit_price: 0,
        translation_cost: 0,
        overview_writing_cost: 0,
        total_amount: 0,
        management_fee: 0,
        tax_amount: 0,
        advance_payment_1_percent: 0,
        advance_payment_1: 0,
        advance_payment_2_percent: 0,
        advance_payment_2: 0,
        advance_payment_include_overview: false,
        final_payment: 0,
        status: "draft",
        translator_full_name: "",
        translator_id_card: "",
        translator_address: "",
        translator_phone: "",
        translator_email: "",
        translator_bank_account: "",
        translator_bank_name: "",
        translator_bank_branch: "",
        translator_tax_code: "",
      });
      setWorkSelectMode("select");
    }
  }, [contract, form, works]);

  const handleCreateWorkSimple = async () => {
    const workName = workNameInput.trim();
    if (!workName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên tác phẩm",
        variant: "destructive",
      });
      return;
    }

    try {
      const newWork = await apiClient.createWork({
        name: workName,
        source_language: "Hán văn",
        target_language: "Tiếng Việt",
        page_count: 0,
        word_count: 0,
        state: "draft",
        priority: "0",
        translation_progress: 0,
      });

      // Refresh works list
      queryClient.invalidateQueries({ queryKey: ["works"] });

      // Set the newly created work
      form.setValue("work", newWork.id);
      form.setValue("work_name_input", "");
      setWorkSelectMode("select");

      toast({
        title: "Thành công",
        description: `Đã tạo tác phẩm "${workName}"`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo tác phẩm",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkFull = async (workData: any) => {
    try {
      const newWork = await apiClient.createWork({
        name: workData.name,
        name_original: workData.name_original,
        author: workData.author,
        source_language: workData.source_language,
        target_language: workData.target_language,
        page_count: workData.page_count || 0,
        word_count: workData.word_count || 0,
        description: workData.description,
        translation_part: workData.translation_part_id,
        translator: undefined, // Will be set later
        state: workData.state || "draft",
        priority: workData.priority || "0",
        translation_progress: 0,
        notes: workData.notes,
      });

      // Refresh works list
      queryClient.invalidateQueries({ queryKey: ["works"] });

      // Set the newly created work
      form.setValue("work", newWork.id);
      form.setValue("base_page_count", newWork.page_count || 0);
      form.setValue("work_name_input", "");
      setWorkSelectMode("select");

      toast({
        title: "Thành công",
        description: `Đã tạo tác phẩm "${workData.name}"`,
      });

      return newWork.id;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo tác phẩm",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async (data: ContractFormValues) => {
    if (!data.work) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hoặc tạo tác phẩm",
        variant: "destructive",
      });
      return;
    }

    await onSubmit({
      ...data,
      total_amount: data.total_amount,
      advance_payment_1: data.advance_payment_1,
      advance_payment_2: data.advance_payment_2,
      final_payment: data.final_payment,
    });
  };

  const formatCurrency = (amount: number) => {
    return formatVietnameseNumber(amount) + " VNĐ";
  };

  // Check if work name input matches any existing work
  const matchingWorks = useMemo(() => {
    if (!workNameInput.trim()) return [];
    const searchTerm = workNameInput.toLowerCase();
    return works.filter((w) => w.name.toLowerCase().includes(searchTerm));
  }, [workNameInput, works]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {contract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
            </DialogTitle>
            <DialogDescription>
              {contract
                ? "Cập nhật thông tin hợp đồng dịch thuật"
                : "Điền thông tin để tạo hợp đồng dịch thuật mới. Thông tin dịch giả sẽ được tự động điền khi bạn chọn dịch giả."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contract_number"
                    rules={{ required: "Số hợp đồng là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số hợp đồng</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="HĐ-2024-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CONTRACT_STATUS_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Work Selection/Creation */}
                <div className="space-y-2">
                  <FormLabel>Tác phẩm *</FormLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {workSelectMode === "select" ? (
                        <FormField
                          control={form.control}
                          name="work"
                          rules={{ required: "Tác phẩm là bắt buộc" }}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  if (value === "none") {
                                    field.onChange(null);
                                  } else if (value === "create_new") {
                                    setWorkSelectMode("create");
                                    field.onChange(null);
                                  } else {
                                    field.onChange(parseInt(value));
                                  }
                                }}
                                value={
                                  field.value != null
                                    ? field.value.toString()
                                    : "none"
                                }>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn tác phẩm hoặc tạo mới" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">
                                    Chưa chọn
                                  </SelectItem>
                                  {works.map((work) => (
                                    <SelectItem
                                      key={work.id}
                                      value={work.id.toString()}>
                                      {work.name}
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="create_new"
                                    className="text-primary font-medium">
                                    <Plus className="inline h-4 w-4 mr-1" />
                                    Tạo tác phẩm mới
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="work_name_input"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Nhập tên tác phẩm mới"
                                    onKeyDown={(e) => {
                                      if (e.key === "Escape") {
                                        setWorkSelectMode("select");
                                        field.onChange("");
                                      }
                                    }}
                                  />
                                </FormControl>
                                {matchingWorks.length > 0 && (
                                  <FormDescription className="text-xs">
                                    Tìm thấy {matchingWorks.length} tác phẩm
                                    tương tự. Bạn có muốn chọn một trong số này?
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {matchingWorks.length > 0 && (
                            <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                              {matchingWorks.map((work) => (
                                <button
                                  key={work.id}
                                  type="button"
                                  onClick={() => {
                                    form.setValue("work", work.id);
                                    form.setValue("work_name_input", "");
                                    setWorkSelectMode("select");
                                  }}
                                  className="w-full text-left px-2 py-1 hover:bg-muted rounded text-sm">
                                  {work.name}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCreateWorkSimple}
                              disabled={!workNameInput.trim()}
                              className="flex-1">
                              <Plus className="h-4 w-4 mr-1" />
                              Tạo mới "{workNameInput.trim() || "Tác phẩm"}"
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!workNameInput.trim()) {
                                  toast({
                                    title: "Lỗi",
                                    description: "Vui lòng nhập tên tác phẩm",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                setWorkQuickCreateMode("full");
                                setWorkQuickCreateOpen(true);
                              }}
                              disabled={!workNameInput.trim()}
                              className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Tạo mới và chỉnh sửa "
                              {workNameInput.trim() || "Tác phẩm"}"
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWorkSelectMode("select");
                                form.setValue("work_name_input", "");
                              }}>
                              Hủy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="translator"
                    rules={{ required: "Dịch giả là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dịch giả</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "none" ? null : parseInt(value)
                            )
                          }
                          value={
                            field.value != null
                              ? field.value.toString()
                              : "none"
                          }>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn dịch giả" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Chưa chọn</SelectItem>
                            {translators
                              .filter((t) => t.active !== false)
                              .map((translator) => (
                                <SelectItem
                                  key={translator.id}
                                  value={translator.id.toString()}>
                                  {translator.full_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Chọn dịch giả để tự động điền thông tin vào hợp đồng
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Template Selection */}
                  <FormItem>
                    <FormLabel>Mẫu hợp đồng (tùy chọn)</FormLabel>
                    <Select
                      value={selectedTemplateId?.toString() || ""}
                      onValueChange={(value) => {
                        setSelectedTemplateId(value ? parseInt(value) : null);
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mẫu hợp đồng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Không sử dụng mẫu</SelectItem>
                        {templates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}>
                            {template.name}
                            {template.is_default && " (Mặc định)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn mẫu hợp đồng để áp dụng khi tạo hợp đồng. Mẫu sẽ tự
                      động điền các thông tin vào hợp đồng.
                    </FormDescription>
                  </FormItem>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      rules={{ required: "Ngày bắt đầu là bắt buộc" }}
                      render={({ field }) => {
                        const displayValue = field.value
                          ? formatDateToVietnamese(field.value)
                          : "";
                        return (
                          <FormItem>
                            <FormLabel>Ngày bắt đầu</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={displayValue}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Auto-format: add slashes
                                  value = value.replace(/[^\d]/g, "");
                                  if (value.length > 2) {
                                    value =
                                      value.slice(0, 2) + "/" + value.slice(2);
                                  }
                                  if (value.length > 5) {
                                    value =
                                      value.slice(0, 5) +
                                      "/" +
                                      value.slice(5, 9);
                                  }

                                  const parsed = parseVietnameseDate(value);
                                  if (parsed) {
                                    field.onChange(parsed);
                                  } else if (value === "") {
                                    field.onChange("");
                                  }
                                }}
                                onBlur={(e) => {
                                  const parsed = parseVietnameseDate(
                                    e.target.value
                                  );
                                  if (parsed) {
                                    field.onChange(parsed);
                                  }
                                  field.onBlur();
                                }}
                                maxLength={10}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Định dạng: dd/mm/yyyy (ví dụ: 29/12/2025)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      rules={{ required: "Ngày kết thúc là bắt buộc" }}
                      render={({ field }) => {
                        const displayValue = field.value
                          ? formatDateToVietnamese(field.value)
                          : "";
                        return (
                          <FormItem>
                            <FormLabel>Ngày kết thúc</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={displayValue}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Auto-format: add slashes
                                  value = value.replace(/[^\d]/g, "");
                                  if (value.length > 2) {
                                    value =
                                      value.slice(0, 2) + "/" + value.slice(2);
                                  }
                                  if (value.length > 5) {
                                    value =
                                      value.slice(0, 5) +
                                      "/" +
                                      value.slice(5, 9);
                                  }

                                  const parsed = parseVietnameseDate(value);
                                  if (parsed) {
                                    field.onChange(parsed);
                                  } else if (value === "") {
                                    field.onChange("");
                                  }
                                }}
                                onBlur={(e) => {
                                  const parsed = parseVietnameseDate(
                                    e.target.value
                                  );
                                  if (parsed) {
                                    field.onChange(parsed);
                                  }
                                  field.onBlur();
                                }}
                                maxLength={10}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Định dạng: dd/mm/yyyy (ví dụ: 29/12/2025)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Kinh phí */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Kinh phí</h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="base_page_count"
                    render={({ field }) => {
                      const displayValue = formatVietnameseNumber(field.value);
                      return (
                        <FormItem>
                          <FormLabel>Số trang cơ sở</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0"
                              value={displayValue}
                              onChange={(e) => {
                                const parsed = parseVietnameseNumber(
                                  e.target.value
                                );
                                field.onChange(Math.floor(parsed)); // Ensure integer
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="translation_unit_price"
                    render={({ field }) => {
                      const displayValue = formatVietnameseNumber(field.value);
                      return (
                        <FormItem>
                          <FormLabel>Đơn giá dịch thuật (VNĐ/trang)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0"
                              value={displayValue}
                              onChange={(e) => {
                                const parsed = parseVietnameseNumber(
                                  e.target.value
                                );
                                field.onChange(parsed);
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormDescription className="text-xs italic text-muted-foreground">
                            {field.value > 0
                              ? formatCurrencyToWords(field.value)
                              : ""}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="translation_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kinh phí dịch thuật</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            readOnly
                            value={formatVietnameseNumber(field.value)}
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          = Số trang × Đơn giá
                          {field.value > 0 && (
                            <span className="block text-xs italic text-muted-foreground mt-1">
                              {formatCurrencyToWords(field.value)}
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="overview_writing_cost"
                    render={({ field }) => {
                      const displayValue = formatVietnameseNumber(field.value);
                      return (
                        <FormItem>
                          <FormLabel>
                            Kinh phí viết bài tổng quan/Thuật dẫn (VNĐ)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0"
                              value={displayValue}
                              onChange={(e) => {
                                const parsed = parseVietnameseNumber(
                                  e.target.value
                                );
                                field.onChange(parsed);
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormDescription className="text-xs italic text-muted-foreground">
                            {field.value > 0
                              ? formatCurrencyToWords(field.value)
                              : ""}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tổng giá trị hợp đồng (VNĐ)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            readOnly
                            value={formatVietnameseNumber(field.value)}
                            className="bg-muted font-semibold"
                          />
                        </FormControl>
                        <FormDescription>
                          = Kinh phí dịch thuật + Kinh phí viết bài tổng quan
                          {field.value > 0 && (
                            <span className="block text-xs italic text-muted-foreground mt-1">
                              {formatCurrencyToWords(field.value)}
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Chi phí khấu trừ */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Chi phí khấu trừ</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="management_fee"
                    render={({ field }) => {
                      const roundedValue = Math.round(field.value || 0);
                      return (
                        <FormItem>
                          <FormLabel>Phí quản lý (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              readOnly
                              value={formatVietnameseNumber(roundedValue)}
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            = 5% × Tổng giá trị hợp đồng
                            {roundedValue > 0 && (
                              <span className="block text-xs italic text-muted-foreground mt-1">
                                {formatCurrencyToWords(roundedValue)}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => {
                      const roundedValue = Math.round(field.value || 0);
                      return (
                        <FormItem>
                          <FormLabel>Thuế TNCN (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              readOnly
                              value={formatVietnameseNumber(roundedValue)}
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            = 10% × (Tổng giá trị - Phí quản lý)
                            {roundedValue > 0 && (
                              <span className="block text-xs italic text-muted-foreground mt-1">
                                {formatCurrencyToWords(roundedValue)}
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Thanh toán */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Thanh toán</h3>
                <FormDescription>
                  Tạm ứng được tính theo phần trăm của kinh phí dịch thuật. Bạn
                  có thể chọn bao gồm kinh phí bài tổng quan vào cơ sở tính toán
                  tạm ứng.
                </FormDescription>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="advance_payment_1_percent"
                      render={({ field }) => {
                        // Format percentage: use comma for decimal separator (Vietnamese standard)
                        const value = field.value || 0;
                        const displayValue =
                          value === 0
                            ? ""
                            : value.toString().replace(/\./g, ",");
                        return (
                          <FormItem>
                            <FormLabel>Tạm ứng lần 1 (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="0"
                                value={displayValue}
                                onChange={(e) => {
                                  // Allow numbers and comma for decimal separator
                                  const cleaned = e.target.value
                                    .replace(/[^\d,]/g, "")
                                    .replace(/,/g, ".");
                                  const parsed = parseFloat(cleaned) || 0;
                                  field.onChange(parsed);
                                }}
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <FormDescription>
                              % trên kinh phí dịch thuật
                              {advancePaymentIncludeOverview &&
                                " (bao gồm bài tổng quan)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="advance_payment_1"
                      render={({ field }) => {
                        const roundedValue = Math.round(field.value || 0);
                        return (
                          <FormItem>
                            <FormLabel>Giá trị tạm ứng lần 1 (VNĐ)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                readOnly
                                value={formatVietnameseNumber(roundedValue)}
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormDescription className="text-xs italic text-muted-foreground">
                              {roundedValue > 0
                                ? formatCurrencyToWords(roundedValue)
                                : ""}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="advance_payment_2_percent"
                      render={({ field }) => {
                        // Format percentage: use comma for decimal separator (Vietnamese standard)
                        const value = field.value || 0;
                        const displayValue =
                          value === 0
                            ? ""
                            : value.toString().replace(/\./g, ",");
                        return (
                          <FormItem>
                            <FormLabel>Tạm ứng lần 2 (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="0"
                                value={displayValue}
                                onChange={(e) => {
                                  // Allow numbers and comma for decimal separator
                                  const cleaned = e.target.value
                                    .replace(/[^\d,]/g, "")
                                    .replace(/,/g, ".");
                                  const parsed = parseFloat(cleaned) || 0;
                                  field.onChange(parsed);
                                }}
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <FormDescription>
                              % trên kinh phí dịch thuật
                              {advancePaymentIncludeOverview &&
                                " (bao gồm bài tổng quan)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="advance_payment_2"
                      render={({ field }) => {
                        const roundedValue = Math.round(field.value || 0);
                        return (
                          <FormItem>
                            <FormLabel>Giá trị tạm ứng lần 2 (VNĐ)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                readOnly
                                value={formatVietnameseNumber(roundedValue)}
                                className="bg-muted"
                              />
                            </FormControl>
                            <FormDescription className="text-xs italic text-muted-foreground">
                              {roundedValue > 0
                                ? formatCurrencyToWords(roundedValue)
                                : ""}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="advance_payment_include_overview"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Bao gồm kinh phí bài tổng quan
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Nếu chọn, cả hai lần tạm ứng sẽ tính trên (Kinh phí
                          dịch thuật + Kinh phí bài tổng quan)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="final_payment"
                  render={({ field }) => {
                    const roundedValue = Math.round(field.value || 0);
                    return (
                      <FormItem>
                        <FormLabel>Quyết toán (VNĐ)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            readOnly
                            value={formatVietnameseNumber(roundedValue)}
                            className="bg-muted font-semibold"
                          />
                        </FormControl>
                        <FormDescription>
                          = Tổng giá trị - Tạm ứng lần 1 - Tạm ứng lần 2
                          {roundedValue > 0 && (
                            <span className="block text-xs italic text-muted-foreground mt-1">
                              {formatCurrencyToWords(roundedValue)}
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Contract File and Signed Date */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Hồ sơ hợp đồng</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signed_at"
                    render={({ field }) => {
                      const displayValue = field.value
                        ? formatDateToVietnamese(field.value)
                        : "";
                      return (
                        <FormItem>
                          <FormLabel>Ngày ký hợp đồng</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="dd/mm/yyyy"
                              value={displayValue}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Auto-format: add slashes
                                value = value.replace(/[^\d]/g, "");
                                if (value.length > 2) {
                                  value =
                                    value.slice(0, 2) + "/" + value.slice(2);
                                }
                                if (value.length > 5) {
                                  value =
                                    value.slice(0, 5) + "/" + value.slice(5, 9);
                                }

                                const parsed = parseVietnameseDate(value);
                                if (parsed) {
                                  field.onChange(parsed);
                                } else if (value === "") {
                                  field.onChange("");
                                }
                              }}
                              onBlur={(e) => {
                                const parsed = parseVietnameseDate(
                                  e.target.value
                                );
                                if (parsed) {
                                  field.onChange(parsed);
                                }
                                field.onBlur();
                              }}
                              maxLength={10}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Ngày ký hợp đồng (nếu đã ký). Định dạng: dd/mm/yyyy
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="contract_file"
                    render={({ field }) => {
                      const fileValue = field.value;
                      const isFile = fileValue instanceof File;
                      const isString =
                        typeof fileValue === "string" && fileValue;

                      return (
                        <FormItem>
                          <FormLabel>File PDF hợp đồng</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              {isFile || isString ? (
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="flex-1 text-sm truncate">
                                    {isFile
                                      ? fileValue.name
                                      : "File đã tải lên"}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      field.onChange(undefined);
                                      setContractFilePreview(null);
                                    }}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.type !== "application/pdf") {
                                          toast({
                                            title: "Lỗi",
                                            description:
                                              "Vui lòng chọn file PDF",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        field.onChange(file);
                                        // Create preview URL
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setContractFilePreview(
                                            reader.result as string
                                          );
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="flex-1"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tải lên file PDF của hợp đồng đã ký
                          </FormDescription>
                          {isString && (
                            <a
                              href={isString ? fileValue : undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline">
                              Xem file hiện tại
                            </a>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Translator Information (Auto-filled, editable) */}
              {selectedTranslatorId && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">
                    Thông tin dịch giả (tự động điền)
                  </h3>
                  <FormDescription>
                    Thông tin này được tự động điền từ hồ sơ dịch giả. Bạn có
                    thể chỉnh sửa nếu cần.
                  </FormDescription>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="translator_full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_id_card"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số CMND/CCCD</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_bank_account"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tài khoản</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên ngân hàng</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_bank_branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chi nhánh</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translator_tax_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã số thuế TNCN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWordEditorOpen(true)}
                  disabled={isLoading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Tải lên & Chỉnh sửa Word
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentData = form.getValues();
                    if (currentData.work && currentData.translator) {
                      setPreviewOpen(true);
                    } else {
                      toast({
                        title: "Thông báo",
                        description:
                          "Vui lòng chọn tác phẩm và dịch giả trước khi xem trước hợp đồng",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isLoading}>
                  Xem trước hợp đồng
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {contract ? "Cập nhật" : "Tạo hợp đồng"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Work Quick Create Form Modal */}
      <WorkQuickCreateForm
        open={workQuickCreateOpen}
        onOpenChange={setWorkQuickCreateOpen}
        workName={workNameInput}
        translationParts={translationParts}
        onSubmit={handleCreateWorkFull}
        isLoading={false}
      />

      {/* Contract Preview Modal */}
      <ContractPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formData={form.getValues()}
        work={works.find((w) => w.id === form.watch("work")!)}
        translator={translators.find((t) => t.id === form.watch("translator")!)}
      />

      {/* Word Editor Modal */}
      <WordEditor
        open={wordEditorOpen}
        onOpenChange={setWordEditorOpen}
        onSave={(htmlContent) => {
          // Có thể lưu HTML content vào database hoặc xử lý khác
          console.log("Saved HTML content:", htmlContent);
        }}
      />
    </>
  );
}
