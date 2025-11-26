import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiClient, WorkTask, User } from "@/lib/api";
import { TaskEvaluationForm } from "./TaskEvaluationForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Star, AlertCircle, CheckCircle, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskActionsProps {
  task: WorkTask;
  users: User[];
  onTaskUpdate?: () => void;
}

export default function TaskActions({ task, users, onTaskUpdate }: TaskActionsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Evaluation dialog state
  const [evalDialogOpen, setEvalDialogOpen] = useState(false);
  
  // Mark completed dialog state
  const [markCompletedDialogOpen, setMarkCompletedDialogOpen] = useState(false);

  const markCompletedMutation = useMutation({
    mutationFn: () => apiClient.markWorkTaskCompleted(task.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Thành công",
        description: response.message,
      });
      setMarkCompletedDialogOpen(false);
      onTaskUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đánh dấu hoàn thành",
        variant: "destructive",
      });
    },
  });

  const canEvaluate = task.can_evaluate && task.status === "hoan_thanh";

  return (
    <div className="flex gap-2">
      {/* Evaluate Task Button */}
      {canEvaluate && (
        <Dialog open={evalDialogOpen} onOpenChange={setEvalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Đánh giá
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Đánh giá công việc</DialogTitle>
              <DialogDescription>
                Đánh giá chất lượng công việc và có thể yêu cầu làm lại nếu cần.
              </DialogDescription>
            </DialogHeader>
            <TaskEvaluationForm
              task={task}
              onSuccess={() => {
                setEvalDialogOpen(false);
                onTaskUpdate?.();
              }}
              onCancel={() => setEvalDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Mark Completed Button */}
      {currentUser && task.assigned_to_ids?.includes(currentUser.id) && task.status !== 'hoan_thanh' && (
        <Dialog open={markCompletedDialogOpen} onOpenChange={setMarkCompletedDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Hoàn thành
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận hoàn thành</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bạn có chắc chắn muốn đánh dấu công việc "{task.title}" là đã hoàn thành?
                  <br /><br />
                  Supervisor sẽ nhận được thông báo để đánh giá chất lượng công việc.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setMarkCompletedDialogOpen(false)}
                  disabled={markCompletedMutation.isPending}>
                  Hủy
                </Button>
                <Button
                  onClick={() => markCompletedMutation.mutate()}
                  disabled={markCompletedMutation.isPending}
                  className="bg-green-600 hover:bg-green-700">
                  {markCompletedMutation.isPending ? "Đang xử lý..." : "Xác nhận hoàn thành"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}