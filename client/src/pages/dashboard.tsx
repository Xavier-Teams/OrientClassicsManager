import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ClipboardCheck, CreditCard, TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const stats = [
    {
      title: "Tổng tác phẩm",
      value: "24",
      change: "+3 tháng này",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "stat-total-works",
    },
    {
      title: "Đang tiến hành",
      value: "12",
      change: "+2 từ tuần trước",
      icon: Clock,
      color: "text-workflow-in-progress",
      bgColor: "bg-workflow-in-progress/10",
      testId: "stat-in-progress",
    },
    {
      title: "Hoàn thành",
      value: "8",
      change: "+1 tháng này",
      icon: CheckCircle2,
      color: "text-workflow-completed",
      bgColor: "bg-workflow-completed/10",
      testId: "stat-completed",
    },
    {
      title: "Hợp đồng hiệu lực",
      value: "15",
      change: "5 sắp hết hạn",
      icon: FileText,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      testId: "stat-contracts",
    },
    {
      title: "Chờ thẩm định",
      value: "5",
      change: "Cần xử lý",
      icon: ClipboardCheck,
      color: "text-workflow-review",
      bgColor: "bg-workflow-review/10",
      testId: "stat-reviews",
    },
    {
      title: "Thanh toán tháng này",
      value: "450M",
      change: "+12% so với tháng trước",
      icon: CreditCard,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "stat-payments",
    },
    {
      title: "Dịch giả",
      value: "18",
      change: "10 đang làm việc",
      icon: Users,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      testId: "stat-translators",
    },
    {
      title: "Năng suất",
      value: "92%",
      change: "+5% so với tháng trước",
      icon: TrendingUp,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
      testId: "stat-productivity",
    },
  ];

  const recentWorks = [
    { id: "1", name: "Luận Ngữ", status: "in_progress", progress: 65, translator: "Nguyễn Văn A", priority: "high" },
    { id: "2", name: "Mạnh Tử", status: "progress_checked", progress: 85, translator: "Trần Thị B", priority: "normal" },
    { id: "3", name: "Đại Học", status: "trial_translation", progress: 25, translator: "Lê Văn C", priority: "urgent" },
    { id: "4", name: "Trung Dung", status: "approved", progress: 10, translator: "Phạm Thị D", priority: "normal" },
    { id: "5", name: "Thi Kinh", status: "in_progress", progress: 45, translator: "Hoàng Văn E", priority: "high" },
  ];

  const priorityColors: Record<string, string> = {
    low: "bg-priority-low",
    normal: "bg-priority-normal",
    high: "bg-priority-high",
    urgent: "bg-priority-urgent",
  };

  const priorityLabels: Record<string, string> = {
    low: "Thấp",
    normal: "TB",
    high: "Cao",
    urgent: "Khẩn",
  };

  const statusLabels: Record<string, string> = {
    draft: "Dự kiến",
    approved: "Đã duyệt",
    trial_translation: "Dịch thử",
    in_progress: "Đang dịch",
    progress_checked: "Đã kiểm tra TD",
    completed: "Hoàn thành",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-dashboard">
          Tổng quan
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tiến độ dự án và các chỉ số quan trọng
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-elevate" data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-recent-works">
          <CardHeader>
            <CardTitle>Tác phẩm gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorks.map((work) => (
                <div 
                  key={work.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`work-item-${work.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{work.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${priorityColors[work.priority]} text-white border-0`}
                      >
                        {priorityLabels[work.priority]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{work.translator}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${work.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{work.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-activity-chart">
          <CardHeader>
            <CardTitle>Hoạt động theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Biểu đồ hoạt động sẽ hiển thị ở đây
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-upcoming-deadlines">
        <CardHeader>
          <CardTitle>Deadline sắp tới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Thẩm định chuyên gia - Luận Ngữ</h4>
                <p className="text-sm text-muted-foreground">Hội đồng thẩm định chuyên gia</p>
              </div>
              <Badge variant="destructive">3 ngày</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Thanh toán tạm ứng lần 2 - Mạnh Tử</h4>
                <p className="text-sm text-muted-foreground">Kế toán xử lý</p>
              </div>
              <Badge variant="outline" className="bg-priority-high text-white border-0">5 ngày</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Hoàn thành bản dịch - Thi Kinh</h4>
                <p className="text-sm text-muted-foreground">Dịch giả: Hoàng Văn E</p>
              </div>
              <Badge variant="secondary">15 ngày</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
