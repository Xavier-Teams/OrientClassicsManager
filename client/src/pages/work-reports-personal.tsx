import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTask } from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  BarChart3,
  User,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import "@/styles/animations.css";

// Helper function to create work-tasks URL with filters
const createWorkTasksURL = (filters: {
  status?: string;
  work_group?: string;
  assigned_to?: number;
  search?: string;
}) => {
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.work_group && filters.work_group !== "all") {
    params.set("work_group", filters.work_group);
  }
  if (filters.assigned_to) {
    params.set("assigned_to", filters.assigned_to.toString());
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  
  const queryString = params.toString();
  return `/work-tasks${queryString ? `?${queryString}` : ""}`;
};

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

export default function WorkReportsPersonal() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Trend chart filters
  const [trendFilter, setTrendFilter] = useState("total"); // total, work_group, status
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([
    "chung",
    "bien_tap",
    "thiet_ke_cntt",
  ]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "hoan_thanh",
    "dang_tien_hanh",
    "cham_tien_do",
  ]);

  // Fetch work tasks for the current user
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ["work-tasks-reports-personal", user?.id, selectedMonth, selectedYear],
    queryFn: () => apiClient.getWorkTasks({ 
      page_size: 1000,
      assigned_to: user?.id 
    }),
    enabled: !!user?.id,
  });

  const tasks = tasksData?.results || [];

  // Filter tasks by month/year
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.start_date) return false;
      const taskDate = new Date(task.start_date);
      return (
        taskDate.getMonth() + 1 === selectedMonth &&
        taskDate.getFullYear() === selectedYear
      );
    });
  }, [tasks, selectedMonth, selectedYear]);

  // BC 1: TỔNG QUÁT calculations
  const bc1Data = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === "hoan_thanh").length;
    const inProgress = filteredTasks.filter((t) => t.status === "dang_tien_hanh").length;
    const notCompleted = filteredTasks.filter(
      (t) => t.status !== "hoan_thanh" && t.status !== "da_huy"
    ).length;
    
    // Chậm tiến độ (chưa hoàn thành): có due_date đã qua và chưa hoàn thành
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const behindSchedule = filteredTasks.filter((t) => {
      if (t.status === "hoan_thanh" || t.status === "da_huy") return false;
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    return {
      total,
      completed,
      inProgress,
      notCompleted,
      behindSchedule,
    };
  }, [filteredTasks]);

  // BC 2: NHÓM CÔNG VIỆC CHƯA HOÀN THÀNH calculations
  const bc2Data = useMemo(() => {
    const incompleteTasks = filteredTasks.filter(
      (t) => t.status !== "hoan_thanh" && t.status !== "da_huy"
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onTime: Record<string, number> = {};
    const overdue: Record<string, number> = {};

    incompleteTasks.forEach((task) => {
      const group = task.work_group || "unknown";
      const groupName = WORK_GROUP_LABELS[group] || group;

      if (!task.due_date) {
        onTime[groupName] = (onTime[groupName] || 0) + 1;
        return;
      }

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate >= today) {
        onTime[groupName] = (onTime[groupName] || 0) + 1;
      } else {
        overdue[groupName] = (overdue[groupName] || 0) + 1;
      }
    });

    return { onTime, overdue };
  }, [filteredTasks]);

  // BC 3: NHÓM CÔNG VIỆC ĐÃ HOÀN THÀNH calculations
  const bc3Data = useMemo(() => {
    const completedTasks = filteredTasks.filter((t) => t.status === "hoan_thanh");

    const onTime: Record<string, number> = {};
    const early: Record<string, number> = {};
    const late: Record<string, number> = {};

    completedTasks.forEach((task) => {
      if (!task.completed_date || !task.due_date) return;

      const group = task.work_group || "unknown";
      const groupName = WORK_GROUP_LABELS[group] || group;

      const completedDate = new Date(task.completed_date);
      const dueDate = new Date(task.due_date);
      completedDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = completedDate.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        onTime[groupName] = (onTime[groupName] || 0) + 1;
      } else if (diffDays < 0) {
        early[groupName] = (early[groupName] || 0) + 1;
      } else {
        late[groupName] = (late[groupName] || 0) + 1;
      }
    });

    return { onTime, early, late };
  }, [filteredTasks]);

  // Prepare chart data
  const bc1ChartData = [
    { name: "Tổng số", value: bc1Data.total, color: "#8884d8" },
    { name: "Hoàn thành", value: bc1Data.completed, color: "#10b981" },
    { name: "Đang tiến hành", value: bc1Data.inProgress, color: "#3b82f6" },
    { name: "Chưa hoàn thành", value: bc1Data.notCompleted, color: "#ef4444" },
    { name: "Chậm tiến độ", value: bc1Data.behindSchedule, color: "#f97316" },
  ].filter((item) => item.value > 0);

  const bc2ChartData = useMemo(() => {
    const allGroups = new Set([
      ...Object.keys(bc2Data.onTime),
      ...Object.keys(bc2Data.overdue),
    ]);

    return Array.from(allGroups).map((group) => ({
      name: group,
      "Còn hạn": bc2Data.onTime[group] || 0,
      "Quá hạn": bc2Data.overdue[group] || 0,
    }));
  }, [bc2Data]);

  const bc3ChartData = useMemo(() => {
    const allGroups = new Set([
      ...Object.keys(bc3Data.onTime),
      ...Object.keys(bc3Data.early),
      ...Object.keys(bc3Data.late),
    ]);

    return Array.from(allGroups).map((group) => ({
      name: group,
      "Đúng tiến độ": bc3Data.onTime[group] || 0,
      "Trước hạn": bc3Data.early[group] || 0,
      "Chậm tiến độ": bc3Data.late[group] || 0,
    }));
  }, [bc3Data]);

  const bc2PieData = [
    {
      name: "Còn hạn",
      value: Object.values(bc2Data.onTime).reduce((a, b) => a + b, 0),
      color: "#3b82f6",
    },
    {
      name: "Quá hạn",
      value: Object.values(bc2Data.overdue).reduce((a, b) => a + b, 0),
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  const bc3PieData = [
    {
      name: "Đúng tiến độ",
      value: Object.values(bc3Data.onTime).reduce((a, b) => a + b, 0),
      color: "#3b82f6",
    },
    {
      name: "Trước hạn",
      value: Object.values(bc3Data.early).reduce((a, b) => a + b, 0),
      color: "#10b981",
    },
    {
      name: "Chậm tiến độ",
      value: Object.values(bc3Data.late).reduce((a, b) => a + b, 0),
      color: "#f97316",
    },
  ].filter((item) => item.value > 0);

  // Trend data for the last 12 months
  const trendData = useMemo(() => {
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthTasks = tasks.filter((task) => {
        if (!task.start_date) return false;
        const taskDate = new Date(task.start_date);
        return (
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      const monthData: any = {
        month: date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        total: monthTasks.length,
      };

      // Work group data
      if (trendFilter === "work_group") {
        selectedWorkGroups.forEach((group) => {
          const groupTasks = monthTasks.filter(
            (task) => task.work_group === group
          );
          monthData[WORK_GROUP_LABELS[group] || group] = groupTasks.length;
        });
      }

      // Status data
      if (trendFilter === "status") {
        const statusMap = {
          hoan_thanh: "Hoàn thành",
          dang_tien_hanh: "Đang tiến hành",
          cham_tien_do: "Chậm tiến độ",
          khong_hoan_thanh: "Không hoàn thành",
        };

        selectedStatuses.forEach((status) => {
          let statusTasks;
          if (status === "cham_tien_do") {
            // Chậm tiến độ logic
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            statusTasks = monthTasks.filter((t) => {
              if (t.status === "hoan_thanh" || t.status === "da_huy")
                return false;
              if (!t.due_date) return false;
              const dueDate = new Date(t.due_date);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate < today;
            });
          } else {
            statusTasks = monthTasks.filter((task) => task.status === status);
          }
          monthData[statusMap[status as keyof typeof statusMap]] =
            statusTasks.length;
        });
      }

      months.push(monthData);
    }

    return months;
  }, [tasks, trendFilter, selectedWorkGroups, selectedStatuses]);

  // Handle badge click to navigate to work-tasks with filters
  const handleBadgeClick = (filterType: string) => {
    let url = "";
    
    switch (filterType) {
      case "total":
        // Show all tasks for current user
        url = createWorkTasksURL({ assigned_to: user?.id });
        break;
      case "completed":
        url = createWorkTasksURL({ 
          status: "hoan_thanh", 
          assigned_to: user?.id 
        });
        break;
      case "in_progress":
        url = createWorkTasksURL({ 
          status: "dang_tien_hanh", 
          assigned_to: user?.id 
        });
        break;
      case "not_completed":
        // Show tasks that are not completed and not cancelled for current user
        url = createWorkTasksURL({ 
          search: "chưa hoàn thành",
          assigned_to: user?.id 
        });
        break;
      case "behind_schedule":
        url = createWorkTasksURL({ 
          status: "cham_tien_do", 
          assigned_to: user?.id 
        });
        break;
      default:
        url = createWorkTasksURL({ assigned_to: user?.id });
    }
    
    // Open in new tab
    window.open(url, "_blank");
  };

  const currentDate = new Date();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">Lỗi khi tải dữ liệu: {String(error)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent truncate">
                  Báo cáo công việc cá nhân
                </h1>
              </div>
              <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                Thống kê công việc của bạn theo nhóm và trạng thái
              </p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Cập nhật real-time • {filteredTasks.length} công việc của bạn</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-shrink-0">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[140px] bg-white/20 border-white/30 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-full sm:w-[120px] bg-white/20 border-white/30 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* BC 1: TỔNG QUÁT */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BC 1: TỔNG QUÁT
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* Total Tasks Card */}
              <Card 
                className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleBadgeClick("total")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Tổng số công việc</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <FolderKanban className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-700 group-hover:text-slate-800 transition-colors">
                    {bc1Data.total}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">công việc</div>
                </CardContent>
              </Card>

              {/* Completed Tasks Card */}
              <Card 
                className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleBadgeClick("completed")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Hoàn thành</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 group-hover:text-green-800 transition-colors">
                    {bc1Data.completed}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {bc1Data.total > 0 ? `${((bc1Data.completed / bc1Data.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </CardContent>
              </Card>

              {/* In Progress Tasks Card */}
              <Card 
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleBadgeClick("in_progress")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Đang tiến hành</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Clock className="h-4 w-4 text-white animate-spin" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
                    {bc1Data.inProgress}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {bc1Data.total > 0 ? `${((bc1Data.inProgress / bc1Data.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </CardContent>
              </Card>

              {/* Not Completed Tasks Card */}
              <Card 
                className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleBadgeClick("not_completed")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Chưa hoàn thành</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700 group-hover:text-red-800 transition-colors">
                    {bc1Data.notCompleted}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {bc1Data.total > 0 ? `${((bc1Data.notCompleted / bc1Data.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </CardContent>
              </Card>

              {/* Behind Schedule Tasks Card */}
              <Card 
                className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleBadgeClick("behind_schedule")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Chậm tiến độ</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <AlertTriangle className="h-4 w-4 text-white animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">
                    {bc1Data.behindSchedule}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Cần xử lý gấp
                  </div>
                </CardContent>
              </Card>
            </div>

            {bc1ChartData.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl"></div>
                <ChartContainer
                  config={{
                    total: { label: "Tổng số", color: "#8884d8" },
                    completed: { label: "Hoàn thành", color: "#10b981" },
                    inProgress: { label: "Đang tiến hành", color: "#3b82f6" },
                    notCompleted: { label: "Chưa hoàn thành", color: "#ef4444" },
                    behindSchedule: { label: "Chậm tiến độ", color: "#f97316" },
                  }}
                  className="h-[400px] relative z-10"
                >
                    <BarChart data={bc1ChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#barGradientPersonal)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                      />
                    </BarChart>
                </ChartContainer>
              </div>
            )}
        </CardContent>
      </Card>

        {/* BC 2: NHÓM CÔNG VIỆC CHƯA HOÀN THÀNH */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                BC 2: NHÓM CÔNG VIỆC CHƯA HOÀN THÀNH
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-blue-700">Còn hạn</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(bc2Data.onTime).map(([group, count], index) => (
                    <div 
                      key={group} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm font-medium text-blue-800 group-hover:text-blue-900 transition-colors">{group}</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md group-hover:shadow-lg transition-shadow">
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(bc2Data.onTime).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-600 font-medium">
                        Tuyệt vời! Không có công việc nào còn hạn
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-red-700">Quá hạn</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(bc2Data.overdue).map(([group, count], index) => (
                    <div 
                      key={group} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm font-medium text-red-800 group-hover:text-red-900 transition-colors">{group}</span>
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md group-hover:shadow-lg transition-shadow animate-pulse">
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(bc2Data.overdue).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        Xuất sắc! Không có công việc nào quá hạn
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {bc2ChartData.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative overflow-x-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-red-500/5 to-orange-500/5 rounded-xl"></div>
                  <div className="min-w-[400px] w-full">
                    <ChartContainer
                    config={{
                      "Còn hạn": { label: "Còn hạn", color: "#3b82f6" },
                      "Quá hạn": { label: "Quá hạn", color: "#ef4444" },
                    }}
                    className="h-[250px] sm:h-[300px] lg:h-[350px] relative z-10"
                  >
                      <BarChart data={bc2ChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="onTimeGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="overdueGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="Còn hạn" 
                          fill="url(#onTimeGradientPersonal)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={0}
                        />
                        <Bar 
                          dataKey="Quá hạn" 
                          fill="url(#overdueGradientPersonal)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={200}
                        />
                      </BarChart>
                  </ChartContainer>
                  </div>
                </div>

                {bc2PieData.length > 0 && (
                  <div className="relative overflow-x-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-red-500/5 rounded-xl"></div>
                    <div className="min-w-[350px] w-full">
                      <ChartContainer
                      config={{
                        "Còn hạn": { label: "Còn hạn", color: "#3b82f6" },
                        "Quá hạn": { label: "Quá hạn", color: "#ef4444" },
                      }}
                      className="h-[250px] sm:h-[300px] lg:h-[350px] relative z-10"
                    >
                        <PieChart>
                          <defs>
                            <linearGradient id="pieOnTimePersonal" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                            <linearGradient id="pieOverduePersonal" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f87171" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={bc2PieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1500}
                            animationBegin={0}
                          >
                            {bc2PieData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.name === "Còn hạn" ? "url(#pieOnTimePersonal)" : "url(#pieOverduePersonal)"} 
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                    </ChartContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </Card>

        {/* BC 3: NHÓM CÔNG VIỆC ĐÃ HOÀN THÀNH */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                BC 3: NHÓM CÔNG VIỆC ĐÃ HOÀN THÀNH
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-blue-700">Đúng tiến độ</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(bc3Data.onTime).map(([group, count], index) => (
                    <div 
                      key={group} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm font-medium text-blue-800 group-hover:text-blue-900 transition-colors">{group}</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md group-hover:shadow-lg transition-shadow">
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(bc3Data.onTime).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-600 font-medium">
                        Chưa có công việc nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-green-700">Hoàn thành trước hạn</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(bc3Data.early).map(([group, count], index) => (
                    <div 
                      key={group} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm font-medium text-green-800 group-hover:text-green-900 transition-colors">{group}</span>
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md group-hover:shadow-lg transition-shadow">
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(bc3Data.early).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        Chưa có công việc nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-orange-700">Hoàn thành chậm tiến độ</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(bc3Data.late).map(([group, count], index) => (
                    <div 
                      key={group} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm font-medium text-orange-800 group-hover:text-orange-900 transition-colors">{group}</span>
                      <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md group-hover:shadow-lg transition-shadow animate-pulse">
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(bc3Data.late).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                      <p className="text-sm text-orange-600 font-medium">
                        Chưa có công việc nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {bc3ChartData.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative overflow-x-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-orange-500/5 rounded-xl"></div>
                  <div className="min-w-[400px] w-full">
                    <ChartContainer
                    config={{
                      "Đúng tiến độ": { label: "Đúng tiến độ", color: "#3b82f6" },
                      "Trước hạn": { label: "Trước hạn", color: "#10b981" },
                      "Chậm tiến độ": { label: "Chậm tiến độ", color: "#f97316" },
                    }}
                    className="h-[250px] sm:h-[300px] lg:h-[350px] relative z-10"
                  >
                      <BarChart data={bc3ChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="onTimeGradientPersonalBC3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="earlyGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="lateGradientPersonal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="Đúng tiến độ" 
                          fill="url(#onTimeGradientPersonalBC3)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={0}
                        />
                        <Bar 
                          dataKey="Trước hạn" 
                          fill="url(#earlyGradientPersonal)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={200}
                        />
                        <Bar 
                          dataKey="Chậm tiến độ" 
                          fill="url(#lateGradientPersonal)"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1200}
                          animationBegin={400}
                        />
                      </BarChart>
                  </ChartContainer>
                  </div>
                </div>

                {bc3PieData.length > 0 && (
                  <div className="relative overflow-x-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-orange-500/5 rounded-xl"></div>
                    <div className="min-w-[350px] w-full">
                      <ChartContainer
                      config={{
                        "Đúng tiến độ": { label: "Đúng tiến độ", color: "#3b82f6" },
                        "Trước hạn": { label: "Trước hạn", color: "#10b981" },
                        "Chậm tiến độ": { label: "Chậm tiến độ", color: "#f97316" },
                      }}
                      className="h-[250px] sm:h-[300px] lg:h-[350px] relative z-10"
                    >
                        <PieChart>
                          <defs>
                            <linearGradient id="pieOnTimePersonalBC3" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                            <linearGradient id="pieEarlyPersonal" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                            <linearGradient id="pieLatePersonal" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fb923c" />
                              <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={bc3PieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1500}
                            animationBegin={0}
                          >
                            {bc3PieData.map((entry, index) => {
                              let fillColor = "url(#pieOnTimePersonalBC3)";
                              if (entry.name === "Trước hạn") fillColor = "url(#pieEarlyPersonal)";
                              if (entry.name === "Chậm tiến độ") fillColor = "url(#pieLatePersonal)";
                              
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={fillColor}
                                  stroke="#fff"
                                  strokeWidth={2}
                                />
                              );
                            })}
                          </Pie>
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                    </ChartContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BIỂU ĐỒ XU HƯỚNG */}
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Biểu đồ xu hướng cá nhân
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Theo dõi sự thay đổi công việc của bạn qua các tháng
                  </p>
                </div>
              </div>
            </div>
            
            {/* Trend Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant={trendFilter === "total" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendFilter("total")}
                  className={trendFilter === "total" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  Tổng số công việc
                </Button>
                <Button
                  variant={trendFilter === "work_group" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendFilter("work_group")}
                  className={trendFilter === "work_group" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  Theo nhóm công việc
                </Button>
                <Button
                  variant={trendFilter === "status" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendFilter("status")}
                  className={trendFilter === "status" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  Theo trạng thái
                </Button>
              </div>
              
              {/* Work Group Filters */}
              {trendFilter === "work_group" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Chọn nhóm công việc:</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {Object.entries(WORK_GROUP_LABELS).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedWorkGroups.includes(key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedWorkGroups(prev => 
                            prev.includes(key) 
                              ? prev.filter(g => g !== key)
                              : [...prev, key]
                          );
                        }}
                        className={selectedWorkGroups.includes(key) ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status Filters */}
              {trendFilter === "status" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Chọn trạng thái:</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {[
                      { key: "hoan_thanh", label: "Hoàn thành" },
                      { key: "dang_tien_hanh", label: "Đang tiến hành" },
                      { key: "cham_tien_do", label: "Chậm tiến độ" },
                      { key: "khong_hoan_thanh", label: "Không hoàn thành" }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={selectedStatuses.includes(key) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedStatuses(prev => 
                            prev.includes(key) 
                              ? prev.filter(s => s !== key)
                              : [...prev, key]
                          );
                        }}
                        className={selectedStatuses.includes(key) ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {trendData.length > 0 && (
              <div className="relative overflow-x-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                <div className="min-w-[600px] w-full">
                  <ChartContainer
                  config={{
                    total: { label: "Tổng số", color: "#a855f7" },
                  }}
                  className="h-[300px] sm:h-[350px] lg:h-[400px] relative z-10">
                    <LineChart
                      data={trendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="lineGradientPersonal1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="lineGradientPersonal2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="lineGradientPersonal3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="lineGradientPersonal4" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="lineGradientPersonal5" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e2e8f0" 
                        strokeOpacity={0.5}
                      />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                      />
                      <Legend />
                      
                      {trendFilter === "total" && (
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#a855f7"
                          strokeWidth={3}
                          dot={{ fill: '#a855f7', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#a855f7', strokeWidth: 2, fill: '#ffffff' }}
                          animationDuration={1500}
                        />
                      )}
                      
                      {trendFilter === "work_group" && selectedWorkGroups.map((group, index) => {
                        const colors = ['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
                        const color = colors[index % colors.length];
                        return (
                          <Line
                            key={group}
                            type="monotone"
                            dataKey={WORK_GROUP_LABELS[group] || group}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color, strokeWidth: 1, r: 4 }}
                            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#ffffff' }}
                            animationDuration={1500}
                            animationBegin={index * 200}
                          />
                        );
                      })}
                      
                      {trendFilter === "status" && selectedStatuses.map((status, index) => {
                        const statusMap = {
                          "hoan_thanh": { color: "#10b981", label: "Hoàn thành" },
                          "dang_tien_hanh": { color: "#3b82f6", label: "Đang tiến hành" },
                          "cham_tien_do": { color: "#f59e0b", label: "Chậm tiến độ" },
                          "khong_hoan_thanh": { color: "#ef4444", label: "Không hoàn thành" }
                        };
                        const statusInfo = statusMap[status as keyof typeof statusMap];
                        return (
                          <Line
                            key={status}
                            type="monotone"
                            dataKey={statusInfo.label}
                            stroke={statusInfo.color}
                            strokeWidth={2}
                            dot={{ fill: statusInfo.color, strokeWidth: 1, r: 4 }}
                            activeDot={{ r: 6, stroke: statusInfo.color, strokeWidth: 2, fill: '#ffffff' }}
                            animationDuration={1500}
                            animationBegin={index * 200}
                          />
                        );
                      })}
                    </LineChart>
                </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
