import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkTask } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}

export default function CalendarView({ tasks, isLoading }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  // Get days after month to fill the grid
  const totalCells = 42; // 6 weeks * 7 days
  const daysAfterMonth = Array.from({ length: totalCells - daysInMonth.length - daysBeforeMonth.length }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...daysBeforeMonth, ...daysInMonth, ...daysAfterMonth];

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date && !task.start_date) return false;
      const taskDate = task.due_date ? new Date(task.due_date) : new Date(task.start_date!);
      return isSameDay(taskDate, date);
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
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

  const PRIORITY_COLORS: Record<string, string> = {
    thap: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    trung_binh: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    cao: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    rat_cao: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentDate(new Date())}
        >
          Hôm nay
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {allDays.map((day, idx) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] border-r border-b p-2 cursor-pointer transition-colors",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isCurrentDay && "bg-primary/10",
                  isSelected && "ring-2 ring-primary",
                  "hover:bg-muted/50"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isCurrentDay && "text-primary font-bold"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "text-xs p-1 rounded truncate",
                        STATUS_COLORS[task.status] || "bg-gray-100 text-gray-800"
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length - 3} công việc khác
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Công việc ngày {format(selectedDate, "dd/MM/yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                Đóng
              </Button>
            </div>
            {selectedDateTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Không có công việc nào trong ngày này
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map((task) => (
                  <Card key={task.id} className="p-3">
                    <div className="space-y-2">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={cn(
                            STATUS_COLORS[task.status] || "",
                            "text-xs"
                          )}
                        >
                          {task.status}
                        </Badge>
                        <Badge
                          className={cn(
                            PRIORITY_COLORS[task.priority] || "",
                            "text-xs"
                          )}
                        >
                          {task.priority}
                        </Badge>
                        {task.assigned_to_name && (
                          <span className="text-xs text-muted-foreground">
                            {task.assigned_to_name}
                          </span>
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
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
