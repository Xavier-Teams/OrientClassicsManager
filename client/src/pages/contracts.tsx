import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { CONTRACT_STATUS_LABELS } from "@/lib/constants";

export default function Contracts() {
  const contracts = [
    {
      id: "1",
      contractNumber: "HĐ-2024-001",
      workName: "Luận Ngữ",
      translator: "Phạm Thị D",
      totalAmount: 45000000,
      signedDate: "2024-01-15",
      endDate: "2024-05-15",
      status: "active",
      progress: 65,
    },
    {
      id: "2",
      contractNumber: "HĐ-2024-002",
      workName: "Mạnh Tử",
      translator: "Hoàng Văn E",
      totalAmount: 52000000,
      signedDate: "2024-01-20",
      endDate: "2024-06-20",
      status: "active",
      progress: 45,
    },
    {
      id: "3",
      contractNumber: "HĐ-2024-003",
      workName: "Đạo Đức Kinh",
      translator: "Mai Văn I",
      totalAmount: 38000000,
      signedDate: "2023-11-10",
      endDate: "2024-04-10",
      status: "active",
      progress: 85,
    },
    {
      id: "4",
      contractNumber: "HĐ-2023-045",
      workName: "Hàn Phi Tử",
      translator: "Phan Thị M",
      totalAmount: 48000000,
      signedDate: "2023-10-05",
      endDate: "2024-02-28",
      status: "completed",
      progress: 100,
    },
    {
      id: "5",
      contractNumber: "HĐ-2024-004",
      workName: "Đại Học",
      translator: "Võ Thị F",
      totalAmount: 28000000,
      signedDate: "2024-02-01",
      endDate: "2024-04-30",
      status: "signed",
      progress: 30,
    },
  ];

  const statusColors: Record<string, string> = {
    draft: "bg-workflow-draft",
    pending_approval: "bg-priority-high",
    signed: "bg-workflow-approved",
    active: "bg-workflow-in-progress",
    completed: "bg-workflow-completed",
    terminated: "bg-destructive",
  };

  const statusIcons: Record<string, any> = {
    draft: FileText,
    pending_approval: Clock,
    signed: CheckCircle2,
    active: Clock,
    completed: CheckCircle2,
    terminated: XCircle,
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
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-contracts">
            Quản lý hợp đồng
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý hợp đồng dịch thuật
          </p>
        </div>
        <Button data-testid="button-add-contract" className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo hợp đồng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm hợp đồng, dịch giả, tác phẩm..."
            className="pl-10"
            data-testid="input-search-contracts"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate" data-testid="stat-active-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thực hiện</CardTitle>
            <Clock className="h-4 w-4 text-workflow-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+2 tháng này</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-signed-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã ký</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-workflow-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Tổng số hợp đồng</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-total-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2B</div>
            <p className="text-xs text-muted-foreground">VNĐ</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="stat-expiring-soon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Trong 30 ngày</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {contracts.map((contract) => {
          const StatusIcon = statusIcons[contract.status];
          
          return (
            <Card 
              key={contract.id} 
              className="hover-elevate cursor-pointer"
              data-testid={`contract-card-${contract.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{contract.contractNumber}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[contract.status]} text-white border-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {CONTRACT_STATUS_LABELS[contract.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Tác phẩm: {contract.workName}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dịch giả</p>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm font-medium">{contract.translator}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Giá trị</p>
                        <p className="text-sm font-medium">{formatCurrency(contract.totalAmount)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ngày ký</p>
                        <p className="text-sm font-medium">
                          {new Date(contract.signedDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ngày hết hạn</p>
                        <p className="text-sm font-medium">
                          {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tiến độ thực hiện</span>
                        <span className="font-medium">{contract.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${contract.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" data-testid={`button-view-${contract.id}`}>
                    Xem chi tiết
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
