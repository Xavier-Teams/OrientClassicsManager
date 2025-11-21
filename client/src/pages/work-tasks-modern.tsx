import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiClient, WorkTask } from "@/lib/api";
import { Search, Filter, Download, TrendingUp, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { canAccessWorkReports } from "@/lib/permissions";
import ViewSwitcher, { ViewType } from "@/components/work-tasks/ViewSwitcher";
import ListView from "@/components/work-tasks/ListView";
import BoardView from "@/components/work-tasks/BoardView";
import CalendarView from "@/components/work-tasks/CalendarView";
import GanttView from "@/components/work-tasks/GanttView";

const WORK_GROUP_LABELS: Record<string, string> = {
  chung: "Công việc chung",
  bien_tap: "Biên tập",
  thiet_ke_cntt: "Thiết kế + CNTT",
  quet_trung_lap: "Quét trùng lặp",
  hanh_chinh: "Hành chính",
  tham_dinh_ban_dich_thu: "Thẩm định bản dịch thử",
  tham_dinh_cap_cg: "Thẩm định cấp CG",
  nghiem_thu_cap_da: "Nghiệm thu cấp DA",
  hop_thuong_truc: "Họp thường trực",
};

export default function WorkTasksModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isManager = canAccessWorkReports(user);
  const [currentView, setCurrentView] = useState<ViewType>("list");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Build query params
  const queryParams: any = {
    page_size: 100,
  };

  if (selectedWorkGroup !== "all") {
    queryParams.work_group = selectedWorkGroup;
  }
  if (selectedStatus !== "all") {
    queryParams.status = selectedStatus;
  }
  if (selectedFrequency !== "all") {
    queryParams.frequency = selectedFrequency;
  }
  if (selectedPriority !== "all") {
    queryParams.priority = selectedPriority;
  }
  if (searchTerm) {
    queryParams.search = searchTerm;
  }
  // If not manager, only show own tasks
  if (!isManager && user?.id) {
    queryParams.assigned_to = user.id;
  } else if (isManager && selectedUserId) {
    queryParams.assigned_to = selectedUserId;
  }

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["work-tasks", queryParams],
    queryFn: () => apiClient.getWorkTasks(queryParams),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers({ page_size: 100 }),
    enabled: isManager,
  });

  // Calculate statistics
  const tasks = tasksData?.results || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "hoan_thanh").length;
  const inProgressTasks = tasks.filter((t) => t.status === "dang_tien_hanh").length;
  const behindScheduleTasks = tasks.filter((t) => t.status === "cham_tien_do").length;
  const notCompletedTasks = tasks.filter((t) => t.status === "khong_hoan_thanh").length;

  const exportToCSV = () => {
    const headers = [
      "STT",
      "Tiêu đề",
      "Nhóm công việc",
      "Tần suất",
      "Ưu tiên",
      "Người được giao",
      "Trạng thái",
      "Ngày bắt đầu",
      "Hạn hoàn thành",
      "Ngày hoàn thành",
      "Tiến độ (%)",
      "Ghi chú",
    ];

    const rows = tasks.map((task, index) => [
      index + 1,
      task.title,
      WORK_GROUP_LABELS[task.work_group] || task.work_group,
      task.frequency,
      task.priority,
      task.assigned_to_name || "-",
      task.status,
      task.start_date || "-",
      task.due_date || "-",
      task.completed_date || "-",
      task.progress_percent,
      task.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cong_viec_${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Thành công",
      description: "Đã xuất file CSV",
    });
  };

  const renderView = () => {
    switch (currentView) {
      case "list":
        return <ListView tasks={tasks} isLoading={isLoading} />;
      case "board":
        return <BoardView tasks={tasks} isLoading={isLoading} />;
      case "calendar":
        return <CalendarView tasks={tasks} isLoading={isLoading} />;
      case "gantt":
        return <GanttView tasks={tasks} isLoading={isLoading} />;
      default:
        return <ListView tasks={tasks} isLoading={isLoading} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Quản lý công việc</h1>
            <p className="text-sm text-muted-foreground">
              {isManager ? "Quản lý và theo dõi tất cả công việc" : "Theo dõi công việc của bạn"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-4 border-b">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">Công việc</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang tiến hành</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? `${Math.round((inProgressTasks / totalTasks) * 100)}%` : "0%"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chậm tiến độ</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{behindScheduleTasks}</div>
              <p className="text-xs text-muted-foreground">Cần theo dõi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Không hoàn thành</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{notCompletedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? `${Math.round((notCompletedTasks / totalTasks) * 100)}%` : "0%"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công việc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>
          <Select value={selectedWorkGroup} onValueChange={setSelectedWorkGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Nhóm công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              {Object.entries(WORK_GROUP_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="chua_bat_dau">Chưa bắt đầu</SelectItem>
              <SelectItem value="dang_tien_hanh">Đang tiến hành</SelectItem>
              <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
              <SelectItem value="cham_tien_do">Chậm tiến độ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Switcher */}
      <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderView()}
      </div>
    </div>
  );
}

