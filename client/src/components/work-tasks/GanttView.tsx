import { GanttChart as GanttChartIcon } from "lucide-react";
import { WorkTask } from "@/lib/api";

interface GanttViewProps {
  tasks: WorkTask[];
  isLoading: boolean;
  onTaskUpdate?: (task: WorkTask) => void;
}

export default function GanttView({ tasks, isLoading }: GanttViewProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-12 text-muted-foreground">
        <GanttChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Gantt View đang được phát triển</p>
        <p className="text-sm mt-2">
          Sẽ hiển thị timeline của công việc với dependencies và milestones
        </p>
      </div>
    </div>
  );
}

