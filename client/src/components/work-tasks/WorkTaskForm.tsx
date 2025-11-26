import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, Clock, Shield } from "lucide-react";
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
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    work_group: "chung",
    frequency: "dot_xuat",
    priority: "trung_binh",
    status: "chua_bat_dau",
    start_date: "",
    due_date: "",
    completed_date: "",
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
        completed_date: task.completed_date || "",
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
        completed_date: "",
        progress_percent: 0,
        notes: "",
        assigned_to: user?.id || undefined,
      });
    }
    setErrors({});
    setWarnings({});
    setShowValidationAlert(false);
  }, [task, user, open, defaultStatus, defaultGroup]);

  // Trigger real-time validation when form data changes
  useEffect(() => {
    if (open) {
      validateRealTime();
    }
  }, [
    formData.start_date,
    formData.due_date,
    formData.completed_date,
    formData.progress_percent,
    formData.status,
    open,
  ]);

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

  // Real-time validation function
  const validateRealTime = (field?: string) => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Basic required field validation
    if (!formData.title.trim()) {
      newErrors.title = "⚠️ Tiêu đề công việc là bắt buộc";
    }

    if (!formData.work_group) {
      newErrors.work_group = "⚠️ Vui lòng chọn nhóm công việc";
    }

    if (!formData.frequency) {
      newErrors.frequency = "⚠️ Vui lòng chọn tần suất thực hiện";
    }

    if (!formData.priority) {
      newErrors.priority = "⚠️ Vui lòng chọn mức độ ưu tiên";
    }

    if (!formData.status) {
      newErrors.status = "⚠️ Vui lòng chọn trạng thái công việc";
    }

    // Date validation with detailed messages
    const startDate = formData.start_date
      ? new Date(formData.start_date)
      : null;
    const dueDate = formData.due_date ? new Date(formData.due_date) : null;
    const completedDate = formData.completed_date
      ? new Date(formData.completed_date)
      : null;

    // Validation 1: Hạn hoàn thành >= Ngày bắt đầu
    if (dueDate && startDate) {
      if (dueDate < startDate) {
        newErrors.due_date =
          "🚫 CẢNH BÁO: Hạn hoàn thành không thể sớm hơn ngày bắt đầu công việc!";
      } else if (dueDate.getTime() === startDate.getTime()) {
        newWarnings.due_date =
          "⚡ Lưu ý: Hạn hoàn thành trùng với ngày bắt đầu - công việc cần hoàn thành trong ngày";
      }
    }

    // Validation 2: Ngày hoàn thành không được trong tương lai (chống gian lận)
    if (completedDate) {
      completedDate.setHours(0, 0, 0, 0);
      if (completedDate > today) {
        newErrors.completed_date =
          "🚫 GIAN LẬN PHÁT HIỆN: Không thể hoàn thành công việc trong tương lai! Vui lòng chọn ngày hôm nay hoặc trước đó.";
      } else if (completedDate.getTime() === today.getTime()) {
        newWarnings.completed_date = "✅ Hoàn thành hôm nay - Tuyệt vời!";
      }
    }

    // Validation 3: Ngày hoàn thành >= Ngày bắt đầu
    if (completedDate && startDate) {
      if (completedDate < startDate) {
        newErrors.completed_date =
          "🚫 LỖI LOGIC: Không thể hoàn thành công việc trước khi bắt đầu!";
      }
    }

    // Progress validation
    if (formData.progress_percent < 0 || formData.progress_percent > 100) {
      newErrors.progress_percent = "⚠️ Tiến độ phải nằm trong khoảng 0-100%";
    }

    // Additional warnings for better UX
    if (dueDate && dueDate < today && formData.status !== "hoan_thanh") {
      newWarnings.due_date =
        "⏰ Công việc đã quá hạn! Cần cập nhật trạng thái hoặc gia hạn.";
    }

    if (formData.progress_percent === 100 && formData.status !== "hoan_thanh") {
      newWarnings.progress_percent =
        "🎯 Tiến độ 100% nhưng trạng thái chưa 'Hoàn thành'";
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    setShowValidationAlert(Object.keys(newErrors).length > 0);

    return Object.keys(newErrors).length === 0;
  };

  const validate = (): boolean => {
    return validateRealTime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "❌ Không thể lưu",
        description:
          "Vui lòng sửa các lỗi được đánh dấu màu đỏ trước khi tiếp tục",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      progress_percent: parseInt(formData.progress_percent.toString()),
      start_date: formData.start_date || undefined,
      due_date: formData.due_date || undefined,
      completed_date: formData.completed_date || undefined,
    };

    // Check for critical warnings that need confirmation
    const hasWarnings = Object.keys(warnings).length > 0;
    const hasOverdueWarning = warnings.due_date?.includes("quá hạn");
    const hasProgressWarning = warnings.progress_percent?.includes("100%");

    if (hasWarnings && (hasOverdueWarning || hasProgressWarning)) {
      setPendingSubmitData(submitData);
      setShowConfirmDialog(true);
      return;
    }

    // No critical warnings, proceed with submit
    performSubmit(submitData);
  };

  const performSubmit = (submitData: any) => {
    if (task) {
      updateMutation.mutate({ id: task.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingSubmitData) {
      performSubmit(pendingSubmitData);
      setPendingSubmitData(null);
    }
    setShowConfirmDialog(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Validation Alert */}
      {showValidationAlert && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            🚫 Phát hiện lỗi nhập liệu! Vui lòng kiểm tra và sửa các trường được
            đánh dấu màu đỏ bên dưới.
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings Alert */}
      {Object.keys(warnings).length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              {Object.values(warnings).map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
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
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
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
            onValueChange={(value) =>
              setFormData({ ...formData, work_group: value })
            }>
            <SelectTrigger
              className={errors.work_group ? "border-red-500" : ""}>
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
            onValueChange={(value) =>
              setFormData({ ...formData, frequency: value })
            }>
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
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value })
            }>
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
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }>
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
          <Label htmlFor="start_date" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Ngày bắt đầu
          </Label>
          <DateInput
            id="start_date"
            value={formData.start_date}
            onChange={(value) =>
              setFormData({ ...formData, start_date: value })
            }
            placeholder="dd/mm/yyyy"
            className={
              errors.start_date
                ? "border-red-500 bg-red-50"
                : warnings.start_date
                ? "border-yellow-500 bg-yellow-50"
                : ""
            }
          />
          {errors.start_date && (
            <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.start_date}
            </p>
          )}
          {warnings.start_date && !errors.start_date && (
            <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {warnings.start_date}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="due_date" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Hạn hoàn thành
          </Label>
          <DateInput
            id="due_date"
            value={formData.due_date}
            onChange={(value) => setFormData({ ...formData, due_date: value })}
            placeholder="dd/mm/yyyy"
            className={
              errors.due_date
                ? "border-red-500 bg-red-50"
                : warnings.due_date
                ? "border-yellow-500 bg-yellow-50"
                : ""
            }
          />
          {errors.due_date && (
            <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.due_date}
            </p>
          )}
          {warnings.due_date && !errors.due_date && (
            <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {warnings.due_date}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="completed_date" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Ngày hoàn thành
          <span className="text-xs text-gray-500">
            (Không được trong tương lai)
          </span>
        </Label>
        <DateInput
          id="completed_date"
          value={formData.completed_date}
          onChange={(value) => {
            setFormData({
              ...formData,
              completed_date: value,
              // Tự động chuyển trạng thái sang "hoàn thành" khi có ngày hoàn thành
              // Khi xóa ngày hoàn thành, reset trạng thái về "Đang tiến hành"
              status: value ? "hoan_thanh" : "dang_tien_hanh",
            });
          }}
          placeholder="dd/mm/yyyy"
          maxDate={new Date()} // Prevent future dates in date picker
          className={
            errors.completed_date
              ? "border-red-500 bg-red-50"
              : warnings.completed_date
              ? "border-green-500 bg-green-50"
              : ""
          }
        />
        {errors.completed_date && (
          <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-sm text-red-700 font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.completed_date}
            </p>
            <p className="text-xs text-red-600 mt-1">
              💡 Mẹo: Chỉ có thể nhập ngày hôm nay hoặc trước đó để tránh gian
              lận
            </p>
          </div>
        )}
        {warnings.completed_date && !errors.completed_date && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {warnings.completed_date}
          </p>
        )}
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
          className={
            errors.progress_percent
              ? "border-red-500 bg-red-50"
              : warnings.progress_percent
              ? "border-yellow-500 bg-yellow-50"
              : ""
          }
        />
        {errors.progress_percent && (
          <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.progress_percent}
          </p>
        )}
        {warnings.progress_percent && !errors.progress_percent && (
          <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {warnings.progress_percent}
          </p>
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
          disabled={createMutation.isPending || updateMutation.isPending}>
          {task ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  );

  if (mode === "inline") {
    return formContent;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {task ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Warnings */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              Xác nhận lưu với cảnh báo
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Hệ thống phát hiện một số vấn đề cần lưu ý:</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 space-y-1">
                {Object.values(warnings).map((warning, index) => (
                  <div
                    key={index}
                    className="text-sm text-yellow-800 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
              <p className="font-medium">
                Bạn có chắc chắn muốn tiếp tục lưu không?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Hủy, tôi sẽ kiểm tra lại
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Vẫn lưu
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
