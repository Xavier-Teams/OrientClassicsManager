import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTaskStatistics } from "@/lib/api";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  FolderKanban
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function WorkReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: statistics, isLoading, error } = useQuery<WorkTaskStatistics>({
    queryKey: ["work-task-statistics", selectedMonth, selectedYear],
    queryFn: () => apiClient.getWorkTaskStatistics({ month: selectedMonth, year: selectedYear }),
  });

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

  if (!statistics) {
    return null;
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng công việc</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_tasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tháng {selectedMonth}/{selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.summary.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.total_tasks > 0 
                ? `${Math.round((statistics.summary.completed / statistics.total_tasks) * 100)}% tổng số`
                : "0% tổng số"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang tiến hành</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.summary.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.total_tasks > 0 
                ? `${Math.round((statistics.summary.in_progress / statistics.total_tasks) * 100)}% tổng số`
                : "0% tổng số"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chậm tiến độ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.status_breakdown.cham_tien_do}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cần theo dõi
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-group" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-group">Theo nhóm công việc</TabsTrigger>
          <TabsTrigger value="by-status">Theo trạng thái</TabsTrigger>
          <TabsTrigger value="by-frequency">Theo tần suất</TabsTrigger>
          <TabsTrigger value="by-priority">Theo ưu tiên</TabsTrigger>
        </TabsList>

        <TabsContent value="by-group" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo nhóm công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhóm công việc</TableHead>
                    <TableHead className="text-right">Tổng số</TableHead>
                    <TableHead className="text-right">Hoàn thành</TableHead>
                    <TableHead className="text-right">Đang tiến hành</TableHead>
                    <TableHead className="text-right">Chậm tiến độ</TableHead>
                    <TableHead className="text-right">Tỷ lệ chậm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statistics.group_breakdown).map(([key, data]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{data.name}</TableCell>
                      <TableCell className="text-right">{data.total}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {data.completed}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {data.in_progress}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {data.behind_schedule}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {data.total > 0 
                          ? `${Math.round((data.behind_schedule / data.total) * 100)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nhóm công việc chưa hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics.incomplete_by_group)
                  .filter(([_, data]) => data.count > 0)
                  .map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{data.name}</span>
                      <Badge variant="outline">{data.count} công việc</Badge>
                    </div>
                  ))}
                {Object.values(statistics.incomplete_by_group).every((d) => d.count === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    Tất cả nhóm công việc đã hoàn thành
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nhóm công việc đang tiến hành chậm tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics.behind_schedule_by_group)
                  .filter(([_, data]) => data.count > 0)
                  .map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{data.name}</span>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        {data.count} công việc
                      </Badge>
                    </div>
                  ))}
                {Object.values(statistics.behind_schedule_by_group).every((d) => d.count === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    Không có công việc nào chậm tiến độ
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(STATUS_LABELS).map(([key, label]) => {
                  const count = statistics.status_breakdown[key as keyof typeof statistics.status_breakdown] || 0;
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {statistics.total_tasks > 0 
                            ? `${Math.round((count / statistics.total_tasks) * 100)}% tổng số`
                            : "0%"}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-frequency" className="space-y-4">
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
                  {Object.entries(statistics.frequency_breakdown).map(([key, data]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{data.name}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right">
                        {statistics.total_tasks > 0 
                          ? `${Math.round((data.count / statistics.total_tasks) * 100)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo ưu tiên</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mức ưu tiên</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Tỷ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.by_priority.map((item) => (
                    <TableRow key={item.priority}>
                      <TableCell className="font-medium">
                        {item.priority === 'thap' ? 'Thấp' :
                         item.priority === 'trung_binh' ? 'Trung bình' :
                         item.priority === 'cao' ? 'Cao' : 'Rất cao'}
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">
                        {statistics.total_tasks > 0 
                          ? `${Math.round((item.count / statistics.total_tasks) * 100)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

