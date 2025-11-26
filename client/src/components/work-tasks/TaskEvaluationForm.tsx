import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkTask, apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskEvaluationFormProps {
  task: WorkTask;
  onSuccess?: (result: { task: WorkTask; redo_task?: WorkTask }) => void;
  onCancel?: () => void;
}

export function TaskEvaluationForm({ task, onSuccess, onCancel }: TaskEvaluationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    require_redo: false,
    redo_reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const evaluateMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string; require_redo?: boolean; redo_reason?: string }) =>
      apiClient.evaluateWorkTask(task.id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["work-task", task.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      if (result.redo_task) {
        toast({ 
          title: "Đánh giá thành công", 
          description: `Đã đánh giá ${formData.rating} sao và tạo công việc làm lại #${result.redo_task.id}` 
        });
      } else {
        toast({ 
          title: "Đánh giá thành công", 
          description: `Đã đánh giá công việc "${task.title}" với ${formData.rating} sao` 
        });
      }
      
      onSuccess?.(result);
    },
    onError: (error: any) => {
      toast({ 
        title: "Lỗi", 
        description: error.message || "Không thể đánh giá công việc.", 
        variant: "destructive" 
      });
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.rating === 0) {
      newErrors.rating = "Vui lòng chọn số sao đánh giá.";
    }
    
    if (formData.require_redo && !formData.redo_reason.trim()) {
      newErrors.redo_reason = "Vui lòng nhập lý do yêu cầu làm lại.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    evaluateMutation.mutate({
      rating: formData.rating,
      comment: formData.comment || undefined,
      require_redo: formData.require_redo,
      redo_reason: formData.require_redo ? formData.redo_reason : undefined,
    });
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
    setErrors({ ...errors, rating: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Thông tin công việc</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Tên:</strong> {task.title}</p>
          <p><strong>Người thực hiện:</strong> {task.assigned_to_name}</p>
          <p><strong>Ngày hoàn thành:</strong> {task.completed_date ? new Date(task.completed_date).toLocaleDateString("vi-VN") : "N/A"}</p>
          {task.is_redo && (
            <p><strong>Làm lại từ:</strong> {task.original_task_title} (Lần {task.redo_count})</p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="text-base font-medium">
          Đánh giá chất lượng <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center space-x-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-8 w-8 cursor-pointer transition-colors",
                formData.rating >= star 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-gray-300 hover:text-yellow-200"
              )}
              onClick={() => handleStarClick(star)}
            />
          ))}
          {formData.rating > 0 && (
            <span className="ml-3 text-sm font-medium">
              {formData.rating} sao
            </span>
          )}
        </div>
        {errors.rating && <p className="text-sm text-red-500 mt-1">{errors.rating}</p>}
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment" className="text-base font-medium">
          Bình luận đánh giá
        </Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Nhập bình luận về chất lượng công việc (tùy chọn)..."
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Require Redo */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="require_redo"
            checked={formData.require_redo}
            onCheckedChange={(checked) => 
              setFormData({ 
                ...formData, 
                require_redo: !!checked,
                redo_reason: !!checked ? formData.redo_reason : ""
              })
            }
          />
          <Label htmlFor="require_redo" className="text-base font-medium cursor-pointer">
            Yêu cầu làm lại công việc
          </Label>
        </div>

        {formData.require_redo && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Khi yêu cầu làm lại, một công việc mới sẽ được tạo và giao lại cho người thực hiện.
            </AlertDescription>
          </Alert>
        )}

        {formData.require_redo && (
          <div>
            <Label htmlFor="redo_reason" className="text-base font-medium">
              Lý do yêu cầu làm lại <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="redo_reason"
              value={formData.redo_reason}
              onChange={(e) => setFormData({ ...formData, redo_reason: e.target.value })}
              placeholder="Nhập lý do tại sao công việc cần được làm lại..."
              rows={3}
              className={cn("mt-2", errors.redo_reason ? "border-red-500" : "")}
            />
            {errors.redo_reason && <p className="text-sm text-red-500 mt-1">{errors.redo_reason}</p>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={evaluateMutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={evaluateMutation.isPending}
          className={cn(
            formData.require_redo 
              ? "bg-orange-600 hover:bg-orange-700" 
              : "bg-green-600 hover:bg-green-700"
          )}
        >
          {evaluateMutation.isPending 
            ? "Đang xử lý..." 
            : formData.require_redo 
              ? "Đánh giá & Yêu cầu làm lại" 
              : "Hoàn thành đánh giá"
          }
        </Button>
      </div>
    </form>
  );
}
