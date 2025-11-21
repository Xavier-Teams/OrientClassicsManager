import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, Eye, EyeOff, Edit2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTask } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import WorkTaskForm from "./WorkTaskForm";

interface ListViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}


export default function ListView({ tasks, isLoading, onTaskUpdate }: ListViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "name",
      "work_group",
      "frequency",
      "priority",
      "assignee",
      "status",
      "start_date",
      "due_date",
      "completed_date",
      "progress",
      "created_by",
      "created_at",
    ])
  );
  const [columnOrder] = useState<string[]>([
    "name",
    "work_group",
    "frequency",
    "priority",
    "assignee",
    "status",
    "start_date",
    "due_date",
    "completed_date",
    "progress",
    "created_by",
    "created_at",
    "updated_at",
    "description",
    "notes",
  ]);

  // Fetch custom fields
  const { data: customFieldsData } = useQuery({
    queryKey: ["custom-fields"],
    queryFn: () => apiClient.getCustomFields({ page_size: 100 }),
  });

  const customFields = customFieldsData?.results || [];

  // Add custom fields to column order if they're visible
  const allColumns = [
    ...columnOrder,
    ...customFields.filter((f) => f.is_visible).map((f) => `custom_${f.id}`),
  ];

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkTask> }) =>
      apiClient.updateWorkTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật công việc",
      });
      setEditingTaskId(null);
      setIsAddingNew(false);
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleEditClick = (task: WorkTask) => {
    setSelectedTask(task);
    setFormDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTask(null);
    setFormDialogOpen(true);
  };

  const handleInlineEdit = (task: WorkTask, field: string, value: any) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { [field]: value },
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    chua_bat_dau: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    dang_tien_hanh: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    hoan_thanh: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    khong_hoan_thanh: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    cham_tien_do: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    hoan_thanh_truoc_han: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    da_huy: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    tam_hoan: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
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

  const PRIORITY_COLORS: Record<string, string> = {
    thap: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    trung_binh: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    cao: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    rat_cao: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    thap: "Thấp",
    trung_binh: "Trung bình",
    cao: "Cao",
    rat_cao: "Rất cao",
  };

  const getColumnLabel = (columnId: string): string => {
    const labels: Record<string, string> = {
      name: "Tên công việc",
      work_group: "Nhóm công việc",
      frequency: "Tần suất",
      priority: "Ưu tiên",
      assignee: "Người được giao",
      status: "Trạng thái",
      start_date: "Ngày bắt đầu",
      due_date: "Hạn hoàn thành",
      completed_date: "Ngày hoàn thành",
      progress: "Tiến độ",
      created_by: "Người tạo",
      created_at: "Ngày tạo",
      updated_at: "Ngày cập nhật",
      description: "Mô tả",
      notes: "Ghi chú",
    };
    if (columnId.startsWith("custom_")) {
      const fieldId = parseInt(columnId.replace("custom_", ""));
      const field = customFields.find((f) => f.id === fieldId);
      return field?.name || columnId;
    }
    return labels[columnId] || columnId;
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

  const FREQUENCY_LABELS: Record<string, string> = {
    hang_ngay: "Hằng ngày",
    hang_tuan: "Hằng tuần",
    hang_thang: "Hằng tháng",
    dot_xuat: "Đột xuất",
  };

  const renderCellContent = (task: WorkTask, columnId: string, isEditing: boolean = false) => {
    const isEditingThisCell = isEditing && editingTaskId === task.id;
    if (columnId === "name") {
      if (isEditingThisCell) {
        return (
          <Input
            value={task.title}
            onChange={(e) => handleInlineEdit(task, "title", e.target.value)}
            className="h-8 text-sm"
            onBlur={() => setEditingTaskId(null)}
            autoFocus
          />
        );
      }
      return (
        <div className="font-medium max-w-xs group relative">
          <div className="truncate" title={task.title}>
            {task.title}
          </div>
          <button
            onClick={() => setEditingTaskId(task.id)}
            className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1"
          >
            <Edit2 className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      );
    }
    if (columnId === "work_group") {
      if (isEditingThisCell) {
        return (
          <Select
            value={task.work_group}
            onValueChange={(value) => handleInlineEdit(task, "work_group", value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(WORK_GROUP_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Badge variant="outline" className="cursor-pointer" onClick={() => setEditingTaskId(task.id)}>
          {WORK_GROUP_LABELS[task.work_group] || task.work_group}
        </Badge>
      );
    }
    if (columnId === "frequency") {
      return <span className="text-sm">{FREQUENCY_LABELS[task.frequency] || task.frequency}</span>;
    }
    if (columnId === "priority") {
      return (
        <Badge className={cn(PRIORITY_COLORS[task.priority] || "")}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </Badge>
      );
    }
    if (columnId === "assignee") {
      return (
        <div className="flex items-center gap-2">
          {task.assigned_to_name || "-"}
        </div>
      );
    }
    if (columnId === "status") {
      if (isEditingThisCell) {
        return (
          <Select
            value={task.status}
            onValueChange={(value) => handleInlineEdit(task, "status", value)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Badge
          className={cn(STATUS_COLORS[task.status] || "", "cursor-pointer")}
          onClick={() => setEditingTaskId(task.id)}
        >
          {STATUS_LABELS[task.status] || task.status}
        </Badge>
      );
    }
    if (columnId === "start_date") {
      return <span className="text-sm">{formatDate(task.start_date) || "-"}</span>;
    }
    if (columnId === "due_date") {
      if (isEditingThisCell) {
        return (
          <Input
            type="date"
            value={formatDateForInput(task.due_date)}
            onChange={(e) => handleInlineEdit(task, "due_date", e.target.value || null)}
            className="h-8 text-sm"
            onBlur={() => setEditingTaskId(null)}
          />
        );
      }
      const daysUntilDue = task.due_date
        ? Math.ceil(
            (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;
      const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "hoan_thanh";
      
      return (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingTaskId(task.id)}>
          <span className="text-sm">{formatDate(task.due_date) || "-"}</span>
          {daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && task.status !== "hoan_thanh" && (
            <Badge variant="outline" className="text-orange-600 text-xs">
              {daysUntilDue}d
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Quá hạn
            </Badge>
          )}
        </div>
      );
    }
    if (columnId === "completed_date") {
      return <span className="text-sm">{formatDate(task.completed_date) || "-"}</span>;
    }
    if (columnId === "progress") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                task.progress_percent === 100
                  ? "bg-green-600"
                  : task.progress_percent >= 50
                  ? "bg-blue-600"
                  : "bg-orange-600"
              )}
              style={{ width: `${task.progress_percent}%` }}
            />
          </div>
          <span className="text-sm font-medium w-10">{task.progress_percent}%</span>
        </div>
      );
    }
    if (columnId === "created_by") {
      return <span className="text-sm">{task.created_by_name || "-"}</span>;
    }
    if (columnId === "created_at") {
      return <span className="text-sm">{formatDate(task.created_at) || "-"}</span>;
    }
    if (columnId === "updated_at") {
      return <span className="text-sm">{formatDate(task.updated_at) || "-"}</span>;
    }
    if (columnId === "description") {
      return (
        <div className="max-w-xs">
          <div className="truncate text-sm" title={task.description || ""}>
            {task.description || "-"}
          </div>
        </div>
      );
    }
    if (columnId === "notes") {
      return (
        <div className="max-w-xs">
          <div className="truncate text-sm" title={task.notes || ""}>
            {task.notes || "-"}
          </div>
        </div>
      );
    }
    if (columnId.startsWith("custom_")) {
      const fieldId = parseInt(columnId.replace("custom_", ""));
      const fieldValue = task.custom_field_values?.[fieldId];
      if (!fieldValue) return "-";
      
      const value = fieldValue.value;
      if (fieldValue.field_type === "checkbox") {
        return value ? "✓" : "-";
      }
      if (fieldValue.field_type === "date") {
        return formatDate(value);
      }
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return String(value || "-");
    }
    return "-";
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Tùy chỉnh cột
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tùy chỉnh cột</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Chọn các cột hiển thị</Label>
                  <div className="space-y-2 mt-2">
                    {columnOrder.map((columnId) => (
                      <div
                        key={columnId}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <Checkbox
                          checked={visibleColumns.has(columnId)}
                          onCheckedChange={() => toggleColumnVisibility(columnId)}
                        />
                        <span className="flex-1">{getColumnLabel(columnId)}</span>
                      </div>
                    ))}
                    {customFields
                      .filter((f) => f.is_visible)
                      .map((field) => {
                        const columnId = `custom_${field.id}`;
                        return (
                          <div
                            key={columnId}
                            className="flex items-center gap-2 p-2 border rounded"
                          >
                            <Checkbox
                              checked={visibleColumns.has(columnId)}
                              onCheckedChange={() => toggleColumnVisibility(columnId)}
                            />
                            <span className="flex-1">{field.name}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm công việc
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {allColumns
                  .filter((col) => visibleColumns.has(col))
                  .map((columnId) => (
                    <TableHead key={columnId}>
                      {getColumnLabel(columnId)}
                    </TableHead>
                  ))}
                <TableHead className="w-12">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 && !isAddingNew ? (
                <TableRow>
                  <TableCell colSpan={allColumns.filter((col) => visibleColumns.has(col)).length} className="text-center py-8 text-muted-foreground">
                    Không có công việc nào
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className={editingTaskId === task.id ? "bg-muted/50" : ""}>
                      {allColumns
                        .filter((col) => visibleColumns.has(col))
                        .map((columnId) => (
                          <TableCell key={columnId}>
                            {renderCellContent(task, columnId, true)}
                          </TableCell>
                        ))}
                      <TableCell className="w-12">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(task)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <WorkTaskForm
        task={selectedTask}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={() => {
          setSelectedTask(null);
        }}
      />
    </div>
  );
}

