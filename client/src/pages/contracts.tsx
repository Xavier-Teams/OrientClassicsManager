"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatVietnameseNumber } from "@/lib/utils";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { CONTRACT_STATUS_LABELS } from "@/lib/constants";
import { apiClient, Contract, Work, Translator } from "@/lib/api";
import { ContractForm } from "@/components/contracts/ContractForm";
import { TranslatorInfoModal } from "@/components/translators/TranslatorInfoModal";
import { ContractDashboard } from "@/components/contracts/ContractDashboard";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  draft: "bg-workflow-draft",
  pending: "bg-priority-high",
  signed: "bg-workflow-approved",
  active: "bg-workflow-in-progress",
  completed: "bg-workflow-completed",
  cancelled: "bg-destructive",
};

const statusIcons: Record<string, any> = {
  draft: FileText,
  pending: Clock,
  signed: CheckCircle2,
  active: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

export default function Contracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [translationPartFilter, setTranslationPartFilter] = useState<string[]>(
    []
  );
  const [stageFilter, setStageFilter] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [signedDateFrom, setSignedDateFrom] = useState<string>("");
  const [signedDateTo, setSignedDateTo] = useState<string>("");
  const [progressFilter, setProgressFilter] = useState<string>("all"); // "all" | "new_signed" | "in_term" | "expired"
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all"); // "all" | "no_advance" | "advance_1" | "advance_2" | "final_settlement" | "refunded" | "not_refunded"
  const [contractFormOpen, setContractFormOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [contractDetailOpen, setContractDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );
  const [selectedTranslator, setSelectedTranslator] =
    useState<Translator | null>(null);
  const [translatorModalOpen, setTranslatorModalOpen] = useState(false);

  // Fetch contracts
  const { data: contractsData, isLoading: isLoadingContracts } = useQuery<{
    count: number;
    results: Contract[];
  }>({
    queryKey: ["contracts", { search: searchQuery, status: statusFilter }],
    queryFn: () =>
      apiClient.getContracts({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Fetch works for form
  const { data: worksData } = useQuery<{ count: number; results: Work[] }>({
    queryKey: ["works"],
    queryFn: () => apiClient.getWorks({ page_size: 1000 }),
  });

  // Fetch translators for form
  const { data: translatorsData } = useQuery<{
    count: number;
    results: Translator[];
  }>({
    queryKey: ["translators"],
    queryFn: () => apiClient.getTranslators({ active: true }),
  });

  // Fetch translation parts for form
  const { data: translationParts } = useQuery<
    Array<{ id: number; name: string; code: string }>
  >({
    queryKey: ["translationParts"],
    queryFn: () => apiClient.getTranslationParts(),
  });

  // Fetch stages for filter
  const { data: stages } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiClient.getStages(),
  });

  const contracts = contractsData?.results || [];
  const works = worksData?.results || [];
  const translators = translatorsData?.results || [];
  const stagesList = stages || [];

  // Helper function to get stage name from contract or work
  const getStageName = (contract: Contract): string | null => {
    // First check contract.stage
    if (contract.stage) {
      const stage = stagesList.find((s) => s.id === contract.stage);
      return stage?.name || null;
    }
    // Fallback to work.stage
    const work = works.find((w) => w.id === contract.work);
    if (work?.stage) {
      const stage = stagesList.find((s) => s.id === work.stage);
      return stage?.name || null;
    }
    return null;
  };

  // Helper function to get translation part name from contract or work
  const getTranslationPartName = (contract: Contract): string | null => {
    // First check contract.translation_part (code)
    if (contract.translation_part) {
      const part = translationParts?.find(
        (p) => p.code === contract.translation_part
      );
      return part?.name || null;
    }
    // Fallback to work.translation_part_name
    const work = works.find((w) => w.id === contract.work);
    return work?.translation_part_name || null;
  };

  // Get contract progress status: "new_signed" | "in_term" | "expired"
  const getContractProgressStatus = (contract: Contract): string => {
    if (!contract.signed_at) return "new_signed";

    const now = new Date();
    const endDate = contract.end_date ? new Date(contract.end_date) : null;

    if (!endDate) return "in_term";

    if (endDate < now) {
      return "expired";
    }

    return "in_term";
  };

  // Get payment status: "no_advance" | "advance_1" | "advance_2" | "final_settlement" | "refunded" | "not_refunded"
  const getPaymentStatus = (contract: Contract): string => {
    if (contract.status === "cancelled") {
      // Check if refunded (this would need to be stored in DB, for now assume not_refunded)
      return "not_refunded";
    }

    const advance1 =
      typeof contract.advance_payment_1 === "number"
        ? contract.advance_payment_1
        : parseFloat(String(contract.advance_payment_1 || 0));
    const advance2 =
      typeof contract.advance_payment_2 === "number"
        ? contract.advance_payment_2
        : parseFloat(String(contract.advance_payment_2 || 0));
    const finalPayment =
      typeof contract.final_payment === "number"
        ? contract.final_payment
        : parseFloat(String(contract.final_payment || 0));

    if (advance1 === 0 && advance2 === 0 && finalPayment === 0) {
      return "no_advance";
    }

    if (advance1 > 0 && advance2 === 0 && finalPayment === 0) {
      return "advance_1";
    }

    if (advance1 > 0 && advance2 > 0 && finalPayment === 0) {
      return "advance_2";
    }

    if (finalPayment > 0) {
      return "final_settlement";
    }

    return "no_advance";
  };

  // Get available years from contracts
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    contracts.forEach((contract) => {
      if (contract.signed_at) {
        const year = new Date(contract.signed_at).getFullYear();
        years.add(year);
      }
      if (contract.start_date) {
        const year = new Date(contract.start_date).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [contracts]);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Filter by translation part
      if (translationPartFilter.length > 0) {
        const work = works.find((w) => w.id === contract.work);
        if (
          !work ||
          !work.translation_part_code ||
          !translationPartFilter.includes(work.translation_part_code)
        ) {
          return false;
        }
      }

      // Filter by stage
      if (stageFilter.length > 0) {
        // First check contract.stage, then fallback to work.stage
        const contractStage = contract.stage;
        const work = works.find((w) => w.id === contract.work);
        const workStage = work?.stage;
        const stageId = contractStage || workStage;

        if (!stageId || !stageFilter.includes(stageId)) {
          return false;
        }
      }

      // Filter by year
      if (yearFilter.length > 0) {
        const contractYear = contract.signed_at
          ? new Date(contract.signed_at).getFullYear()
          : contract.start_date
          ? new Date(contract.start_date).getFullYear()
          : null;
        if (!contractYear || !yearFilter.includes(contractYear)) {
          return false;
        }
      }

      // Filter by signed date range
      if (signedDateFrom && contract.signed_at) {
        const signedDate = new Date(contract.signed_at);
        const fromDate = new Date(signedDateFrom);
        if (signedDate < fromDate) {
          return false;
        }
      }
      if (signedDateTo && contract.signed_at) {
        const signedDate = new Date(contract.signed_at);
        const toDate = new Date(signedDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (signedDate > toDate) {
          return false;
        }
      }

      // Filter by progress
      if (progressFilter !== "all") {
        const progressStatus = getContractProgressStatus(contract);
        if (progressStatus !== progressFilter) {
          return false;
        }
      }

      // Filter by payment status
      if (paymentStatusFilter !== "all") {
        const paymentStatus = getPaymentStatus(contract);
        if (paymentStatus !== paymentStatusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    contracts,
    translationPartFilter,
    stageFilter,
    yearFilter,
    signedDateFrom,
    signedDateTo,
    progressFilter,
    paymentStatusFilter,
    works,
  ]);

  // Calculate stats (use filteredContracts for display)
  const stats = useMemo(() => {
    const active = filteredContracts.filter(
      (c) => c.status === "active"
    ).length;
    const signed = filteredContracts.filter(
      (c) => c.status === "signed"
    ).length;
    const totalValue = filteredContracts.reduce((sum, c) => {
      const amount =
        typeof c.total_amount === "number"
          ? c.total_amount
          : parseFloat(String(c.total_amount || 0));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = filteredContracts.filter((c) => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      return (
        endDate >= now &&
        endDate <= thirtyDaysLater &&
        c.status !== "completed" &&
        c.status !== "cancelled"
      );
    }).length;

    return {
      active,
      signed,
      totalValue,
      expiringSoon,
    };
  }, [filteredContracts]);

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.createContract({
        contract_number: data.contract_number,
        work: data.work!,
        translator: data.translator!,
        template: data.template_id || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        base_page_count: data.base_page_count || 0,
        translation_unit_price: data.translation_unit_price || 0,
        translation_cost: data.translation_cost || 0,
        overview_writing_cost: data.overview_writing_cost || 0,
        total_amount:
          typeof data.total_amount === "number"
            ? data.total_amount.toString()
            : data.total_amount,
        advance_payment_1_percent: data.advance_payment_1_percent || 0,
        advance_payment_2_percent: data.advance_payment_2_percent || 0,
        advance_payment_include_overview:
          data.advance_payment_include_overview || false,
        stage: data.stage || undefined,
        translation_part: data.translation_part || undefined,
        advance_payment_1:
          typeof data.advance_payment_1 === "number"
            ? data.advance_payment_1.toString()
            : data.advance_payment_1 || "0",
        advance_payment_2:
          typeof data.advance_payment_2 === "number"
            ? data.advance_payment_2.toString()
            : data.advance_payment_2 || "0",
        final_payment:
          typeof data.final_payment === "number"
            ? data.final_payment.toString()
            : data.final_payment || "0",
        status: data.status || "draft",
        signed_at: data.signed_at || undefined,
        contract_file:
          data.contract_file instanceof File ? data.contract_file : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setContractFormOpen(false);
      toast({
        title: "Thành công",
        description: "Đã tạo hợp đồng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hợp đồng",
        variant: "destructive",
      });
    },
  });

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const totalAmount =
        typeof data.total_amount === "number"
          ? data.total_amount
          : parseFloat(data.total_amount || "0");
      const advance1 =
        typeof data.advance_payment_1 === "number"
          ? data.advance_payment_1
          : parseFloat(data.advance_payment_1 || "0");
      const advance2 =
        typeof data.advance_payment_2 === "number"
          ? data.advance_payment_2
          : parseFloat(data.advance_payment_2 || "0");
      const final =
        typeof data.final_payment === "number"
          ? data.final_payment
          : parseFloat(data.final_payment || "0");

      return apiClient.updateContract(id, {
        contract_number: data.contract_number,
        work: data.work!,
        translator: data.translator!,
        template: data.template_id || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        base_page_count: data.base_page_count || 0,
        translation_unit_price: data.translation_unit_price || 0,
        translation_cost: data.translation_cost || 0,
        overview_writing_cost: data.overview_writing_cost || 0,
        total_amount: totalAmount,
        advance_payment_1_percent: data.advance_payment_1_percent || 0,
        advance_payment_2_percent: data.advance_payment_2_percent || 0,
        advance_payment_include_overview:
          data.advance_payment_include_overview || false,
        stage: data.stage || undefined,
        translation_part: data.translation_part || undefined,
        advance_payment_1: advance1,
        advance_payment_2: advance2,
        final_payment: final,
        status: data.status,
        signed_at: data.signed_at || undefined,
        contract_file:
          data.contract_file instanceof File ? data.contract_file : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setContractFormOpen(false);
      setSelectedContract(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật hợp đồng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật hợp đồng",
        variant: "destructive",
      });
    },
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.deleteContract(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      toast({
        title: "Thành công",
        description: "Đã xóa hợp đồng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hợp đồng",
        variant: "destructive",
      });
    },
  });

  const handleCreateContract = () => {
    setSelectedContract(null);
    setContractFormOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setContractFormOpen(true);
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setContractDetailOpen(true);
  };

  const handleDeleteContract = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedContract) {
      await updateContractMutation.mutateAsync({
        id: selectedContract.id,
        data,
      });
    } else {
      await createContractMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = () => {
    if (contractToDelete) {
      deleteContractMutation.mutate(contractToDelete.id);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0 VNĐ";
    return formatVietnameseNumber(num) + " ₫";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Calculate progress (based on work progress if available)
  const getContractProgress = (contract: Contract) => {
    // For now, return 0. In the future, this could be calculated from work progress
    return 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="heading-contracts">
            Quản lý hợp đồng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý hợp đồng dịch thuật
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => (window.location.href = "/contracts/templates")}>
            <FileText className="h-4 w-4" />
            Quản lý mẫu hợp đồng
          </Button>
          <Button
            data-testid="button-add-contract"
            className="gap-2"
            onClick={handleCreateContract}>
            <Plus className="h-4 w-4" />
            Tạo hợp đồng
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm hợp đồng, dịch giả, tác phẩm..."
            className="pl-10"
            data-testid="input-search-contracts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-2 p-4 border rounded-lg bg-muted/50">
        <span className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc:
        </span>

        {/* Translation Part Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Hợp phần
              {translationPartFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {translationPartFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chọn hợp phần</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {translationParts?.map((part) => (
                  <div key={part.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`part-${part.id}`}
                      checked={translationPartFilter.includes(part.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTranslationPartFilter([
                            ...translationPartFilter,
                            part.code,
                          ]);
                        } else {
                          setTranslationPartFilter(
                            translationPartFilter.filter(
                              (code) => code !== part.code
                            )
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`part-${part.id}`}
                      className="text-sm font-normal cursor-pointer">
                      {part.name}
                    </Label>
                  </div>
                ))}
              </div>
              {translationPartFilter.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setTranslationPartFilter([])}>
                  Xóa tất cả
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Stage Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Giai đoạn
              {stageFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {stageFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chọn giai đoạn</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stages?.map((stage) => (
                  <div key={stage.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stage-${stage.id}`}
                      checked={stageFilter.includes(stage.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStageFilter([...stageFilter, stage.id]);
                        } else {
                          setStageFilter(
                            stageFilter.filter((id) => id !== stage.id)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`stage-${stage.id}`}
                      className="text-sm font-normal cursor-pointer">
                      {stage.name} ({stage.code})
                    </Label>
                  </div>
                ))}
              </div>
              {stageFilter.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setStageFilter([])}>
                  Xóa tất cả
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Year Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Năm
              {yearFilter.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {yearFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chọn năm</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableYears.map((year) => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={`year-${year}`}
                      checked={yearFilter.includes(year)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setYearFilter([...yearFilter, year]);
                        } else {
                          setYearFilter(yearFilter.filter((y) => y !== year));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`year-${year}`}
                      className="text-sm font-normal cursor-pointer">
                      {year}
                    </Label>
                  </div>
                ))}
              </div>
              {yearFilter.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setYearFilter([])}>
                  Xóa tất cả
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Signed Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Ngày ký
              {(signedDateFrom || signedDateTo) && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">
                Khoảng thời gian ký hợp đồng
              </Label>
              <div className="space-y-2">
                <div>
                  <Label
                    htmlFor="date-from"
                    className="text-xs text-muted-foreground">
                    Từ ngày
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={signedDateFrom}
                    onChange={(e) => setSignedDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="date-to"
                    className="text-xs text-muted-foreground">
                    Đến ngày
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={signedDateTo}
                    onChange={(e) => setSignedDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {(signedDateFrom || signedDateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSignedDateFrom("");
                    setSignedDateTo("");
                  }}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Progress Filter */}
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Tiến độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tiến độ</SelectItem>
            <SelectItem value="new_signed">Mới ký</SelectItem>
            <SelectItem value="in_term">Còn hạn</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={paymentStatusFilter}
          onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Trạng thái thanh toán" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thanh toán</SelectItem>
            <SelectItem value="no_advance">Chưa tạm ứng</SelectItem>
            <SelectItem value="advance_1">Đã tạm ứng lần 1</SelectItem>
            <SelectItem value="advance_2">Đã tạm ứng lần 2</SelectItem>
            <SelectItem value="final_settlement">Đã quyết toán</SelectItem>
            <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
            <SelectItem value="not_refunded">Chưa hoàn tiền</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear all filters */}
        {(translationPartFilter.length > 0 ||
          stageFilter.length > 0 ||
          yearFilter.length > 0 ||
          signedDateFrom ||
          signedDateTo ||
          progressFilter !== "all" ||
          paymentStatusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setTranslationPartFilter([]);
              setStageFilter([]);
              setYearFilter([]);
              setSignedDateFrom("");
              setSignedDateTo("");
              setProgressFilter("all");
              setPaymentStatusFilter("all");
            }}>
            <X className="h-4 w-4 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate" data-testid="stat-active-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang thực hiện
            </CardTitle>
            <Clock className="h-4 w-4 text-workflow-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Hợp đồng đang thực hiện
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-signed-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã ký</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-workflow-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.signed}</div>
            <p className="text-xs text-muted-foreground">Hợp đồng đã ký</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-total-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatVietnameseNumber(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">VNĐ</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-expiring-soon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Trong 30 ngày</p>
          </CardContent>
        </Card>
      </div>

      {isLoadingContracts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ||
              statusFilter !== "all" ||
              translationPartFilter.length > 0 ||
              stageFilter.length > 0 ||
              yearFilter.length > 0 ||
              signedDateFrom ||
              signedDateTo ||
              progressFilter !== "all" ||
              paymentStatusFilter !== "all"
                ? "Không tìm thấy hợp đồng nào phù hợp"
                : "Chưa có hợp đồng nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => {
            const StatusIcon = statusIcons[contract.status] || FileText;
            const progress = getContractProgress(contract);

            return (
              <Card
                key={contract.id}
                className="hover-elevate"
                data-testid={`contract-card-${contract.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {contract.contract_number}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`${
                              statusColors[contract.status] || "bg-gray-500"
                            } text-white border-0`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {CONTRACT_STATUS_LABELS[contract.status] ||
                              contract.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-muted-foreground">
                            Tác phẩm: {contract.work_name || "Chưa có"}
                          </p>
                          {getTranslationPartName(contract) && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-secondary text-secondary-foreground border-secondary">
                              Hợp phần: {getTranslationPartName(contract)}
                            </Badge>
                          )}
                          {getStageName(contract) && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/10 text-primary border-primary/20">
                              {getStageName(contract)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Dịch giả
                          </p>
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {contract.translator_name ? (
                              <button
                                onClick={() => {
                                  if (contract.translator_details) {
                                    setSelectedTranslator(
                                      contract.translator_details
                                    );
                                    setTranslatorModalOpen(true);
                                  }
                                }}
                                className="text-sm font-medium text-primary hover:underline cursor-pointer"
                                title="Xem thông tin dịch giả">
                                {contract.translator_name}
                              </button>
                            ) : (
                              <p className="text-sm font-medium">Chưa có</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Giá trị
                          </p>
                          <p className="text-sm font-medium">
                            {formatCurrency(contract.total_amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Ngày bắt đầu
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(contract.start_date)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Ngày kết thúc
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(contract.end_date)}
                          </p>
                        </div>
                      </div>

                      {contract.signed_at && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Ngày ký
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(contract.signed_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-${contract.id}`}
                        onClick={() => handleViewContract(contract)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditContract(contract)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteContract(contract)}
                            className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contract Form Modal */}
      <ContractForm
        open={contractFormOpen}
        onOpenChange={setContractFormOpen}
        contract={selectedContract || undefined}
        works={works}
        translators={translators}
        translationParts={translationParts || []}
        onSubmit={handleFormSubmit}
        isLoading={
          createContractMutation.isPending || updateContractMutation.isPending
        }
      />

      {/* Contract Detail Modal */}
      <Dialog open={contractDetailOpen} onOpenChange={setContractDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContract?.contract_number || "Chi tiết hợp đồng"}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết hợp đồng dịch thuật
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Số hợp đồng
                  </p>
                  <p className="text-base">
                    {selectedContract.contract_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Trạng thái
                  </p>
                  <Badge
                    variant="outline"
                    className={`${
                      statusColors[selectedContract.status] || "bg-gray-500"
                    } text-white border-0`}>
                    {CONTRACT_STATUS_LABELS[selectedContract.status] ||
                      selectedContract.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tác phẩm
                  </p>
                  <p className="text-base">
                    {selectedContract.work_name || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Hợp phần
                  </p>
                  <p className="text-base">
                    {getTranslationPartName(selectedContract) || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Giai đoạn
                  </p>
                  <p className="text-base">
                    {getStageName(selectedContract) || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Dịch giả
                  </p>
                  {selectedContract.translator_name ? (
                    <button
                      onClick={() => {
                        if (selectedContract.translator_details) {
                          setSelectedTranslator(
                            selectedContract.translator_details
                          );
                          setTranslatorModalOpen(true);
                        }
                      }}
                      className="text-base text-primary hover:underline cursor-pointer"
                      title="Xem thông tin dịch giả">
                      {selectedContract.translator_name}
                    </button>
                  ) : (
                    <p className="text-base">Chưa có</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Ngày bắt đầu
                  </p>
                  <p className="text-base">
                    {formatDate(selectedContract.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Ngày kết thúc
                  </p>
                  <p className="text-base">
                    {formatDate(selectedContract.end_date)}
                  </p>
                </div>
                {selectedContract.signed_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Ngày ký
                    </p>
                    <p className="text-base">
                      {formatDate(selectedContract.signed_at)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tổng giá trị
                  </p>
                  <p className="text-base font-semibold">
                    {formatCurrency(selectedContract.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tạm ứng lần 1
                  </p>
                  <p className="text-base">
                    {formatCurrency(selectedContract.advance_payment_1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tạm ứng lần 2
                  </p>
                  <p className="text-base">
                    {formatCurrency(selectedContract.advance_payment_2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Quyết toán
                  </p>
                  <p className="text-base">
                    {formatCurrency(selectedContract.final_payment)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Translator Info Modal */}
      <TranslatorInfoModal
        translator={selectedTranslator}
        open={translatorModalOpen}
        onOpenChange={setTranslatorModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hợp đồng{" "}
              <strong>{contractToDelete?.contract_number}</strong>? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
