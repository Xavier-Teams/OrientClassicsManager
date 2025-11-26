import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { apiClient, WorkTask, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssigneeEditorProps {
  task: WorkTask;
  users: User[];
  onUpdate?: () => void;
}

export default function AssigneeEditor({ task, users, onUpdate }: AssigneeEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(task.assigned_to_ids || []);
  const [searchValue, setSearchValue] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (assigneeIds: number[]) => {
      // Update task with new assignees
      return apiClient.updateWorkTask(task.id, {
        ...task,
        assigned_to: assigneeIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật người được giao việc",
      });
      setOpen(false);
      onUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật người được giao việc",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(selectedUserIds);
  };

  const handleCancel = () => {
    setSelectedUserIds(task.assigned_to_ids || []);
    setOpen(false);
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
  const assignedUsers = users.filter(user => task.assigned_to_ids?.includes(user.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 justify-start text-left font-normal"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {assignedUsers.length > 0 ? (
              assignedUsers.map(user => (
                <Badge key={user.id} variant="secondary" className="text-xs">
                  {user.full_name || user.username}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Chưa giao
              </span>
            )}
            <Plus className="h-3 w-3 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm kiếm người dùng..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredUsers.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => toggleUser(user.id)}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  selectedUserIds.includes(user.id)
                    ? "bg-primary text-primary-foreground"
                    : "opacity-50 [&_svg]:invisible"
                )}>
                  <Check className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.full_name || user.username}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        
        <div className="border-t p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Đã chọn: {selectedUserIds.length} người
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="h-3 w-3" />
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Check className="h-3 w-3" />
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
