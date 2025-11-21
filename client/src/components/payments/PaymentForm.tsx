"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, Payment, PaymentCategoryConfig, Contract, Work, User } from "@/lib/api";
import { PAYMENT_WORK_GROUP_LABELS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  workGroup?: string;
}

export function PaymentForm({ open, onOpenChange, payment, workGroup: initialWorkGroup }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [workGroup, setWorkGroup] = useState<string>(initialWorkGroup || "");
  const [category, setCategory] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [contractId, setContractId] = useState<string>("");
  const [workId, setWorkId] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("VND");
  const [description, setDescription] = useState<string>("");
  const [requestDate, setRequestDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Load payment categories for selected work group
  const { data: categories = [] } = useQuery<PaymentCategoryConfig[]>({
    queryKey: ["payment-categories", workGroup],
    queryFn: () => apiClient.getPaymentCategories({ work_group: workGroup }),
    enabled: !!workGroup,
  });

  // Load contracts for work group
  const { data: contractsData } = useQuery<{ results: Contract[] }>({
    queryKey: ["contracts", workGroup],
    queryFn: () => apiClient.getContracts({ status: "signed,active" }),
    enabled: !!workGroup && workGroup === "dich_thuat",
  });
  const contracts = contractsData?.results || [];

  // Load works for work group
  const { data: worksData } = useQuery<{ results: Work[] }>({
    queryKey: ["works", workGroup],
    queryFn: () => apiClient.getWorks({}),
    enabled: !!workGroup,
  });
  const works = worksData?.results || [];

  // Load users for recipient selection
  const { data: usersData } = useQuery<{ results: User[] }>({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(),
  });
  const users = usersData?.results || [];

  // Load payment data if editing
  useEffect(() => {
    if (payment) {
      setWorkGroup(payment.work_group);
      setCategory(payment.payment_category);
      setPaymentType(payment.payment_type);
      setContractId(payment.contract?.toString() || "");
      setWorkId(payment.work?.toString() || "");
      setRecipientId(payment.recipient?.toString() || "");
      setAmount(payment.amount.toString());
      setCurrency(payment.currency);
      setDescription(payment.description || "");
      setRequestDate(payment.request_date);
    } else {
      // Reset form
      setWorkGroup(initialWorkGroup || "");
      setCategory("");
      setPaymentType("");
      setContractId("");
      setWorkId("");
      setRecipientId("");
      setAmount("");
      setCurrency("VND");
      setDescription("");
      setRequestDate(new Date().toISOString().split("T")[0]);
    }
  }, [payment, initialWorkGroup]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Payment>) => apiClient.createPayment(data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Yêu cầu thanh toán đã được tạo",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo yêu cầu thanh toán",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Payment> }) =>
      apiClient.updatePayment(id, data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thanh toán đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thanh toán",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workGroup || !category || !paymentType || !recipientId || !amount || !requestDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    const data: Partial<Payment> = {
      work_group: workGroup,
      payment_category: category,
      payment_type: paymentType,
      recipient: parseInt(recipientId),
      recipient_type: "user", // Default, can be customized
      amount: parseFloat(amount),
      currency,
      description,
      request_date: requestDate,
    };

    if (contractId) {
      data.contract = parseInt(contractId);
    }
    if (workId) {
      data.work = parseInt(workId);
    }

    if (payment) {
      updateMutation.mutate({ id: payment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {payment ? "Chỉnh sửa thanh toán" : "Tạo yêu cầu thanh toán"}
          </DialogTitle>
          <DialogDescription>
            {payment
              ? "Cập nhật thông tin thanh toán"
              : "Điền thông tin để tạo yêu cầu thanh toán mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work_group">Nhóm công việc *</Label>
              <Select
                value={workGroup}
                onValueChange={setWorkGroup}
                disabled={!!payment}
              >
                <SelectTrigger id="work_group">
                  <SelectValue placeholder="Chọn nhóm công việc" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_WORK_GROUP_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Hạng mục thanh toán *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={!workGroup || !!payment}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn hạng mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.category_code}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_type">Loại thanh toán *</Label>
            <Input
              id="payment_type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              placeholder="Ví dụ: Tạm ứng lần 1, Tạm ứng lần 2, Quyết toán"
              required
            />
          </div>

          {workGroup === "dich_thuat" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract">Hợp đồng</Label>
                <Select value={contractId} onValueChange={setContractId}>
                  <SelectTrigger id="contract">
                    <SelectValue placeholder="Chọn hợp đồng (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không chọn</SelectItem>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.contract_number} - {contract.work_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work">Tác phẩm</Label>
                <Select value={workId} onValueChange={setWorkId}>
                  <SelectTrigger id="work">
                    <SelectValue placeholder="Chọn tác phẩm (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không chọn</SelectItem>
                    {works.map((work) => (
                      <SelectItem key={work.id} value={work.id.toString()}>
                        {work.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Người nhận *</Label>
              <Select value={recipientId} onValueChange={setRecipientId} required>
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Chọn người nhận" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_date">Ngày yêu cầu *</Label>
              <Input
                id="request_date"
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Loại tiền tệ</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về thanh toán..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payment ? "Cập nhật" : "Tạo yêu cầu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
