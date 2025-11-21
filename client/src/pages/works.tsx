import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertCircle,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  WORK_STATUS_LABELS,
  PRIORITY_LABELS,
  mapPriorityFromDjango,
} from "@/lib/constants";
import { apiClient, Work, WorkBoardResponse, User as ApiUser, Translator } from "@/lib/api";
import { WorkForm } from "@/components/works/WorkForm";
import { WorkDetailModal } from "@/components/works/WorkDetailModal";
import { TranslatorInfoModal } from "@/components/translators/TranslatorInfoModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  canCreateWork,
  canEditWork,
  canDeleteWork,
  canApproveWork,
  canUpdateProgress,
} from "@/lib/permissions";

type ViewMode = "board" | "list" | "calendar";

export default function Works() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTranslator, setSelectedTranslator] = useState<Work["translator_details"] | null>(null);
  const [translatorModalOpen, setTranslatorModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Board view preferences - visible statuses
  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("works_board_visible_statuses");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          // If parsing fails, return default (all statuses)
        }
      }
    }
    // Default: all statuses visible
    return new Set([
      "draft",
      "approved",
      "translator_assigned",
      "trial_translation",
      "trial_reviewed",
      "contract_signed",
      "in_progress",
      "progress_checked",
      "final_translation",
      "expert_reviewed",
      "project_accepted",
      "completed",
      "cancelled",
    ]);
  });

  // Temporary selections in popover (before applying)
  const [tempVisibleStatuses, setTempVisibleStatuses] =
    useState<Set<string>>(visibleStatuses);

  // Control popover open/close state
  const [viewPreferencesOpen, setViewPreferencesOpen] = useState(false);

  // Sync tempVisibleStatuses when visibleStatuses changes externally or when popover opens
  useEffect(() => {
    if (viewPreferencesOpen) {
      setTempVisibleStatuses(new Set(visibleStatuses));
    }
  }, [visibleStatuses, viewPreferencesOpen]);

  // List view column preferences
  const allListColumns = [
    { id: "name", label: "Tên tác phẩm", sortable: true },
    { id: "author", label: "Tác giả", sortable: true },
    { id: "translator", label: "Dịch giả", sortable: true },
    { id: "translation_part", label: "Hợp phần", sortable: false },
    { id: "stage", label: "Giai đoạn", sortable: false },
    { id: "state", label: "Trạng thái", sortable: true },
    { id: "priority", label: "Ưu tiên", sortable: true },
    { id: "progress", label: "Tiến độ", sortable: true },
    { id: "created_at", label: "Ngày tạo", sortable: false },
  ];

  const [visibleListColumns, setVisibleListColumns] = useState<Set<string>>(
    () => {
      // Load from localStorage on mount
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("works_list_visible_columns");
        if (saved) {
          try {
            return new Set(JSON.parse(saved));
          } catch (e) {
            // If parsing fails, return default (all columns)
          }
        }
      }
      // Default: all columns visible
      return new Set(allListColumns.map((col) => col.id));
    }
  );

  // Temporary selections in popover (before applying)
  const [tempVisibleListColumns, setTempVisibleListColumns] =
    useState<Set<string>>(visibleListColumns);

  // Control list view preferences popover open/close state
  const [listViewPreferencesOpen, setListViewPreferencesOpen] = useState(false);

  // Sync tempVisibleListColumns when visibleListColumns changes externally or when popover opens
  useEffect(() => {
    if (listViewPreferencesOpen) {
      setTempVisibleListColumns(new Set(visibleListColumns));
    }
  }, [visibleListColumns, listViewPreferencesOpen]);

  // Modal states
  const [workFormOpen, setWorkFormOpen] = useState(false);
  const [workDetailOpen, setWorkDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);

  // Fetch works board data
  const {
    data: boardData,
    isLoading,
    error,
  } = useQuery<WorkBoardResponse>({
    queryKey: ["works", "board"],
    queryFn: () => apiClient.getWorksBoard(),
  });

  // Fetch translators and translation parts for form
  const { data: translatorsData } = useQuery<{
    count: number;
    results: Translator[];
  }>({
    queryKey: ["translators"],
    queryFn: () => apiClient.getTranslators({ active: true }),
    enabled: workFormOpen, // Only fetch when form is open
  });

  const { data: translationParts } = useQuery<
    Array<{ id: number; name: string; code: string }>
  >({
    queryKey: ["translationParts"],
    queryFn: () => apiClient.getTranslationParts(),
    // Always fetch to use in filter dropdown
  });

  const { data: stages } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiClient.getStages(),
    enabled: workFormOpen, // Only fetch when form is open
  });

  // Mutations
  const createWorkMutation = useMutation({
    mutationFn: (data: any) => apiClient.createWork(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      setWorkFormOpen(false);
      toast({
        title: "Thành công",
        description: "Đã tạo tác phẩm mới",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo tác phẩm",
        variant: "destructive",
      });
    },
  });

  const updateWorkMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.updateWork(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      setWorkFormOpen(false);
      setSelectedWork(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật tác phẩm",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật tác phẩm",
        variant: "destructive",
      });
    },
  });

  const deleteWorkMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      setDeleteDialogOpen(false);
      setWorkToDelete(null);
      toast({
        title: "Thành công",
        description: "Đã xóa tác phẩm",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tác phẩm",
        variant: "destructive",
      });
    },
  });

  const approveWorkMutation = useMutation({
    mutationFn: (id: number) => apiClient.approveWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast({
        title: "Thành công",
        description: "Đã duyệt tác phẩm",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể duyệt tác phẩm",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreateWork = () => {
    setSelectedWork(null);
    setWorkFormOpen(true);
  };

  const handleEditWork = (work: Work) => {
    setSelectedWork(work);
    setWorkFormOpen(true);
  };

  const handleViewWork = (work: Work) => {
    setSelectedWork(work);
    setWorkDetailOpen(true);
  };

  const handleDeleteWork = (work: Work) => {
    setWorkToDelete(work);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workToDelete) {
      deleteWorkMutation.mutate(workToDelete.id);
    }
  };

  const handleApproveWork = (work: Work) => {
    approveWorkMutation.mutate(work.id);
  };

  const handleFormSubmit = async (data: any) => {
    // Transform form data to match backend API format
    const apiData: any = {
      name: data.name,
      name_original: data.name_original || "",
      author: data.author || "",
      source_language: data.source_language,
      target_language: data.target_language,
      page_count: data.page_count || 0,
      word_count: data.word_count || 0,
      description: data.description || "",
      state: data.state,
      priority: data.priority,
      translation_progress: data.translation_progress || 0,
      notes: data.notes || "",
    };

    // Map translation_part_id to translation_part (backend expects FK, not _id)
    if (data.translation_part_id != null) {
      apiData.translation_part = data.translation_part_id;
    } else {
      apiData.translation_part = null;
    }

    // Map translator_id to translator (backend expects FK, not _id)
    if (data.translator_id != null) {
      apiData.translator = data.translator_id;
    } else {
      apiData.translator = null;
    }

    // Map stage_id to stage (backend expects FK, not _id)
    if (data.stage_id != null) {
      apiData.stage = data.stage_id;
    } else {
      apiData.stage = null;
    }

    if (selectedWork) {
      // Update
      await updateWorkMutation.mutateAsync({
        id: selectedWork.id,
        data: apiData,
      });
    } else {
      // Create
      await createWorkMutation.mutateAsync(apiData);
    }
  };

  // All available board columns
  const allBoardColumns = [
    {
      id: "draft",
      title: "Dự kiến",
      status: "draft",
      color: "bg-workflow-draft",
    },
    {
      id: "approved",
      title: "Đã duyệt",
      status: "approved",
      color: "bg-workflow-approved",
    },
    {
      id: "translator_assigned",
      title: "Đã gán dịch giả",
      status: "translator_assigned",
      color: "bg-workflow-approved",
    },
    {
      id: "trial_translation",
      title: "Dịch thử",
      status: "trial_translation",
      color: "bg-workflow-in-progress",
    },
    {
      id: "trial_reviewed",
      title: "Đã thẩm định dịch thử",
      status: "trial_reviewed",
      color: "bg-workflow-review",
    },
    {
      id: "contract_signed",
      title: "Đã ký hợp đồng",
      status: "contract_signed",
      color: "bg-workflow-approved",
    },
    {
      id: "in_progress",
      title: "Đang dịch",
      status: "in_progress",
      color: "bg-workflow-in-progress",
    },
    {
      id: "progress_checked",
      title: "Đã kiểm tra tiến độ",
      status: "progress_checked",
      color: "bg-workflow-review",
    },
    {
      id: "final_translation",
      title: "Dịch hoàn thiện",
      status: "final_translation",
      color: "bg-workflow-in-progress",
    },
    {
      id: "expert_reviewed",
      title: "Đã thẩm định chuyên gia",
      status: "expert_reviewed",
      color: "bg-workflow-review",
    },
    {
      id: "project_accepted",
      title: "Đã nghiệm thu Dự án",
      status: "project_accepted",
      color: "bg-workflow-approved",
    },
    {
      id: "completed",
      title: "Hoàn thành",
      status: "completed",
      color: "bg-workflow-completed",
    },
    {
      id: "cancelled",
      title: "Đã hủy",
      status: "cancelled",
      color: "bg-destructive/20",
    },
  ];

  // Filter board columns based on visible statuses
  const boardColumns = allBoardColumns.filter((column) =>
    visibleStatuses.has(column.status)
  );

  // Handle toggle status visibility (temporary in popover)
  const toggleStatusVisibility = (status: string) => {
    setTempVisibleStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  // Handle select all / deselect all (temporary)
  const handleSelectAllStatuses = () => {
    setTempVisibleStatuses(new Set(allBoardColumns.map((col) => col.status)));
  };

  const handleDeselectAllStatuses = () => {
    setTempVisibleStatuses(new Set());
  };

  // Apply view preferences
  const handleApplyViewPreferences = () => {
    // Validate: must have at least one status selected
    if (tempVisibleStatuses.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một trạng thái để hiển thị",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "works_board_visible_statuses",
        JSON.stringify(Array.from(tempVisibleStatuses))
      );
    }

    // Update visible statuses - this will trigger boardColumns recalculation
    setVisibleStatuses(new Set(tempVisibleStatuses));

    // Invalidate and refetch board data
    queryClient.invalidateQueries({ queryKey: ["works", "board"] });

    // Close popover
    setViewPreferencesOpen(false);

    toast({
      title: "Thành công",
      description: "Đã áp dụng tùy chọn hiển thị",
    });
  };

  // Reset to saved preferences
  const handleResetViewPreferences = () => {
    setTempVisibleStatuses(new Set(visibleStatuses));
  };

  // List view column visibility handlers
  const toggleListColumnVisibility = (columnId: string) => {
    setTempVisibleListColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const handleSelectAllListColumns = () => {
    setTempVisibleListColumns(new Set(allListColumns.map((col) => col.id)));
  };

  const handleDeselectAllListColumns = () => {
    setTempVisibleListColumns(new Set());
  };

  // Apply list view column preferences
  const handleApplyListViewPreferences = () => {
    // Validate: must have at least one column selected (excluding actions)
    if (tempVisibleListColumns.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một cột để hiển thị",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "works_list_visible_columns",
        JSON.stringify(Array.from(tempVisibleListColumns))
      );
    }

    // Update visible columns
    setVisibleListColumns(new Set(tempVisibleListColumns));

    // Close popover
    setListViewPreferencesOpen(false);

    toast({
      title: "Thành công",
      description: "Đã áp dụng tùy chọn hiển thị",
    });
  };

  // Reset list view preferences
  const handleResetListViewPreferences = () => {
    setTempVisibleListColumns(new Set(visibleListColumns));
  };

  // Get works for each column from API data
  const getWorksForStatus = (status: string): Work[] => {
    if (!boardData) return [];
    return boardData[status] || [];
  };

  const priorityColors: Record<string, string> = {
    low: "bg-priority-low",
    normal: "bg-priority-normal",
    high: "bg-priority-high",
    urgent: "bg-priority-urgent",
    // Support Django priority format
    "0": "bg-priority-normal",
    "1": "bg-priority-high",
    "2": "bg-priority-urgent",
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-3 w-3" />;
      case "high":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Filter works by search, priority, and status
  const filterWorks = (works: Work[]): Work[] => {
    let filtered = works;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (work) =>
          work.name.toLowerCase().includes(query) ||
          work.author?.toLowerCase().includes(query) ||
          work.translator_name?.toLowerCase().includes(query)
      );
    }

    if (selectedPriority !== "all") {
      // Map frontend priority to Django priority for filtering
      const djangoPriority =
        selectedPriority === "normal"
          ? "0"
          : selectedPriority === "high"
          ? "1"
          : selectedPriority === "urgent"
          ? "2"
          : selectedPriority;
      filtered = filtered.filter(
        (work) =>
          work.priority === djangoPriority || work.priority === selectedPriority
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((work) => work.state === selectedStatus);
    }

    if (selectedPart !== "all") {
      // Filter by translation_part_id (can be number or string)
      filtered = filtered.filter((work) => {
        const workPartId = work.translation_part;
        if (!workPartId) return false;
        // Handle both number and string IDs
        const partId =
          typeof workPartId === "number" ? workPartId : parseInt(workPartId);
        return partId.toString() === selectedPart;
      });
    }

    return filtered;
  };

  // Sort works by column
  const sortWorks = (works: Work[]): Work[] => {
    if (!sortColumn) return works;

    const sorted = [...works].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "author":
          aValue = (a.author || "").toLowerCase();
          bValue = (b.author || "").toLowerCase();
          break;
        case "translator":
          aValue = (a.translator_name || "").toLowerCase();
          bValue = (b.translator_name || "").toLowerCase();
          break;
        case "state":
          aValue = WORK_STATUS_LABELS[a.state] || a.state;
          bValue = WORK_STATUS_LABELS[b.state] || b.state;
          break;
        case "priority":
          // Convert priority to numeric for sorting (0=normal, 1=high, 2=urgent)
          const priorityMap: Record<string, number> = {
            "0": 0,
            "1": 1,
            "2": 2,
            normal: 0,
            high: 1,
            urgent: 2,
            low: 0,
          };
          aValue = priorityMap[a.priority] ?? 0;
          bValue = priorityMap[b.priority] ?? 0;
          break;
        case "progress":
          aValue = a.translation_progress || 0;
          bValue = b.translation_progress || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          Lỗi khi tải dữ liệu:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="heading-works">
            Quản lý dịch thuật
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý tiến độ dịch thuật các tác phẩm
          </p>
        </div>
        {canCreateWork(user) && (
          <Button
            data-testid="button-add-work"
            className="gap-2"
            onClick={handleCreateWork}>
            <Plus className="h-4 w-4" />
            Thêm tác phẩm
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm tác phẩm, tác giả, dịch giả..."
            className="pl-10"
            data-testid="input-search-works"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger
            className="w-[200px]"
            data-testid="select-filter-status">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Dự kiến</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="translator_assigned">Đã gán dịch giả</SelectItem>
            <SelectItem value="trial_translation">Dịch thử</SelectItem>
            <SelectItem value="trial_reviewed">
              Đã thẩm định dịch thử
            </SelectItem>
            <SelectItem value="contract_signed">Đã ký hợp đồng</SelectItem>
            <SelectItem value="in_progress">Đang dịch</SelectItem>
            <SelectItem value="progress_checked">
              Đã kiểm tra tiến độ
            </SelectItem>
            <SelectItem value="final_translation">Dịch hoàn thiện</SelectItem>
            <SelectItem value="expert_reviewed">
              Đã thẩm định chuyên gia
            </SelectItem>
            <SelectItem value="project_accepted">
              Đã nghiệm thu Dự án
            </SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPart} onValueChange={setSelectedPart}>
          <SelectTrigger className="w-[250px]" data-testid="select-filter-part">
            <SelectValue placeholder="Hợp phần" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hợp phần</SelectItem>
            {translationParts?.map((part) => (
              <SelectItem key={part.id} value={part.id.toString()}>
                {part.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger
            className="w-[180px]"
            data-testid="select-filter-priority">
            <SelectValue placeholder="Ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            <SelectItem value="urgent">Khẩn</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="normal">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
        {(selectedStatus !== "all" ||
          selectedPriority !== "all" ||
          selectedPart !== "all" ||
          searchQuery) && (
          <Button
            variant="outline"
            className="gap-2"
            data-testid="button-clear-filters"
            onClick={() => {
              setSelectedStatus("all");
              setSelectedPriority("all");
              setSelectedPart("all");
              setSearchQuery("");
            }}>
            <Filter className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger
              value="board"
              className="gap-2"
              data-testid="tab-board-view">
              <LayoutGrid className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="gap-2"
              data-testid="tab-list-view">
              <List className="h-4 w-4" />
              Danh sách
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="gap-2"
              data-testid="tab-calendar-view">
              <CalendarIcon className="h-4 w-4" />
              Lịch
            </TabsTrigger>
          </TabsList>

          {viewMode === "board" && (
            <Popover
              open={viewPreferencesOpen}
              onOpenChange={setViewPreferencesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Tùy chọn hiển thị
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Hiển thị trạng thái</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleSelectAllStatuses}>
                        Chọn tất cả
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleDeselectAllStatuses}>
                        Bỏ chọn tất cả
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {allBoardColumns.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${column.status}`}
                          checked={tempVisibleStatuses.has(column.status)}
                          onCheckedChange={() =>
                            toggleStatusVisibility(column.status)
                          }
                        />
                        <Label
                          htmlFor={`status-${column.status}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full ${column.color}`}
                          />
                          {column.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetViewPreferences}
                      className="flex-1">
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyViewPreferences}
                      className="flex-1"
                      disabled={tempVisibleStatuses.size === 0}>
                      Áp dụng
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tempVisibleStatuses.size === 0 && (
                      <span className="text-destructive">
                        Vui lòng chọn ít nhất một trạng thái để hiển thị
                      </span>
                    )}
                    {tempVisibleStatuses.size > 0 && (
                      <span>Đã chọn {tempVisibleStatuses.size} trạng thái</span>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <TabsContent value="board" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {boardColumns.map((column) => {
                const works = filterWorks(getWorksForStatus(column.status));
                return (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-80"
                    data-testid={`column-${column.id}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${column.color}`}
                        />
                        <h3 className="font-semibold">{column.title}</h3>
                        <Badge variant="secondary">{works.length}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {works.map((work: Work) => (
                        <Card
                          key={work.id}
                          className="hover-elevate"
                          data-testid={`work-card-${work.id}`}>
                          <CardHeader className="p-4 space-y-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4
                                className="font-medium leading-tight cursor-pointer hover:text-primary"
                                onClick={() => handleViewWork(work)}>
                                {work.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {work.priority !== "normal" &&
                                  work.priority !== "0" && (
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        priorityColors[work.priority] ||
                                        priorityColors[
                                          mapPriorityFromDjango(work.priority)
                                        ]
                                      } text-white border-0 shrink-0`}>
                                      <div className="flex items-center gap-1">
                                        {getPriorityIcon(
                                          mapPriorityFromDjango(work.priority)
                                        )}
                                        {PRIORITY_LABELS[
                                          mapPriorityFromDjango(
                                            work.priority
                                          ) as keyof typeof PRIORITY_LABELS
                                        ] || work.priority}
                                      </div>
                                    </Badge>
                                  )}
                                {(canEditWork(user, work) ||
                                  canDeleteWork(user) ||
                                  canApproveWork(user)) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleViewWork(work)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Xem chi tiết
                                      </DropdownMenuItem>
                                      {canEditWork(user, work) && (
                                        <DropdownMenuItem
                                          onClick={() => handleEditWork(work)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Chỉnh sửa
                                        </DropdownMenuItem>
                                      )}
                                      {work.state === "draft" &&
                                        canApproveWork(user) && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleApproveWork(work)
                                            }>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Duyệt
                                          </DropdownMenuItem>
                                        )}
                                      {canDeleteWork(user) && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() =>
                                              handleDeleteWork(work)
                                            }>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Xóa
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {work.author || "Không rõ"}
                            </p>
                            {(work.translation_part_name || work.stage_name) && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {work.translation_part_name && (
                                  <span>Hợp phần: {work.translation_part_name}</span>
                                )}
                                {work.translation_part_name && work.stage_name && (
                                  <span>•</span>
                                )}
                                {work.stage_name && (
                                  <span>Giai đoạn: {work.stage_name}</span>
                                )}
                              </div>
                            )}
                          </CardHeader>

                          <CardContent className="p-4 pt-0 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {work.translator_name ? (
                                <button
                                  onClick={() => {
                                    if (work.translator_details) {
                                      setSelectedTranslator(work.translator_details);
                                      setTranslatorModalOpen(true);
                                    }
                                  }}
                                  className="text-primary hover:underline cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                                  title="Xem thông tin dịch giả"
                                >
                                  {work.translator_name}
                                </button>
                              ) : (
                                <span className="text-muted-foreground">Chưa gán</span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Tiến độ
                                </span>
                                <span className="font-medium">
                                  {work.translation_progress}%
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{
                                    width: `${work.translation_progress}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {work.page_count} trang
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(work.created_at).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {canCreateWork(user) && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover-elevate"
                          data-testid={`button-add-${column.id}`}
                          onClick={() => {
                            setSelectedWork(null);
                            setWorkFormOpen(true);
                          }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm tác phẩm
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {viewMode === "list" && (
            <div className="flex items-center justify-end mb-4">
              <Popover
                open={listViewPreferencesOpen}
                onOpenChange={setListViewPreferencesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Tùy chọn hiển thị
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Hiển thị cột</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleSelectAllListColumns}>
                          Chọn tất cả
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleDeselectAllListColumns}>
                          Bỏ chọn tất cả
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {allListColumns.map((column) => (
                        <div
                          key={column.id}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`column-${column.id}`}
                            checked={tempVisibleListColumns.has(column.id)}
                            onCheckedChange={() =>
                              toggleListColumnVisibility(column.id)
                            }
                          />
                          <Label
                            htmlFor={`column-${column.id}`}
                            className="text-sm font-normal cursor-pointer flex items-center gap-2 flex-1">
                            {column.label}
                            {column.sortable && (
                              <span className="text-xs text-muted-foreground">
                                (sắp xếp)
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetListViewPreferences}
                        className="flex-1">
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyListViewPreferences}
                        className="flex-1"
                        disabled={tempVisibleListColumns.size === 0}>
                        Áp dụng
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tempVisibleListColumns.size === 0 && (
                        <span className="text-destructive">
                          Vui lòng chọn ít nhất một cột để hiển thị
                        </span>
                      )}
                      {tempVisibleListColumns.size > 0 && (
                        <span>Đã chọn {tempVisibleListColumns.size} cột</span>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleListColumns.has("name") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("name")}>
                            Tên tác phẩm
                            {getSortIcon("name")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("author") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("author")}>
                            Tác giả
                            {getSortIcon("author")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("translator") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("translator")}>
                            Dịch giả
                            {getSortIcon("translator")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("translation_part") && (
                        <TableHead>Hợp phần</TableHead>
                      )}
                      {visibleListColumns.has("stage") && (
                        <TableHead>Giai đoạn</TableHead>
                      )}
                      {visibleListColumns.has("state") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("state")}>
                            Trạng thái
                            {getSortIcon("state")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("priority") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("priority")}>
                            Ưu tiên
                            {getSortIcon("priority")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("progress") && (
                        <TableHead>
                          <button
                            className="flex items-center hover:text-primary transition-colors"
                            onClick={() => handleSort("progress")}>
                            Tiến độ
                            {getSortIcon("progress")}
                          </button>
                        </TableHead>
                      )}
                      {visibleListColumns.has("created_at") && (
                        <TableHead>Ngày tạo</TableHead>
                      )}
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Get all works from board data
                      const allWorks: Work[] = [];
                      if (boardData) {
                        Object.values(boardData).forEach((works) => {
                          allWorks.push(...works);
                        });
                      }
                      const filteredWorks = filterWorks(allWorks);
                      const sortedWorks = sortWorks(filteredWorks);

                      if (sortedWorks.length === 0) {
                        // Calculate colSpan: visible columns + actions column
                        const colSpan = visibleListColumns.size + 1;
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={colSpan}
                              className="text-center py-12 text-muted-foreground">
                              Không có tác phẩm nào
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return sortedWorks.map((work) => (
                        <TableRow key={work.id} className="hover:bg-muted/50">
                          {visibleListColumns.has("name") && (
                            <TableCell className="font-medium">
                              <div
                                className="cursor-pointer hover:text-primary"
                                onClick={() => handleViewWork(work)}>
                                {work.name}
                              </div>
                              {work.name_original && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {work.name_original}
                                </div>
                              )}
                            </TableCell>
                          )}
                          {visibleListColumns.has("author") && (
                            <TableCell>{work.author || "—"}</TableCell>
                          )}
                          {visibleListColumns.has("translator") && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {work.translator_name ? (
                                  <>
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {work.translator_name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <button
                                      onClick={() => {
                                        if (work.translator_details) {
                                          setSelectedTranslator(work.translator_details);
                                          setTranslatorModalOpen(true);
                                        }
                                      }}
                                      className="text-sm text-primary hover:underline cursor-pointer"
                                      title="Xem thông tin dịch giả"
                                    >
                                      {work.translator_name}
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Chưa gán
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          )}
                          {visibleListColumns.has("translation_part") && (
                            <TableCell>
                              {work.translation_part_name || (
                                <span className="text-muted-foreground text-sm">
                                  Chưa gán
                                </span>
                              )}
                            </TableCell>
                          )}
                          {visibleListColumns.has("stage") && (
                            <TableCell>
                              {work.stage_name || (
                                <span className="text-muted-foreground text-sm">
                                  Chưa gán
                                </span>
                              )}
                            </TableCell>
                          )}
                          {visibleListColumns.has("state") && (
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  priorityColors[work.state] ||
                                  "bg-workflow-draft"
                                }>
                                {WORK_STATUS_LABELS[
                                  work.state as keyof typeof WORK_STATUS_LABELS
                                ] || work.state}
                              </Badge>
                            </TableCell>
                          )}
                          {visibleListColumns.has("priority") && (
                            <TableCell>
                              {work.priority !== "normal" &&
                              work.priority !== "0" ? (
                                <Badge
                                  variant="outline"
                                  className={`${
                                    priorityColors[work.priority] ||
                                    priorityColors[
                                      mapPriorityFromDjango(work.priority)
                                    ]
                                  } text-white border-0`}>
                                  <div className="flex items-center gap-1">
                                    {getPriorityIcon(
                                      mapPriorityFromDjango(work.priority)
                                    )}
                                    {PRIORITY_LABELS[
                                      mapPriorityFromDjango(
                                        work.priority
                                      ) as keyof typeof PRIORITY_LABELS
                                    ] || work.priority}
                                  </div>
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  {PRIORITY_LABELS[
                                    mapPriorityFromDjango(
                                      work.priority
                                    ) as keyof typeof PRIORITY_LABELS
                                  ] || "Bình thường"}
                                </span>
                              )}
                            </TableCell>
                          )}
                          {visibleListColumns.has("progress") && (
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      {work.translation_progress}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{
                                        width: `${work.translation_progress}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {visibleListColumns.has("created_at") && (
                            <TableCell>
                              <div className="text-sm">
                                {new Date(work.created_at).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            {(canEditWork(user, work) ||
                              canDeleteWork(user) ||
                              canApproveWork(user)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewWork(work)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem chi tiết
                                  </DropdownMenuItem>
                                  {canEditWork(user, work) && (
                                    <DropdownMenuItem
                                      onClick={() => handleEditWork(work)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                  )}
                                  {work.state === "draft" &&
                                    canApproveWork(user) && (
                                      <DropdownMenuItem
                                        onClick={() => handleApproveWork(work)}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Duyệt
                                      </DropdownMenuItem>
                                    )}
                                  {canDeleteWork(user) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleDeleteWork(work)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Xóa
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Lịch</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasWorks: (() => {
                        if (!boardData) return [];
                        const allWorks: Work[] = [];
                        Object.values(boardData).forEach((works) => {
                          allWorks.push(...works);
                        });
                        // Get unique dates
                        const dates = new Set<string>();
                        allWorks.forEach((work) => {
                          const date = new Date(work.created_at);
                          const dateStr = `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}-${String(date.getDate()).padStart(
                            2,
                            "0"
                          )}`;
                          dates.add(dateStr);
                        });
                        return Array.from(dates).map((dateStr) => {
                          const [year, month, day] = dateStr
                            .split("-")
                            .map(Number);
                          return new Date(year, month - 1, day);
                        });
                      })(),
                    }}
                    modifiersClassNames={{
                      hasWorks: "bg-primary/10 text-primary font-semibold",
                    }}
                  />
                </CardContent>
              </Card>

              {/* Works for selected date */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedDate
                        ? `Tác phẩm ngày ${selectedDate.toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}`
                        : "Chọn ngày để xem tác phẩm"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      if (!selectedDate) {
                        return (
                          <div className="text-center text-muted-foreground py-12">
                            Vui lòng chọn một ngày trên lịch để xem các tác phẩm
                          </div>
                        );
                      }

                      // Get all works from board data
                      const allWorks: Work[] = [];
                      if (boardData) {
                        Object.values(boardData).forEach((works) => {
                          allWorks.push(...works);
                        });
                      }

                      // Filter works by selected date
                      const selectedDateStr = selectedDate
                        .toISOString()
                        .split("T")[0];
                      const worksForDate = allWorks.filter((work) => {
                        const workDate = new Date(work.created_at)
                          .toISOString()
                          .split("T")[0];
                        return workDate === selectedDateStr;
                      });

                      const filteredWorks = filterWorks(worksForDate);

                      if (filteredWorks.length === 0) {
                        return (
                          <div className="text-center text-muted-foreground py-12">
                            Không có tác phẩm nào trong ngày này
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {filteredWorks.map((work) => (
                            <Card
                              key={work.id}
                              className="hover-elevate cursor-pointer"
                              onClick={() => handleViewWork(work)}>
                              <CardHeader className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium leading-tight mb-1">
                                      {work.name}
                                    </h4>
                                    {work.name_original && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {work.name_original}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      {work.author && (
                                        <span>Tác giả: {work.author}</span>
                                      )}
                                      {work.translator_name && (
                                        <span className="flex items-center gap-1">
                                          <User className="h-3.5 w-3.5" />
                                          {work.translator_name}
                                        </span>
                                      )}
                                    </div>
                                    {(work.translation_part_name || work.stage_name) && (
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                        {work.translation_part_name && (
                                          <span>Hợp phần: {work.translation_part_name}</span>
                                        )}
                                        {work.stage_name && (
                                          <span>Giai đoạn: {work.stage_name}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        priorityColors[work.state] ||
                                        "bg-workflow-draft"
                                      }>
                                      {WORK_STATUS_LABELS[
                                        work.state as keyof typeof WORK_STATUS_LABELS
                                      ] || work.state}
                                    </Badge>
                                    {work.priority !== "normal" &&
                                      work.priority !== "0" && (
                                        <Badge
                                          variant="outline"
                                          className={`${
                                            priorityColors[work.priority] ||
                                            priorityColors[
                                              mapPriorityFromDjango(
                                                work.priority
                                              )
                                            ]
                                          } text-white border-0`}>
                                          <div className="flex items-center gap-1">
                                            {getPriorityIcon(
                                              mapPriorityFromDjango(
                                                work.priority
                                              )
                                            )}
                                            {PRIORITY_LABELS[
                                              mapPriorityFromDjango(
                                                work.priority
                                              ) as keyof typeof PRIORITY_LABELS
                                            ] || work.priority}
                                          </div>
                                        </Badge>
                                      )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      Tiến độ
                                    </span>
                                    <span className="font-medium">
                                      {work.translation_progress}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{
                                        width: `${work.translation_progress}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{work.page_count} trang</span>
                                    <span>
                                      {new Date(
                                        work.created_at
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Work Form Modal */}
      <WorkForm
        open={workFormOpen}
        onOpenChange={setWorkFormOpen}
        work={selectedWork}
        translators={translatorsData?.results || []}
        translationParts={translationParts || []}
        stages={stages || []}
        onSubmit={handleFormSubmit}
        isLoading={createWorkMutation.isPending || updateWorkMutation.isPending}
      />

      {/* Work Detail Modal */}
      <WorkDetailModal
        open={workDetailOpen}
        onOpenChange={setWorkDetailOpen}
        work={selectedWork}
      />

      {/* Translator Info Modal */}
      <TranslatorInfoModal
        translator={selectedTranslator}
        open={translatorModalOpen}
        onOpenChange={setTranslatorModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tác phẩm "{workToDelete?.name}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteWorkMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
