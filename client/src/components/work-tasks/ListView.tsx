import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Settings2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient, WorkTask } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ListViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}


export default function ListView({ tasks, isLoading, onTaskUpdate }: ListViewProps) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(["name", "status", "assignee", "due_date", "priority"])
  );
  const [columnOrder] = useState<string[]>([
    "name",
    "status",
    "assignee",
    "due_date",
    "priority",
    "progress",
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
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
    if (columnId === "name") return "Tên công việc";
    if (columnId === "status") return "Trạng thái";
    if (columnId === "assignee") return "Người được giao";
    if (columnId === "due_date") return "Hạn hoàn thành";
    if (columnId === "priority") return "Ưu tiên";
    if (columnId === "progress") return "Tiến độ";
    if (columnId.startsWith("custom_")) {
      const fieldId = parseInt(columnId.replace("custom_", ""));
      const field = customFields.find((f) => f.id === fieldId);
      return field?.name || columnId;
    }
    return columnId;
  };

  const renderCellContent = (task: WorkTask, columnId: string) => {
    if (columnId === "name") {
      return (
        <div className="font-medium max-w-xs">
          <div className="truncate" title={task.title}>
            {task.title}
          </div>
        </div>
      );
    }
    if (columnId === "status") {
      return (
        <Badge className={cn(STATUS_COLORS[task.status] || "")}>
          {STATUS_LABELS[task.status] || task.status}
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
    if (columnId === "due_date") {
      return formatDate(task.due_date);
    }
    if (columnId === "priority") {
      return (
        <Badge className={cn(PRIORITY_COLORS[task.priority] || "")}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </Badge>
      );
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
        <Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={allColumns.filter((col) => visibleColumns.has(col)).length} className="text-center py-8 text-muted-foreground">
                    Không có công việc nào
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    {allColumns
                      .filter((col) => visibleColumns.has(col))
                      .map((columnId) => (
                        <TableCell key={columnId}>
                          {renderCellContent(task, columnId)}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

