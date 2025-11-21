"use client";

import { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MoreVertical,
  Eye,
  Check,
  X,
  Loader2,
  List,
  BookOpen,
  Edit3,
  Code,
  Briefcase,
} from "lucide-react";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_WORK_GROUP_LABELS,
} from "@/lib/constants";
import { apiClient, Payment, PaymentSummary } from "@/lib/api";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { useToast } from "@/hooks/use-toast";
import { formatVietnameseNumber } from "@/lib/utils";

const WORK_GROUP_TABS = [
  { id: "all", label: "Tất cả", icon: List },
  { id: "dich_thuat", label: "Dịch thuật", icon: BookOpen },
  { id: "bien_tap", label: "Biên tập", icon: Edit3 },
  { id: "cntt", label: "CNTT", icon: Code },
  { id: "hanh_chinh", label: "Hành chính", icon: Briefcase },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  rejected: "bg-red-500",
  paid: "bg-green-500",
  cancelled: "bg-gray-500",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  paid: CheckCircle2,
  cancelled: XCircle,
};

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [paymentToAction, setPaymentToAction] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page_size: 100,
    };
    if (activeTab !== "all") {
      params.work_group = activeTab;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (categoryFilter !== "all") {
      params.category = categoryFilter;
    }
    if (dateFrom) {
      params.date_from = dateFrom;
    }
    if (dateTo) {
      params.date_to = dateTo;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }
    return params;
  }, [activeTab, statusFilter, categoryFilter, dateFrom, dateTo, searchQuery]);

  // Fetch payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", queryParams],
    queryFn: () => apiClient.getPayments(queryParams),
  });

  // Fetch summary
  const { data: summary } = useQuery<PaymentSummary>({
    queryKey: ["payment-summary", activeTab],
    queryFn: () =>
      apiClient.getPaymentSummary(
        activeTab !== "all" ? { work_group: activeTab } : undefined
      ),
  });

  const payments = paymentsData?.results || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: "approve" | "reject"; reason?: string }) =>
      apiClient.approvePayment(id, action, reason),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thanh toán đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] });
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setPaymentToAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thanh toán",
        variant: "destructive",
      });
    },
  });

  // Mark paid mutation
  const markPaidMutation = useMutation({
    mutationFn: (id: number) => apiClient.markPaymentPaid(id),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thanh toán đã được đánh dấu là đã thanh toán",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đánh dấu thanh toán",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (payment: Payment) => {
    setPaymentToAction(payment);
    setApproveDialogOpen(true);
  };

  const handleReject = (payment: Payment) => {
    setPaymentToAction(payment);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (paymentToAction) {
      approveMutation.mutate({ id: paymentToAction.id, action: "approve" });
    }
  };

  const confirmReject = () => {
    if (paymentToAction && rejectionReason) {
      approveMutation.mutate({
        id: paymentToAction.id,
        action: "reject",
        reason: rejectionReason,
      });
    }
  };

  const handleMarkPaid = (payment: Payment) => {
    markPaidMutation.mutate(payment.id);
  };

  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const summaryData = summary || {
    by_status: {},
    by_work_group: {},
    total: { count: 0, total_amount: 0 },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý các khoản thanh toán
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPayment(null);
            setPaymentFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo yêu cầu thanh toán
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.by_status.pending?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                summaryData.by_status.pending?.total_amount || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã phê duyệt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.by_status.approved?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                summaryData.by_status.approved?.total_amount || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.by_status.paid?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summaryData.by_status.paid?.total_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData.total.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData.total.count} khoản
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {WORK_GROUP_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm thanh toán..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="Từ ngày"
            className="w-[150px]"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Đến ngày"
            className="w-[150px]"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Payment List */}
        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Không có thanh toán nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => {
                const StatusIcon = statusIcons[payment.status];
                return (
                  <Card key={payment.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {payment.payment_category} - {payment.payment_type}
                              </h3>
                              <Badge variant="secondary">
                                {payment.work_group_display}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`${statusColors[payment.status]} text-white border-0`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {payment.status_display}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Người nhận: {payment.recipient_name}
                              {payment.contract_number && ` • HĐ: ${payment.contract_number}`}
                              {payment.work_name && ` • Tác phẩm: ${payment.work_name}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Số tiền</p>
                              <p className="text-sm font-semibold text-primary">
                                {formatCurrency(payment.amount, payment.currency)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Ngày yêu cầu</p>
                              <p className="text-sm font-medium">
                                {new Date(payment.request_date).toLocaleDateString("vi-VN")}
                              </p>
                            </div>

                            {payment.approved_date && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Ngày phê duyệt</p>
                                <p className="text-sm font-medium">
                                  {new Date(payment.approved_date).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            )}

                            {payment.paid_date && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Ngày thanh toán</p>
                                <p className="text-sm font-medium">
                                  {new Date(payment.paid_date).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            )}
                          </div>

                          {payment.description && (
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setPaymentFormOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {payment.can_be_approved && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(payment)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Phê duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(payment)}>
                                  <X className="mr-2 h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.can_be_paid && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMarkPaid(payment)}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Đánh dấu đã thanh toán
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Form Dialog */}
      <PaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        payment={selectedPayment}
        workGroup={activeTab !== "all" ? activeTab : undefined}
      />

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt thanh toán này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove}>
              Phê duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Lý do từ chối..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={!rejectionReason}
            >
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}