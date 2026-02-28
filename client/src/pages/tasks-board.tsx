import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type TaskItem = {
  id: string;
  name?: string;
  title?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "normal" | "high" | "urgent";
  dueDate?: string;
  updatedAt?: string;
};

const STATUS_LABELS: Record<TaskItem["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function TasksBoard() {
  const queryClient = useQueryClient();
  const [listId, setListId] = useState<string | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<string | "__ALL__">("__ALL__");
  const [quickCreate, setQuickCreate] = useState<Record<string, string>>({});
  const [changeListOnDrop, setChangeListOnDrop] = useState<boolean>(false);
  const [targetListId, setTargetListId] = useState<string | "__KEEP__">(
    "__KEEP__",
  );
  const [dragging, setDragging] = useState<TaskItem | null>(null);
  const [dragOver, setDragOver] = useState<TaskItem["status"] | null>(null);

  const { data: lists } = useQuery({
    queryKey: ["task-lists"],
    queryFn: () => apiClient.getTaskLists(),
  });

  const { data: users } = useQuery({
    queryKey: ["users-local"],
    queryFn: () => apiClient.getUsersLocal(),
  });

  const {
    data: boardData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["tasks-board", listId, assigneeId],
    queryFn: () => apiClient.getTasksBoard({ listId, assigneeId, limit: 50 }),
  });

  const columns = boardData?.columns || {};
  const statuses: TaskItem["status"][] = [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const moveMutation = useMutation({
    mutationFn: (payload: {
      taskId: string;
      toStatus?: TaskItem["status"];
      toListId?: string;
      newParentId?: string | null;
    }) => apiClient.moveTaskBoard(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
    },
  });
  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      status: TaskItem["status"];
      listId?: string;
    }) => apiClient.createTask(payload as any),
    onSuccess: () => {
      setQuickCreate({});
      queryClient.invalidateQueries({ queryKey: ["tasks-board"] });
    },
  });

  const handleDragStart = (task: TaskItem) => (e: React.DragEvent) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver =
    (status: TaskItem["status"]) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(status);
    };
  const handleDragLeave = () => setDragOver(null);
  const handleDrop = (status: TaskItem["status"]) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    const payload: any = { taskId: dragging.id };
    if (dragging.status !== status) payload.toStatus = status;
    if (changeListOnDrop && targetListId !== "__KEEP__")
      payload.toListId = targetListId;
    moveMutation.mutate(payload);
    setDragging(null);
  };
  const handleDropOnCard = (targetTask: TaskItem) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    if (dragging.id === targetTask.id) return;
    moveMutation.mutate({
      taskId: dragging.id,
      newParentId: targetTask.id,
      toListId:
        changeListOnDrop && targetListId !== "__KEEP__"
          ? (targetListId as string)
          : undefined,
    });
    setDragging(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={listId ?? "__ALL__"}
          onValueChange={(v) => setListId(v === "__ALL__" ? undefined : v)}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Chọn danh sách (list)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Tất cả</SelectItem>
            {(lists || []).map((l) => (
              <SelectItem key={l.id} value={String(l.id)}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={assigneeId}
          onValueChange={(v) => setAssigneeId(v as any)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Lọc theo người phụ trách" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__ALL__">Tất cả</SelectItem>
            {(users || []).map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={changeListOnDrop}
              onChange={(e) => setChangeListOnDrop(e.target.checked)}
            />
            Đổi list khi thả
          </label>
          <Select
            value={targetListId}
            onValueChange={(v) => setTargetListId(v as any)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Chọn list đích" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__KEEP__">Giữ nguyên</SelectItem>
              {(lists || []).map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}>
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")}
          />
          Làm mới
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {statuses.map((st) => {
          const col = columns[st] || { count: 0, items: [] };
          const items = (col.items as any[]).map((raw) => {
            const t: TaskItem = {
              id: raw.id,
              name: raw.name,
              title: raw.name || raw.title,
              status: raw.status,
              priority: raw.priority,
              dueDate: raw.dueDate || raw.due_date,
              updatedAt: raw.updatedAt || raw.updated_at,
            };
            return t;
          });
          return (
            <div
              key={st}
              className={cn(
                "flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4 transition-colors",
                dragOver === st && "ring-2 ring-primary ring-offset-2",
              )}
              onDragOver={handleDragOver(st)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(st)}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">{STATUS_LABELS[st]}</div>
                <Badge variant="secondary">{col.count || items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={handleDragStart(task)}
                    onDrop={handleDropOnCard(task)}
                    className={cn(
                      "cursor-move hover:shadow-md transition-shadow",
                    )}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{task.title}</div>
                        {task.dueDate && (
                          <div className="text-xs text-muted-foreground">
                            Hạn:{" "}
                            {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                        {task.priority && (
                          <Badge
                            className={cn(
                              PRIORITY_COLOR[task.priority] || "",
                              "text-xs",
                            )}>
                            {task.priority}
                          </Badge>
                        )}
                        {/* Assignees avatars - best effort (needs task-assignees enrichment on client later) */}
                        <div className="flex -space-x-2">
                          {/* Placeholder: In bản hiện tại có thể nối API getTaskAssignees(task.id) để lấy danh sách userIds rồi map sang users */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {/* Quick create */}
                <div className="rounded-md border bg-background p-2">
                  <Input
                    placeholder="Tạo nhiệm vụ nhanh…"
                    value={quickCreate[st] || ""}
                    onChange={(e) =>
                      setQuickCreate((s) => ({ ...s, [st]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (quickCreate[st] || "").trim()) {
                        createMutation.mutate({
                          name: (quickCreate[st] || "").trim(),
                          status: st,
                          listId,
                        });
                      }
                    }}
                  />
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!quickCreate[st] || createMutation.isPending}
                      onClick={() => {
                        if ((quickCreate[st] || "").trim()) {
                          createMutation.mutate({
                            name: (quickCreate[st] || "").trim(),
                            status: st,
                            listId,
                          });
                        }
                      }}>
                      Tạo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
