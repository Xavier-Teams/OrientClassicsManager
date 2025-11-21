import { List, LayoutGrid, Calendar, GanttChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewType = "list" | "board" | "calendar" | "gantt";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const VIEWS: Array<{ type: ViewType; label: string; icon: typeof List }> = [
  { type: "list", label: "List", icon: List },
  { type: "board", label: "Board", icon: LayoutGrid },
  { type: "calendar", label: "Calendar", icon: Calendar },
  { type: "gantt", label: "Gantt", icon: GanttChart },
];

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {VIEWS.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.type}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(view.type)}
            className={cn(
              "rounded-none border-b-2 border-transparent px-4 py-2",
              currentView === view.type
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {view.label}
          </Button>
        );
      })}
    </div>
  );
}

