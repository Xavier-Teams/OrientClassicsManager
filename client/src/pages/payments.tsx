import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/constants";

export default function Payments() {
  const payments = [
    {
      id: "1",
      contractNumber: "HĐ-2024-001",
      workName: "Luận Ngữ",
      translator: "Phạm Thị D",
      type: "advance_1",
      amount: 15000000,
      status: "paid",
      requestDate: "2024-01-20",
      paidDate: "2024-01-25",
    },
    {
      id: "2",
      contractNumber: "HĐ-2024-001",
      workName: "Luận Ngữ",
      translator: "Phạm Thị D",
      type: "advance_2",
      amount: 15000000,
      status: "pending",
      requestDate: "2024-03-15",
      paidDate: null,
    },
    {
      id: "3",
      contractNumber: "HĐ-2024-002",
      workName: "Mạnh Tử",
      translator: "Hoàng Văn E",
      type: "advance_1",
      amount: 17500000,
      status: "processing",
      requestDate: "2024-02-01",
      paidDate: null,
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-workflow-draft",
    processing: "bg-workflow-in-progress",
    paid: "bg-workflow-completed",
    rejected: "bg-destructive",
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Clock,
    paid: CheckCircle2,
    rejected: XCircle,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-payments">
            Quản lý thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý các khoản thanh toán
          </p>
        </div>
        <Button data-testid="button-add-payment" className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo yêu cầu thanh toán
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm thanh toán, hợp đồng, dịch giả..."
            className="pl-10"
            data-testid="input-search-payments"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
            <Clock className="h-4 w-4 text-workflow-draft" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Cần xử lý</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-workflow-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450M</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">So với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => {
          const StatusIcon = statusIcons[payment.status];
          
          return (
            <Card 
              key={payment.id} 
              className="hover-elevate cursor-pointer"
              data-testid={`payment-card-${payment.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{payment.contractNumber}</h3>
                        <Badge variant="secondary">
                          {PAYMENT_TYPE_LABELS[payment.type]}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[payment.status]} text-white border-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.workName} - {payment.translator}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Số tiền</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ngày yêu cầu</p>
                        <p className="text-sm font-medium">
                          {new Date(payment.requestDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ngày thanh toán</p>
                        <p className="text-sm font-medium">
                          {payment.paidDate 
                            ? new Date(payment.paidDate).toLocaleDateString("vi-VN")
                            : "Chưa thanh toán"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Thời gian xử lý</p>
                        <p className="text-sm font-medium">
                          {payment.paidDate 
                            ? `${Math.ceil((new Date(payment.paidDate).getTime() - new Date(payment.requestDate).getTime()) / (1000 * 60 * 60 * 24))} ngày`
                            : "Đang xử lý"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" data-testid={`button-view-payment-${payment.id}`}>
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
