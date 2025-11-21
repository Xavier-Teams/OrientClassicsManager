import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTask } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WorkTaskFormProps {
  task?: WorkTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  mode?: "dialog" | "inline";
  onCancel?: () => void;
  defaultStatus?: string;
  defaultGroup?: string;
}

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

export default function WorkTaskForm({
  task,
  open,
  onOpenChange,
  onSuccess,
  mode = "dialog",
  onCancel,
  defaultStatus,
  defaultGroup,
}: WorkTaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    assigned_to: user?.id || undefined,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        work_group: task.work_group || "chung",
        frequency: task.frequency || "dot_xuat",
        priority: task.priority || "trung_binh",
        status: task.status || "chua_bat_dau",
        start_date: task.start_date || "",
        due_date: task.due_date || "",
        progress_percent: task.progress_percent || 0,
        notes: task.notes || "",
        assigned_to: task.assigned_to || user?.id || undefined,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        work_group: defaultGroup || "chung",
        frequency: "dot_xuat",
        priority: "trung_binh",
        status: defaultStatus || "chua_bat_dau",
        start_date: "",
        due_date: "",
        progress_percent: 0,
        notes: "",
        assigned_to: user?.id || undefined,
      });
    }
    setErrors({});
  }, [task, user, open, defaultStatus, defaultGroup]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<WorkTask>) => apiClient.createWorkTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã tạo công việc mới",
      });
      onOpenChange(false);
      onSuccess?.();
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
      toast({
        title: "Thành công",
        description: "Đã cập nhật công việc",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật công việc",
        variant: "destructive",
      });
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!formData.work_group) {
      newErrors.work_group = "Nhóm công việc là bắt buộc";
    }

    if (!formData.frequency) {
      newErrors.frequency = "Tần suất là bắt buộc";
    }

    if (!formData.priority) {
      newErrors.priority = "Ưu tiên là bắt buộc";
    }

    if (!formData.status) {
      newErrors.status = "Trạng thái là bắt buộc";
    }

    if (formData.due_date && formData.start_date) {
      if (new Date(formData.due_date) < new Date(formData.start_date)) {
        newErrors.due_date = "Hạn hoàn thành phải sau ngày bắt đầu";
      }
    }

    if (formData.progress_percent < 0 || formData.progress_percent > 100) {
      newErrors.progress_percent = "Tiến độ phải từ 0 đến 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      progress_percent: parseInt(formData.progress_percent.toString()),
      start_date: formData.start_date || undefined,
      due_date: formData.due_date || undefined,
    };

    if (task) {
      updateMutation.mutate({ id: task.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
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
          <Label htmlFor="work_group">
            Nhóm công việc <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.work_group}
            onValueChange={(value) => setFormData({ ...formData, work_group: value })}
          >
            <SelectTrigger className={errors.work_group ? "border-red-500" : ""}>
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
          {errors.work_group && (
            <p className="text-sm text-red-500 mt-1">{errors.work_group}</p>
          )}
        </div>

        <div>
          <Label htmlFor="frequency">
            Tần suất <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger className={errors.frequency ? "border-red-500" : ""}>
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
          {errors.frequency && (
            <p className="text-sm text-red-500 mt-1">{errors.frequency}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">
            Ưu tiên <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
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
          {errors.priority && (
            <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">
            Trạng thái <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className={errors.status ? "border-red-500" : ""}>
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
          {errors.status && (
            <p className="text-sm text-red-500 mt-1">{errors.status}</p>
          )}
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
            className={errors.due_date ? "border-red-500" : ""}
          />
          {errors.due_date && (
            <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="progress_percent">
          Tiến độ (%) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="progress_percent"
          type="number"
          min="0"
          max="100"
          value={formData.progress_percent}
          onChange={(e) =>
            setFormData({
              ...formData,
              progress_percent: parseInt(e.target.value) || 0,
            })
          }
          className={errors.progress_percent ? "border-red-500" : ""}
        />
        {errors.progress_percent && (
          <p className="text-sm text-red-500 mt-1">{errors.progress_percent}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {task ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );

  if (mode === "inline") {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Chỉnh sửa công việc" : "Thêm công việc mới"}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

