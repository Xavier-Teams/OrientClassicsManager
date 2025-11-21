import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreVertical, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient, WorkTask, CustomGroup } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoardViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}

export default function BoardView({ tasks, isLoading, onTaskUpdate }: BoardViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");
  const [draggedTask, setDraggedTask] = useState<WorkTask | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | string | null>(null);

  // Fetch custom groups
  const { data: customGroupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["custom-groups"],
    queryFn: () => apiClient.getCustomGroups({ page_size: 100 }),
  });

  const customGroups = customGroupsData?.results || [];

  // Create custom group mutation
  const createGroupMutation = useMutation({
    mutationFn: (data: Partial<CustomGroup>) => apiClient.createCustomGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-groups"] });
      toast({
        title: "Thành công",
        description: "Đã tạo nhóm mới",
      });
      setNewGroupName("");
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkTask> }) =>
      apiClient.updateWorkTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật công việc",
      });
    },
  });

  // Group tasks by status (using custom groups if available, otherwise use default status groups)
  const getGroupedTasks = () => {
    if (customGroups.length > 0) {
      const grouped: Record<number, WorkTask[]> = {};
      customGroups.forEach((group) => {
        if (group.status_mapping && group.status_mapping.length > 0) {
          grouped[group.id] = tasks.filter((task) =>
            group.status_mapping!.includes(task.status)
          );
        } else {
          grouped[group.id] = [];
        }
      });
      return grouped;
    } else {
      // Default grouping by status
      const grouped: Record<string, WorkTask[]> = {};
      const statuses = [
        "chua_bat_dau",
        "dang_tien_hanh",
        "hoan_thanh",
        "khong_hoan_thanh",
      ];
      statuses.forEach((status) => {
        grouped[status] = tasks.filter((task) => task.status === status);
      });
      return grouped;
    }
  };

  const groupedTasks = getGroupedTasks();

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên nhóm",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      name: newGroupName,
      color: newGroupColor,
      status_mapping: [],
      is_active: true,
    });
  };

  const handleTaskStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus },
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: WorkTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", task.id.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedTask(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, groupId: number | string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroup(groupId);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroup: CustomGroup | string) => {
    e.preventDefault();
    setDragOverGroup(null);

    if (!draggedTask) return;

    // Determine new status based on target group
    let newStatus: string;
    if (typeof targetGroup === "string") {
      // Default status group
      newStatus = targetGroup;
    } else {
      // Custom group - use first status in mapping or default
      if (targetGroup.status_mapping && targetGroup.status_mapping.length > 0) {
        newStatus = targetGroup.status_mapping[0];
      } else {
        // If no mapping, keep current status or use first available
        newStatus = draggedTask.status;
      }
    }

    // Only update if status changed
    if (draggedTask.status !== newStatus) {
      handleTaskStatusChange(draggedTask.id, newStatus);
    }

    setDraggedTask(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN");
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

  if (isLoading || isLoadingGroups) {
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
                Quản lý nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quản lý nhóm</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tên nhóm mới</Label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Nhập tên nhóm..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Màu sắc</Label>
                  <Input
                    type="color"
                    value={newGroupColor}
                    onChange={(e) => setNewGroupColor(e.target.value)}
                    className="mt-1 h-10"
                  />
                </div>
                <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                  Tạo nhóm mới
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm công việc
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {customGroups.length > 0 ? (
          customGroups.map((group) => {
            const groupTasks = groupedTasks[group.id] || [];
            return (
              <div
                key={group.id}
                className={cn(
                  "flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 transition-colors",
                  dragOverGroup === group.id && "ring-2 ring-primary ring-offset-2"
                )}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h3 className="font-semibold">{group.name}</h3>
                    <Badge variant="secondary">{groupTasks.length}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Sửa nhóm</DropdownMenuItem>
                      <DropdownMenuItem>Xóa nhóm</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-move hover:shadow-md transition-shadow",
                        draggedTask?.id === task.id && "opacity-50"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-medium">{task.title}</div>
                          {task.due_date && (
                            <div className="text-sm text-muted-foreground">
                              Hạn: {formatDate(task.due_date)}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                PRIORITY_COLORS[task.priority] || "",
                                "text-xs"
                              )}
                            >
                              {PRIORITY_LABELS[task.priority] || task.priority}
                            </Badge>
                            {task.assigned_to_name && (
                              <div className="text-xs text-muted-foreground">
                                {task.assigned_to_name}
                              </div>
                            )}
                          </div>
                          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      // Handle add task to group
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm công việc
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          // Default groups if no custom groups
          Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div
              key={status}
              className={cn(
                "flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 transition-colors",
                dragOverGroup === status && "ring-2 ring-primary ring-offset-2"
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {STATUS_LABELS[status] || status}
                  </h3>
                  <Badge variant="secondary">{statusTasks.length}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-move hover:shadow-md transition-shadow",
                      draggedTask?.id === task.id && "opacity-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{task.title}</div>
                        {task.due_date && (
                          <div className="text-sm text-muted-foreground">
                            Hạn: {formatDate(task.due_date)}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              PRIORITY_COLORS[task.priority] || "",
                              "text-xs"
                            )}
                          >
                            {PRIORITY_LABELS[task.priority] || task.priority}
                          </Badge>
                          {task.assigned_to_name && (
                            <div className="text-xs text-muted-foreground">
                              {task.assigned_to_name}
                            </div>
                          )}
                        </div>
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // Handle add task
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm công việc
                </Button>
              </div>
            </div>
          ))
        )}
        <div className="flex-shrink-0 w-80">
          <Button
            variant="outline"
            className="w-full h-32 border-dashed"
            onClick={() => {
              // Handle add new group
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhóm
          </Button>
        </div>
      </div>
    </div>
  );
}

