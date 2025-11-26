import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Settings2,
  Eye,
  EyeOff,
  Edit2,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { apiClient, WorkTask } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import WorkTaskForm from "./WorkTaskForm";
import TaskActions from "./TaskActions";
import AssigneeEditor from "./AssigneeEditor";

interface ListViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}

export default function ListView({
  tasks,
  isLoading,
  onTaskUpdate,
}: ListViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<
    Record<number, Partial<WorkTask>>
  >({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<WorkTask | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  // Fetch users for TaskActions
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers({ page_size: 1000 }),
  });
  const users = usersData?.results || [];

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

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteWorkTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã xóa công việc",
      });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa công việc",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (task: WorkTask) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
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

  const handleInlineEditStart = (task: WorkTask, field: string) => {
    setEditingTaskId(task.id);
    setEditingField(field);

    // Map column ID to actual field name and get value
    let fieldValue: any;
    if (field === "name") {
      fieldValue = task.title;
    } else if (field === "progress") {
      fieldValue = task.progress_percent;
    } else {
      fieldValue = task[field as keyof WorkTask];
    }

    setEditingValues({
      ...editingValues,
      [task.id]: {
        ...editingValues[task.id],
        [field]: fieldValue,
      },
    });
  };

  const handleInlineEditChange = (
    task: WorkTask,
    field: string,
    value: any
  ) => {
    setEditingValues((prev) => ({
      ...prev,
      [task.id]: {
        ...(prev[task.id] || {}),
        [field]: value,
      },
    }));
  };

  const validateInlineEdit = (task: WorkTask, changes: Partial<WorkTask>): { error: string | null; warning: string | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Merge current task data with changes
    const mergedData = { ...task, ...changes };

    // Validation 1: Hạn hoàn thành >= Ngày bắt đầu
    if (mergedData.due_date && mergedData.start_date) {
      if (new Date(mergedData.due_date) < new Date(mergedData.start_date)) {
        return {
          error: "🚫 CẢNH BÁO: Hạn hoàn thành không thể sớm hơn ngày bắt đầu công việc!",
          warning: null
        };
      }
    }

    // Validation 2: Ngày hoàn thành không được trong tương lai (chống gian lận)
    if (mergedData.completed_date) {
      const completedDate = new Date(mergedData.completed_date);
      completedDate.setHours(0, 0, 0, 0);
      if (completedDate > today) {
        return {
          error: "🚫 GIAN LẬN PHÁT HIỆN!\n\nKhông thể hoàn thành công việc trong tương lai!\nHệ thống chỉ cho phép nhập ngày hôm nay hoặc trước đó để đảm bảo tính chính xác.",
          warning: null
        };
      }
    }

    // Validation 3: Ngày hoàn thành >= Ngày bắt đầu
    if (mergedData.completed_date && mergedData.start_date) {
      if (new Date(mergedData.completed_date) < new Date(mergedData.start_date)) {
        return {
          error: "🚫 LỖI LOGIC: Không thể hoàn thành công việc trước khi bắt đầu!",
          warning: null
        };
      }
    }

    // Additional warnings
    if (mergedData.due_date && new Date(mergedData.due_date) < today && mergedData.status !== "hoan_thanh") {
      return {
        error: null,
        warning: "⏰ Lưu ý: Công việc đã quá hạn! Bạn có muốn cập nhật trạng thái không?"
      };
    }

    return { error: null, warning: null };
  };

  const handleInlineEditSave = (task: WorkTask) => {
    // Use functional update to ensure we get the latest state
    setEditingValues((prevEditingValues) => {
      const changes = prevEditingValues[task.id];
      if (changes && Object.keys(changes).length > 0) {
        // Validate changes
        const validationResult = validateInlineEdit(task, changes);
        if (validationResult.error) {
          toast({
            title: "❌ Lỗi nhập liệu",
            description: validationResult.error,
            variant: "destructive",
            duration: 6000, // Show longer for important errors
          });
          return prevEditingValues; // Don't save, keep editing
        }
        
        if (validationResult.warning) {
          toast({
            title: "⚠️ Cảnh báo",
            description: validationResult.warning,
            variant: "default",
            duration: 4000,
          });
        }

        // Convert column IDs to actual field names
        const dataToSave: Partial<WorkTask> = {};
        Object.entries(changes).forEach(([key, value]) => {
          if (key === "name") {
            dataToSave.title = value as string;
          } else if (key === "progress") {
            dataToSave.progress_percent = Number(value) || 0;
          } else {
            (dataToSave as any)[key] = value;
          }
        });

        // Call mutation
        updateTaskMutation.mutate({
          id: task.id,
          data: dataToSave,
        });

        // Clear editing state
        setEditingTaskId(null);
        setEditingField(null);

        // Return updated state without this task's editing values
        const newEditingValues = { ...prevEditingValues };
        delete newEditingValues[task.id];
        return newEditingValues;
      } else {
        // No changes, just close editing
        setEditingTaskId(null);
        setEditingField(null);
        const newEditingValues = { ...prevEditingValues };
        delete newEditingValues[task.id];
        return newEditingValues;
      }
    });
  };

  const handleInlineEditCancel = (task: WorkTask) => {
    setEditingTaskId(null);
    setEditingField(null);
    const newEditingValues = { ...editingValues };
    delete newEditingValues[task.id];
    setEditingValues(newEditingValues);
  };

  // Handle click outside to auto-save and exit edit mode
  useEffect(() => {
    if (editingTaskId === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the table container
      // Also check if click is on popover/dialog elements (like calendar picker)
      const target = event.target as Node;
      const isClickingPopover =
        (target as HTMLElement)?.closest('[role="dialog"]') ||
        (target as HTMLElement)?.closest("[data-radix-popper-content-wrapper]");

      if (
        tableContainerRef.current &&
        !tableContainerRef.current.contains(target) &&
        !isClickingPopover
      ) {
        // Find the task being edited
        const task = tasks.find((t) => t.id === editingTaskId);
        if (task) {
          // Auto-save the changes using functional update
          setEditingValues((prevEditingValues) => {
            const changes = prevEditingValues[editingTaskId];
            if (changes && Object.keys(changes).length > 0) {
              // Convert column IDs to actual field names
              const dataToSave: Partial<WorkTask> = {};
              Object.entries(changes).forEach(([key, value]) => {
                if (key === "name") {
                  dataToSave.title = value as string;
                } else if (key === "progress") {
                  dataToSave.progress_percent = Number(value) || 0;
                } else {
                  (dataToSave as any)[key] = value;
                }
              });

              // Call mutation
              updateTaskMutation.mutate({
                id: task.id,
                data: dataToSave,
              });

              // Clear editing state
              setEditingTaskId(null);
              setEditingField(null);

              // Return updated state without this task's editing values
              const newEditingValues = { ...prevEditingValues };
              delete newEditingValues[editingTaskId];
              return newEditingValues;
            } else {
              // No changes, just close editing
              setEditingTaskId(null);
              setEditingField(null);
              const newEditingValues = { ...prevEditingValues };
              delete newEditingValues[editingTaskId];
              return newEditingValues;
            }
          });
        }
      }
    };

    // Use setTimeout to avoid immediate trigger when clicking to start edit
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingTaskId, tasks, updateTaskMutation]);

  const STATUS_COLORS: Record<string, string> = {
    chua_bat_dau:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    dang_tien_hanh:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    hoan_thanh:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    khong_hoan_thanh:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    da_huy: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    tam_hoan:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  const STATUS_LABELS: Record<string, string> = {
    chua_bat_dau: "Chưa bắt đầu",
    dang_tien_hanh: "Đang tiến hành",
    hoan_thanh: "Hoàn thành",
    khong_hoan_thanh: "Không hoàn thành",
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

  const renderCellContent = (task: WorkTask, columnId: string) => {
    const isEditingThisTask = editingTaskId === task.id;
    const isEditingThisField = isEditingThisTask && editingField === columnId;

    // Map column ID to actual field name for getting value from task
    const getTaskFieldValue = (colId: string) => {
      if (colId === "name") return task.title;
      if (colId === "progress") return task.progress_percent;
      return task[colId as keyof WorkTask];
    };

    const taskFieldValue = getTaskFieldValue(columnId);

    // Get current value: prioritize editingValues if editing, otherwise use task value
    let currentValue: any;
    if (
      isEditingThisTask &&
      editingValues[task.id] &&
      editingValues[task.id][columnId as keyof WorkTask] !== undefined
    ) {
      currentValue = editingValues[task.id][columnId as keyof WorkTask];
    } else {
      currentValue = taskFieldValue;
    }

    if (columnId === "name") {
      if (isEditingThisField) {
        return (
          <Input
            value={String(currentValue || "")}
            onChange={(e) => {
              const newValue = e.target.value;
              handleInlineEditChange(task, "name", newValue);
            }}
            className="h-8 text-sm min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={() => {
              handleInlineEditSave(task);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }
      return (
        <div
          className="font-medium max-w-xs group relative cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          <div className="truncate">{String(currentValue || "")}</div>
        </div>
      );
    }

    if (columnId === "work_group") {
      if (isEditingThisField) {
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}>
            <Select
              value={String(currentValue || "")}
              onValueChange={(value) => {
                handleInlineEditChange(task, "work_group", value);
                // Use setTimeout to ensure state is updated before saving
                setTimeout(() => {
                  handleInlineEditSave(task);
                }, 0);
              }}>
              <SelectTrigger
                className="h-8 text-sm min-w-[150px]"
                onClick={(e) => e.stopPropagation()}>
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
          </div>
        );
      }
      return (
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          {WORK_GROUP_LABELS[String(currentValue || "")] ||
            String(currentValue || "")}
        </Badge>
      );
    }

    if (columnId === "frequency") {
      if (isEditingThisField) {
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}>
            <Select
              value={String(currentValue || "")}
              onValueChange={(value) => {
                handleInlineEditChange(task, "frequency", value);
                setTimeout(() => {
                  handleInlineEditSave(task);
                }, 0);
              }}>
              <SelectTrigger
                className="h-8 text-sm min-w-[120px]"
                onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
      return (
        <span
          className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          {FREQUENCY_LABELS[String(currentValue || "")] ||
            String(currentValue || "")}
        </span>
      );
    }

    if (columnId === "priority") {
      if (isEditingThisField) {
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}>
            <Select
              value={String(currentValue || "")}
              onValueChange={(value) => {
                handleInlineEditChange(task, "priority", value);
                setTimeout(() => {
                  handleInlineEditSave(task);
                }, 0);
              }}>
              <SelectTrigger
                className="h-8 text-sm min-w-[120px]"
                onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
      return (
        <Badge
          className={cn(
            PRIORITY_COLORS[String(currentValue || "")] || "",
            "cursor-pointer hover:opacity-80"
          )}
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          {PRIORITY_LABELS[String(currentValue || "")] ||
            String(currentValue || "")}
        </Badge>
      );
    }

    if (columnId === "assignee") {
      // Inline assignee editor
      return (
        <AssigneeEditor
          task={task}
          users={users}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
          }}
        />
      );
    }

    if (columnId === "status") {
      if (isEditingThisField) {
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}>
            <Select
              value={String(currentValue || "")}
              onValueChange={(value) => {
                handleInlineEditChange(task, "status", value);
                setTimeout(() => {
                  handleInlineEditSave(task);
                }, 0);
              }}>
              <SelectTrigger
                className="h-8 text-sm min-w-[150px]"
                onClick={(e) => e.stopPropagation()}>
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
          </div>
        );
      }
      return (
        <Badge
          className={cn(
            STATUS_COLORS[String(currentValue || "")] || "",
            "cursor-pointer hover:opacity-80"
          )}
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          {STATUS_LABELS[String(currentValue || "")] ||
            String(currentValue || "")}
        </Badge>
      );
    }

    if (columnId === "start_date") {
      if (isEditingThisField) {
        return (
          <DateInput
            value={String(currentValue || "")}
            onChange={(value) =>
              handleInlineEditChange(task, "start_date", value || null)
            }
            placeholder="dd/mm/yyyy"
            className="h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
            onBlur={() => handleInlineEditSave(task)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }

      return (
        <span
          className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          {formatDate(String(currentValue || "")) || "-"}
        </span>
      );
    }
    if (columnId === "due_date") {
      if (isEditingThisField) {
        return (
          <DateInput
            value={String(currentValue || "")}
            onChange={(value) =>
              handleInlineEditChange(task, "due_date", value || null)
            }
            placeholder="dd/mm/yyyy"
            className="h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
            onBlur={() => handleInlineEditSave(task)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }

      const dueDateValue = String(currentValue || task.due_date || "");
      const daysUntilDue = dueDateValue
        ? Math.ceil(
            (new Date(dueDateValue).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;
      const isOverdue =
        daysUntilDue !== null &&
        daysUntilDue < 0 &&
        task.status !== "hoan_thanh";

      return (
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          <span className="text-sm">{formatDate(dueDateValue) || "-"}</span>
          {daysUntilDue !== null &&
            daysUntilDue >= 0 &&
            daysUntilDue <= 7 &&
            task.status !== "hoan_thanh" && (
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
      if (isEditingThisField) {
        return (
          <DateInput
            value={String(currentValue || "")}
            onChange={(value) => {
              const newValue = value || null;

              handleInlineEditChange(task, "completed_date", newValue);
              // Tự động chuyển trạng thái sang "hoàn thành" khi có ngày hoàn thành
              if (newValue) {
                handleInlineEditChange(task, "status", "hoan_thanh");
              } else {
                // Khi xóa ngày hoàn thành, reset trạng thái về "Đang tiến hành"
                handleInlineEditChange(task, "status", "dang_tien_hanh");
              }
            }}
            placeholder="dd/mm/yyyy"
            maxDate={new Date()}
            className="h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
            onBlur={() => handleInlineEditSave(task)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }

      // Calculate progress evaluation for completed tasks
      const completedDate = String(currentValue || task.completed_date || "");
      const dueDate = String(task.due_date || "");
      let progressBadge: { label: string; className: string } | null = null;

      if (task.status === "hoan_thanh" && completedDate && dueDate) {
        const completed = new Date(completedDate);
        const due = new Date(dueDate);
        // Reset time to compare dates only
        completed.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = completed.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Đúng tiến độ
          progressBadge = {
            label: "Đúng tiến độ",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          };
        } else if (diffDays < 0) {
          // Hoàn thành trước hạn
          progressBadge = {
            label: "Hoàn thành trước hạn",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          };
        } else {
          // Chậm tiến độ
          progressBadge = {
            label: "Chậm tiến độ",
            className:
              "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
          };
        }
      }

      return (
        <div className="flex items-center gap-2">
          <span
            className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
            onClick={() => handleInlineEditStart(task, columnId)}
            title="Click để chỉnh sửa">
            {formatDate(completedDate) || "-"}
          </span>
          {progressBadge && (
            <Badge className={progressBadge.className}>
              {progressBadge.label}
            </Badge>
          )}
        </div>
      );
    }

    if (columnId === "progress") {
      const progressValue =
        isEditingThisTask &&
        editingValues[task.id] &&
        editingValues[task.id][columnId as keyof WorkTask] !== undefined
          ? Number(editingValues[task.id][columnId as keyof WorkTask])
          : task.progress_percent;

      if (isEditingThisField) {
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={progressValue}
              onChange={(e) =>
                handleInlineEditChange(
                  task,
                  "progress",
                  parseInt(e.target.value) || 0
                )
              }
              className="h-8 text-sm w-20"
              onClick={(e) => e.stopPropagation()}
              onBlur={() => handleInlineEditSave(task)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInlineEditSave(task);
                } else if (e.key === "Escape") {
                  handleInlineEditCancel(task);
                }
              }}
              autoFocus
            />
            <span className="text-sm">%</span>
          </div>
        );
      }
      return (
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                progressValue === 100
                  ? "bg-green-600"
                  : progressValue >= 50
                  ? "bg-blue-600"
                  : "bg-orange-600"
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <span className="text-sm font-medium w-10">{progressValue}%</span>
        </div>
      );
    }

    if (columnId === "created_by") {
      return <span className="text-sm">{task.created_by_name || "-"}</span>;
    }
    if (columnId === "created_at") {
      return (
        <span className="text-sm">{formatDate(task.created_at) || "-"}</span>
      );
    }
    if (columnId === "updated_at") {
      return (
        <span className="text-sm">{formatDate(task.updated_at) || "-"}</span>
      );
    }

    if (columnId === "description") {
      if (isEditingThisField) {
        return (
          <Textarea
            value={String(currentValue || "")}
            onChange={(e) => {
              const newValue = e.target.value;
              handleInlineEditChange(task, "description", newValue);
            }}
            className="min-w-[300px] text-sm resize-none"
            rows={3}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={() => {
              handleInlineEditSave(task);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }
      return (
        <div
          className="max-w-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          <div className="truncate text-sm" title={String(currentValue || "")}>
            {String(currentValue || "") || "-"}
          </div>
        </div>
      );
    }

    if (columnId === "notes") {
      if (isEditingThisField) {
        return (
          <Textarea
            value={String(currentValue || "")}
            onChange={(e) => {
              const newValue = e.target.value;
              handleInlineEditChange(task, "notes", newValue);
            }}
            className="min-w-[300px] text-sm resize-none"
            rows={3}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onBlur={() => {
              handleInlineEditSave(task);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleInlineEditSave(task);
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleInlineEditCancel(task);
              }
            }}
            autoFocus
          />
        );
      }
      return (
        <div
          className="max-w-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
          onClick={() => handleInlineEditStart(task, columnId)}
          title="Click để chỉnh sửa">
          <div className="truncate text-sm" title={String(currentValue || "")}>
            {String(currentValue || "") || "-"}
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
    return (
      <div className="text-center py-8 text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
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
                <DialogDescription>
                  Chọn các cột bạn muốn hiển thị trong bảng công việc. Bạn có thể ẩn/hiện các cột để tối ưu hóa giao diện.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Chọn các cột hiển thị</Label>
                  <div className="space-y-2 mt-2">
                    {columnOrder.map((columnId) => (
                      <div
                        key={columnId}
                        className="flex items-center gap-2 p-2 border rounded">
                        <Checkbox
                          checked={visibleColumns.has(columnId)}
                          onCheckedChange={() =>
                            toggleColumnVisibility(columnId)
                          }
                        />
                        <span className="flex-1">
                          {getColumnLabel(columnId)}
                        </span>
                      </div>
                    ))}
                    {customFields
                      .filter((f) => f.is_visible)
                      .map((field) => {
                        const columnId = `custom_${field.id}`;
                        return (
                          <div
                            key={columnId}
                            className="flex items-center gap-2 p-2 border rounded">
                            <Checkbox
                              checked={visibleColumns.has(columnId)}
                              onCheckedChange={() =>
                                toggleColumnVisibility(columnId)
                              }
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

      <div
        className="border rounded-lg overflow-hidden"
        ref={tableContainerRef}>
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
                <TableHead className="w-32">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 && !isAddingNew ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      allColumns.filter((col) => visibleColumns.has(col)).length
                    }
                    className="text-center py-8 text-muted-foreground">
                    Không có công việc nào
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className={
                        editingTaskId === task.id ? "bg-muted/50" : ""
                      }>
                      {allColumns
                        .filter((col) => visibleColumns.has(col))
                        .map((columnId) => (
                          <TableCell key={columnId}>
                            {renderCellContent(task, columnId)}
                          </TableCell>
                        ))}
                      <TableCell className="w-32">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* TaskActions for assignment, evaluation, etc. */}
                          <TaskActions 
                            task={task} 
                            users={users} 
                            onTaskUpdate={() => {
                              // Refresh tasks after action
                              queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
                            }} 
                          />
                          
                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(task)}
                            className="h-6 w-6 p-0"
                            title="Chỉnh sửa đầy đủ">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          {/* Delete button (only for task creator) */}
                          {user && task.created_by === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(task)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              title="Xóa công việc">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa công việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa công việc "{taskToDelete?.title}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTaskMutation.isPending}>
              {deleteTaskMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

