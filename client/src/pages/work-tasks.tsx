import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, WorkTask } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { canAccessWorkReports } from "@/lib/permissions";

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

const STATUS_LABELS: Record<string, string> = {
  chua_bat_dau: "Chưa bắt đầu",
  dang_tien_hanh: "Đang tiến hành",
  hoan_thanh: "Hoàn thành",
  khong_hoan_thanh: "Không hoàn thành",
  cham_tien_do: "Chậm tiến độ",
  hoan_thanh_truoc_han: "Hoàn thành trước hạn",
  da_huy: "Đã hủy",
  tam_hoan: "Tạm hoãn",
};

const FREQUENCY_LABELS: Record<string, string> = {
  hang_ngay: "Hằng ngày",
  hang_tuan: "Hằng tuần",
  hang_thang: "Hằng tháng",
  dot_xuat: "Đột xuất",
};

const PRIORITY_LABELS: Record<string, string> = {
  thap: "Thấp",
  trung_binh: "Trung bình",
  cao: "Cao",
  rat_cao: "Rất cao",
};

const STATUS_COLORS: Record<string, string> = {
  chua_bat_dau: "bg-gray-100 text-gray-800",
  dang_tien_hanh: "bg-blue-100 text-blue-800",
  hoan_thanh: "bg-green-100 text-green-800",
  khong_hoan_thanh: "bg-red-100 text-red-800",
  cham_tien_do: "bg-orange-100 text-orange-800",
  hoan_thanh_truoc_han: "bg-emerald-100 text-emerald-800",
  da_huy: "bg-gray-100 text-gray-600",
  tam_hoan: "bg-yellow-100 text-yellow-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  thap: "bg-gray-100 text-gray-700",
  trung_binh: "bg-blue-100 text-blue-700",
  cao: "bg-orange-100 text-orange-700",
  rat_cao: "bg-red-100 text-red-700",
};

export default function WorkTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isManager = canAccessWorkReports(user);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  // Group statistics
  const groupStats = WORK_GROUP_LABELS;
  const groupCounts: Record<string, number> = {};
  Object.keys(groupStats).forEach((group) => {
    groupCounts[group] = tasks.filter((t) => t.work_group === group).length;
  });

  // Frequency statistics
  const frequencyStats: Record<string, number> = {};
  Object.keys(FREQUENCY_LABELS).forEach((freq) => {
    frequencyStats[freq] = tasks.filter((t) => t.frequency === freq).length;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
      FREQUENCY_LABELS[task.frequency] || task.frequency,
      PRIORITY_LABELS[task.priority] || task.priority,
      task.assigned_to_name || "-",
      STATUS_LABELS[task.status] || task.status,
      formatDate(task.start_date),
      formatDate(task.due_date),
      formatDate(task.completed_date),
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
    link.setAttribute("download", `cong_viec_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Thành công",
      description: "Đã xuất file CSV",
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng theo dõi công việc chi tiết</h1>
          <p className="text-muted-foreground mt-1">
            {isManager ? "Quản lý và theo dõi tất cả công việc" : "Theo dõi công việc của bạn"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm công việc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Nhóm công việc</Label>
              <Select value={selectedWorkGroup} onValueChange={setSelectedWorkGroup}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(WORK_GROUP_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tần suất</Label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ưu tiên</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isManager && usersData && (
              <div>
                <Label>Người được giao</Label>
                <Select
                  value={selectedUserId?.toString() || "all"}
                  onValueChange={(value) => setSelectedUserId(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {usersData.results.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Tháng</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="mt-1">
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
            </div>

            <div>
              <Label>Năm</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="mt-1">
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
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách công việc chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không có công việc nào</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Nhóm CV</TableHead>
                    <TableHead>Tần suất</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                    {isManager && <TableHead>Người được giao</TableHead>}
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Hạn hoàn thành</TableHead>
                    <TableHead>Ngày hoàn thành</TableHead>
                    <TableHead className="text-center">Tiến độ</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task, index) => {
                    const daysUntilDue = getDaysUntilDue(task.due_date);
                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "hoan_thanh";

                    return (
                      <TableRow key={task.id} className={isOverdue ? "bg-orange-50" : ""}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={task.title}>
                            {task.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {WORK_GROUP_LABELS[task.work_group] || task.work_group}
                          </Badge>
                        </TableCell>
                        <TableCell>{FREQUENCY_LABELS[task.frequency] || task.frequency}</TableCell>
                        <TableCell>
                          <Badge className={PRIORITY_COLORS[task.priority] || ""}>
                            {PRIORITY_LABELS[task.priority] || task.priority}
                          </Badge>
                        </TableCell>
                        {isManager && (
                          <TableCell>
                            {task.assigned_to_name ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{task.assigned_to_name}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge className={STATUS_COLORS[task.status] || ""}>
                            {STATUS_LABELS[task.status] || task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(task.start_date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatDate(task.due_date)}
                            {daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && task.status !== "hoan_thanh" && (
                              <Badge variant="outline" className="text-orange-600">
                                {daysUntilDue} ngày
                              </Badge>
                            )}
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Quá hạn
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(task.completed_date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  task.progress_percent === 100
                                    ? "bg-green-600"
                                    : task.progress_percent >= 50
                                    ? "bg-blue-600"
                                    : "bg-orange-600"
                                }`}
                                style={{ width: `${task.progress_percent}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10">{task.progress_percent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={task.notes || ""}>
                            {task.notes || "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics by Group */}
      {isManager && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo nhóm công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhóm công việc</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Tỷ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([group, count]) => (
                      <TableRow key={group}>
                        <TableCell>{WORK_GROUP_LABELS[group] || group}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {totalTasks > 0 ? `${Math.round((count / totalTasks) * 100)}%` : "0%"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo tần suất</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tần suất</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Tỷ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(frequencyStats)
                    .filter(([_, count]) => count > 0)
                    .map(([freq, count]) => (
                      <TableRow key={freq}>
                        <TableCell>{FREQUENCY_LABELS[freq] || freq}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {totalTasks > 0 ? `${Math.round((count / totalTasks) * 100)}%` : "0%"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

