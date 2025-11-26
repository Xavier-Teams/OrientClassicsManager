import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient, WorkTask } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignmentRequestFormProps {
  task: WorkTask;
  onRequestCreated?: () => void;
}

const REQUEST_TYPE_OPTIONS = [
  { value: "start_date", label: "Ngày bắt đầu" },
  { value: "due_date", label: "Hạn hoàn thành" },
  { value: "title", label: "Tiêu đề công việc" },
  { value: "description", label: "Mô tả công việc" },
  { value: "priority", label: "Mức độ ưu tiên" },
  { value: "work_group", label: "Nhóm công việc" },
  { value: "other", label: "Khác" },
];

const PRIORITY_OPTIONS = [
  { value: "thap", label: "Thấp" },
  { value: "trung_binh", label: "Trung bình" },
  { value: "cao", label: "Cao" },
  { value: "rat_cao", label: "Rất cao" },
];

const WORK_GROUP_OPTIONS = [
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

export default function AssignmentRequestForm({ task, onRequestCreated }: AssignmentRequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    request_type: "",
    current_value: "",
    requested_value: "",
    reason: "",
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: {
      task: number;
      request_type: string;
      current_value?: string;
      requested_value: string;
      reason: string;
    }) => apiClient.createAssignmentRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-requests"] });
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu điều chỉnh. Vui lòng chờ phê duyệt.",
      });
      setDialogOpen(false);
      setRequestData({
        request_type: "",
        current_value: "",
        requested_value: "",
        reason: "",
      });
      onRequestCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo yêu cầu điều chỉnh",
        variant: "destructive",
      });
    },
  });

  const getCurrentValue = (type: string) => {
    switch (type) {
      case "start_date":
        return task.start_date || "";
      case "due_date":
        return task.due_date || "";
      case "title":
        return task.title || "";
      case "description":
        return task.description || "";
      case "priority":
        return task.priority || "";
      case "work_group":
        return task.work_group || "";
      default:
        return "";
    }
  };

  const handleRequestTypeChange = (type: string) => {
    const currentValue = getCurrentValue(type);
    setRequestData({
      ...requestData,
      request_type: type,
      current_value: currentValue,
      requested_value: type === "start_date" || type === "due_date" ? "" : currentValue,
    });
  };

  const handleSubmit = () => {
    if (!requestData.request_type) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại yêu cầu",
        variant: "destructive",
      });
      return;
    }

    if (!requestData.requested_value.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập giá trị mới",
        variant: "destructive",
      });
      return;
    }

    if (!requestData.reason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do yêu cầu",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      task: task.id,
      request_type: requestData.request_type,
      current_value: requestData.current_value,
      requested_value: requestData.requested_value,
      reason: requestData.reason,
    });
  };

  const renderValueInput = () => {
    const { request_type } = requestData;

    switch (request_type) {
      case "start_date":
      case "due_date":
        return (
          <DateInput
            value={requestData.requested_value}
            onChange={(value) =>
              setRequestData({ ...requestData, requested_value: value || "" })
            }
            placeholder="dd/mm/yyyy"
          />
        );

      case "priority":
        return (
          <Select
            value={requestData.requested_value}
            onValueChange={(value) =>
              setRequestData({ ...requestData, requested_value: value })
            }>
            <SelectTrigger>
              <SelectValue placeholder="Chọn mức độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "work_group":
        return (
          <Select
            value={requestData.requested_value}
            onValueChange={(value) =>
              setRequestData({ ...requestData, requested_value: value })
            }>
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhóm công việc" />
            </SelectTrigger>
            <SelectContent>
              {WORK_GROUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "description":
        return (
          <Textarea
            value={requestData.requested_value}
            onChange={(e) =>
              setRequestData({ ...requestData, requested_value: e.target.value })
            }
            placeholder="Nhập mô tả mới"
            rows={3}
          />
        );

      default:
        return (
          <Input
            value={requestData.requested_value}
            onChange={(e) =>
              setRequestData({ ...requestData, requested_value: e.target.value })
            }
            placeholder="Nhập giá trị mới"
          />
        );
    }
  };

  const getDisplayValue = (type: string, value: string) => {
    switch (type) {
      case "priority":
        return PRIORITY_OPTIONS.find(opt => opt.value === value)?.label || value;
      case "work_group":
        return WORK_GROUP_OPTIONS.find(opt => opt.value === value)?.label || value;
      case "start_date":
      case "due_date":
        return value ? new Date(value).toLocaleDateString('vi-VN') : "Chưa xác định";
      default:
        return value || "Chưa có";
    }
  };

  // Chỉ hiển thị nút nếu task đã được giao và user là assignee
  if (!task.is_assigned || !task.assigned_to) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Yêu cầu điều chỉnh
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yêu cầu điều chỉnh: {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Yêu cầu sẽ được gửi tới người giao việc để xem xét và phê duyệt.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="request_type">
              Thông tin cần điều chỉnh <span className="text-red-500">*</span>
            </Label>
            <Select
              value={requestData.request_type}
              onValueChange={handleRequestTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thông tin cần điều chỉnh" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requestData.request_type && (
            <>
              <div>
                <Label>Giá trị hiện tại</Label>
                <div className="p-3 bg-gray-50 border rounded-md text-sm">
                  {getDisplayValue(requestData.request_type, requestData.current_value)}
                </div>
              </div>

              <div>
                <Label htmlFor="requested_value">
                  Giá trị mới <span className="text-red-500">*</span>
                </Label>
                {renderValueInput()}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="reason">
              Lý do yêu cầu <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={requestData.reason}
              onChange={(e) =>
                setRequestData({ ...requestData, reason: e.target.value })
              }
              placeholder="Vui lòng giải thích lý do cần thay đổi thông tin này"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createRequestMutation.isPending}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRequestMutation.isPending}
              className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {createRequestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
