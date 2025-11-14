import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit3, CheckCircle2, Clock } from "lucide-react";
import { EDITING_STEPS } from "@/lib/constants";

export default function Editing() {
  const editingTasks = [
    {
      id: "1",
      workName: "Luận Ngữ",
      currentStep: "proof_1",
      assignedTo: "Nguyễn Văn A",
      dueDate: "2024-03-25",
      completedSteps: 3,
      totalSteps: 11,
    },
    {
      id: "2",
      workName: "Đạo Đức Kinh",
      currentStep: "proof_3",
      assignedTo: "Trần Thị B",
      dueDate: "2024-03-30",
      completedSteps: 7,
      totalSteps: 11,
    },
    {
      id: "3",
      workName: "Mạnh Tử",
      currentStep: "editing_draft",
      assignedTo: "Lê Văn C",
      dueDate: "2024-04-05",
      completedSteps: 2,
      totalSteps: 11,
    },
  ];

  const getStepLabel = (stepValue: string) => {
    const step = EDITING_STEPS.find(s => s.value === stepValue);
    return step?.label || stepValue;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-editing">
            Quản lý biên tập
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi tiến độ biên tập và xuất bản
          </p>
        </div>
        <Button data-testid="button-add-editing-task" className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo nhiệm vụ
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm tác phẩm, người phụ trách..."
            className="pl-10"
            data-testid="input-search-editing"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Đang biên tập</p>
              <Edit3 className="h-4 w-4 text-workflow-in-progress" />
            </div>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Tác phẩm</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Hoàn thành tuần này</p>
              <CheckCircle2 className="h-4 w-4 text-workflow-completed" />
            </div>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Tác phẩm</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Sắp đến hạn</p>
              <Clock className="h-4 w-4 text-priority-high" />
            </div>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Trong 3 ngày</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Tiến độ TB</p>
              <Edit3 className="h-4 w-4 text-chart-3" />
            </div>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Tất cả tác phẩm</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {editingTasks.map((task) => (
          <Card 
            key={task.id} 
            className="hover-elevate cursor-pointer"
            data-testid={`editing-task-${task.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{task.workName}</h3>
                      <Badge variant="secondary">{getStepLabel(task.currentStep)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Phụ trách: {task.assignedTo}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ biên tập</span>
                      <span className="font-medium">
                        {task.completedSteps}/{task.totalSteps} bước
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${(task.completedSteps / task.totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Deadline: </span>
                      <span className="font-medium">
                        {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Còn lại: </span>
                      <span className="font-medium">
                        {Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
