import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiClient, WorkTask } from "@/lib/api";
import { Plus, Edit, Trash2, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const WORK_GROUP_CHOICES = [
  { value: "chung", label: "Công việc chung" },
  { value: "bien_tap", label: "Biên tập" },
  { value: "thiet_ke_cntt", label: "Thiết kế + CNTT" },
  { value: "quet_trung_lap", label: "Quét trùng lặp" },
  { value: "hanh_chinh", label: "Hành chính" },
  { value: "tham_dinh_ban_dich_thu", label: "Thẩm định bản dịch thử" },
  { value: "tham_dinh_cap_cg", label: "Thẩm định cấp CG" },
  { value: "nghiem_thu_cap_da", label: "Nghiệm thu cấp DA" },
  { value: "hop_thuong_truc", label: "Họp thường trực" },
];

const STATUS_CHOICES = [
  { value: "chua_bat_dau", label: "Chưa bắt đầu" },
  { value: "dang_tien_hanh", label: "Đang tiến hành" },
  { value: "hoan_thanh", label: "Hoàn thành" },
  { value: "khong_hoan_thanh", label: "Không hoàn thành" },
  { value: "cham_tien_do", label: "Chậm tiến độ" },
  { value: "hoan_thanh_truoc_han", label: "Hoàn thành trước hạn" },
  { value: "da_huy", label: "Đã hủy" },
  { value: "tam_hoan", label: "Tạm hoãn" },
];

const FREQUENCY_CHOICES = [
  { value: "hang_ngay", label: "Hằng ngày" },
  { value: "hang_tuan", label: "Hằng tuần" },
  { value: "hang_thang", label: "Hằng tháng" },
  { value: "dot_xuat", label: "Đột xuất" },
];

const PRIORITY_CHOICES = [
  { value: "thap", label: "Thấp" },
  { value: "trung_binh", label: "Trung bình" },
  { value: "cao", label: "Cao" },
  { value: "rat_cao", label: "Rất cao" },
];

export default function WorkPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    work_group: "chung",
    frequency: "dot_xuat",
    priority: "trung_binh",
    status: "chua_bat_dau",
    start_date: "",
    due_date: "",
    progress_percent: 0,
    notes: "",
  });

  const { data: tasks, isLoading } = useQuery<{ results: WorkTask[] }>({
    queryKey: ["work-tasks", user?.id],
    queryFn: () => apiClient.getWorkTasks({ assigned_to: user?.id }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<WorkTask>) => apiClient.createWorkTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Thành công",
        description: "Đã tạo công việc mới",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo công việc",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkTask> }) =>
      apiClient.updateWorkTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      setIsDialogOpen(false);
      setEditingTask(null);
      resetForm();
      toast({
        title: "Thành công",
        description: "Đã cập nhật công việc",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật công việc",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteWorkTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã xóa công việc",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa công việc",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      work_group: "chung",
      frequency: "dot_xuat",
      priority: "trung_binh",
      status: "chua_bat_dau",
      start_date: "",
      due_date: "",
      progress_percent: 0,
      notes: "",
    });
    setEditingTask(null);
  };

  const handleOpenDialog = (task?: WorkTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        work_group: task.work_group,
        frequency: task.frequency,
        priority: task.priority,
        status: task.status,
        start_date: task.start_date || "",
        due_date: task.due_date || "",
        progress_percent: task.progress_percent,
        notes: task.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      assigned_to: user?.id,
      progress_percent: parseInt(formData.progress_percent.toString()),
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      hoan_thanh: { label: "Hoàn thành", variant: "default" },
      dang_tien_hanh: { label: "Đang tiến hành", variant: "secondary" },
      cham_tien_do: { label: "Chậm tiến độ", variant: "destructive" },
      chua_bat_dau: { label: "Chưa bắt đầu", variant: "outline" },
      khong_hoan_thanh: { label: "Không hoàn thành", variant: "destructive" },
      hoan_thanh_truoc_han: { label: "Hoàn thành trước hạn", variant: "default" },
      da_huy: { label: "Đã hủy", variant: "outline" },
      tam_hoan: { label: "Tạm hoãn", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kế hoạch làm việc và đề xuất cải tiến</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý kế hoạch công việc cá nhân và đề xuất cải tiến
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm công việc
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="work_group">Nhóm công việc</Label>
                  <Select
                    value={formData.work_group}
                    onValueChange={(value) => setFormData({ ...formData, work_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_GROUP_CHOICES.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Tần suất</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_CHOICES.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Ưu tiên</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_CHOICES.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_CHOICES.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Ngày bắt đầu</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="due_date">Hạn hoàn thành</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="progress_percent">Tiến độ (%)</Label>
                <Input
                  id="progress_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percent}
                  onChange={(e) => setFormData({ ...formData, progress_percent: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Ghi chú / Đề xuất cải tiến</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Ghi chú hoặc đề xuất cải tiến quy trình, phương pháp làm việc..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTask ? "Cập nhật" : "Tạo mới"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách công việc</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.results && tasks.results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Nhóm</TableHead>
                  <TableHead>Tần suất</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn hoàn thành</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.results.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {WORK_GROUP_CHOICES.find((c) => c.value === task.work_group)?.label || task.work_group}
                    </TableCell>
                    <TableCell>
                      {FREQUENCY_CHOICES.find((c) => c.value === task.frequency)?.label || task.frequency}
                    </TableCell>
                    <TableCell>
                      {PRIORITY_CHOICES.find((c) => c.value === task.priority)?.label || task.priority}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("vi-VN") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${task.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-sm">{task.progress_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Chưa có công việc nào. Hãy thêm công việc mới để bắt đầu.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

