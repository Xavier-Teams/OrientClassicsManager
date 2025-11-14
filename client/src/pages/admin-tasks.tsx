import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Briefcase, Clock, CheckCircle2, FileText } from "lucide-react";

export default function AdminTasks() {
  const tasks = [
    {
      id: "1",
      title: "Chuẩn bị hồ sơ nghiệm thu Quý 1",
      description: "Tổng hợp báo cáo và tài liệu nghiệm thu",
      assignedTo: "Nguyễn Văn A",
      status: "in_progress",
      priority: "high",
      dueDate: "2024-03-31",
    },
    {
      id: "2",
      title: "Cập nhật biểu mẫu hợp đồng mới",
      description: "Soạn thảo và phê duyệt biểu mẫu hợp đồng phiên bản 2.1",
      assignedTo: "Trần Thị B",
      status: "pending",
      priority: "normal",
      dueDate: "2024-04-10",
    },
    {
      id: "3",
      title: "Tổ chức họp Hội đồng thẩm định",
      description: "Sắp xếp lịch họp và chuẩn bị tài liệu",
      assignedTo: "Lê Văn C",
      status: "in_progress",
      priority: "urgent",
      dueDate: "2024-03-20",
    },
    {
      id: "4",
      title: "Báo cáo tình hình sử dụng kinh phí",
      description: "Báo cáo chi tiết quý 1/2024",
      assignedTo: "Phạm Thị D",
      status: "completed",
      priority: "high",
      dueDate: "2024-03-15",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-workflow-draft",
    in_progress: "bg-workflow-in-progress",
    completed: "bg-workflow-completed",
    cancelled: "bg-destructive",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-priority-low",
    normal: "bg-priority-normal",
    high: "bg-priority-high",
    urgent: "bg-priority-urgent",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ xử lý",
    in_progress: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  const priorityLabels: Record<string, string> = {
    low: "Thấp",
    normal: "Trung bình",
    high: "Cao",
    urgent: "Khẩn",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-admin-tasks">
            Quản lý hành chính
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý các nhiệm vụ hành chính
          </p>
        </div>
        <Button data-testid="button-add-task" className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo nhiệm vụ
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm nhiệm vụ, người phụ trách..."
            className="pl-10"
            data-testid="input-search-tasks"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Chờ xử lý</p>
              <Clock className="h-4 w-4 text-workflow-draft" />
            </div>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Nhiệm vụ</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Đang xử lý</p>
              <Briefcase className="h-4 w-4 text-workflow-in-progress" />
            </div>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Nhiệm vụ</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Hoàn thành</p>
              <CheckCircle2 className="h-4 w-4 text-workflow-completed" />
            </div>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Biểu mẫu</p>
              <FileText className="h-4 w-4 text-chart-4" />
            </div>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
          <TabsTrigger value="forms">Biểu mẫu</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6 space-y-4">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="hover-elevate cursor-pointer"
              data-testid={`task-card-${task.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${priorityColors[task.priority]} text-white border-0`}
                        >
                          {priorityLabels[task.priority]}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[task.status]} text-white border-0`}
                        >
                          {statusLabels[task.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phụ trách: </span>
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline: </span>
                        <span className="font-medium">
                          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-12">
                Danh sách biểu mẫu
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
