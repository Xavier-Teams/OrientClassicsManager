import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTask } from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderKanban,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

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

export default function WorkReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch all work tasks for the selected month/year
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ["work-tasks-reports", selectedMonth, selectedYear],
    queryFn: () => apiClient.getWorkTasks({ page_size: 1000 }),
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo công việc chung</h1>
          <p className="text-muted-foreground mt-1">
            Thống kê và phân tích công việc theo nhóm, trạng thái và nhân sự
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[120px]">
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

      {/* BC 1: TỔNG QUÁT */}
      <Card>
        <CardHeader>
          <CardTitle>BC 1: TỔNG QUÁT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số công việc</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bc1Data.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{bc1Data.completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang tiến hành</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{bc1Data.inProgress}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chưa hoàn thành</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{bc1Data.notCompleted}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chậm tiến độ</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{bc1Data.behindSchedule}</div>
                <p className="text-xs text-muted-foreground mt-1">Chưa hoàn thành</p>
              </CardContent>
            </Card>
          </div>

          {bc1ChartData.length > 0 && (
            <ChartContainer
              config={{
                total: { label: "Tổng số", color: "#8884d8" },
                completed: { label: "Hoàn thành", color: "#10b981" },
                inProgress: { label: "Đang tiến hành", color: "#3b82f6" },
                notCompleted: { label: "Chưa hoàn thành", color: "#ef4444" },
                behindSchedule: { label: "Chậm tiến độ", color: "#f97316" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bc1ChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* BC 2: NHÓM CÔNG VIỆC CHƯA HOÀN THÀNH */}
      <Card>
        <CardHeader>
          <CardTitle>BC 2: NHÓM CÔNG VIỆC CHƯA HOÀN THÀNH</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-4">Còn hạn</h3>
              <div className="space-y-2">
                {Object.entries(bc2Data.onTime).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{group}</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(bc2Data.onTime).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có công việc nào còn hạn
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Quá hạn</h3>
              <div className="space-y-2">
                {Object.entries(bc2Data.overdue).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{group}</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(bc2Data.overdue).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có công việc nào quá hạn
                  </p>
                )}
              </div>
            </div>
          </div>

          {bc2ChartData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartContainer
                config={{
                  "Còn hạn": { label: "Còn hạn", color: "#3b82f6" },
                  "Quá hạn": { label: "Quá hạn", color: "#ef4444" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bc2ChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Còn hạn" fill="#3b82f6" />
                    <Bar dataKey="Quá hạn" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {bc2PieData.length > 0 && (
                <ChartContainer
                  config={{
                    "Còn hạn": { label: "Còn hạn", color: "#3b82f6" },
                    "Quá hạn": { label: "Quá hạn", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bc2PieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bc2PieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BC 3: NHÓM CÔNG VIỆC ĐÃ HOÀN THÀNH */}
      <Card>
        <CardHeader>
          <CardTitle>BC 3: NHÓM CÔNG VIỆC ĐÃ HOÀN THÀNH</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium mb-4">Đúng tiến độ</h3>
              <div className="space-y-2">
                {Object.entries(bc3Data.onTime).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{group}</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(bc3Data.onTime).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có công việc nào
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Hoàn thành trước hạn</h3>
              <div className="space-y-2">
                {Object.entries(bc3Data.early).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{group}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(bc3Data.early).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có công việc nào
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Hoàn thành chậm tiến độ</h3>
              <div className="space-y-2">
                {Object.entries(bc3Data.late).map(([group, count]) => (
                  <div key={group} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{group}</span>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(bc3Data.late).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có công việc nào
                  </p>
                )}
              </div>
            </div>
          </div>

          {bc3ChartData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <ChartContainer
                config={{
                  "Đúng tiến độ": { label: "Đúng tiến độ", color: "#3b82f6" },
                  "Trước hạn": { label: "Trước hạn", color: "#10b981" },
                  "Chậm tiến độ": { label: "Chậm tiến độ", color: "#f97316" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bc3ChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Đúng tiến độ" fill="#3b82f6" />
                    <Bar dataKey="Trước hạn" fill="#10b981" />
                    <Bar dataKey="Chậm tiến độ" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {bc3PieData.length > 0 && (
                <ChartContainer
                  config={{
                    "Đúng tiến độ": { label: "Đúng tiến độ", color: "#3b82f6" },
                    "Trước hạn": { label: "Trước hạn", color: "#10b981" },
                    "Chậm tiến độ": { label: "Chậm tiến độ", color: "#f97316" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bc3PieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bc3PieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
