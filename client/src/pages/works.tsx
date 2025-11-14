import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Calendar,
  Clock,
  User,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WORK_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";

type ViewMode = "board" | "list" | "calendar";

export default function Works() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  const boardColumns = [
    {
      id: "draft",
      title: "Dự kiến",
      status: "draft",
      color: "bg-workflow-draft",
      count: 3,
    },
    {
      id: "approved",
      title: "Đã duyệt",
      status: "approved",
      color: "bg-workflow-approved",
      count: 2,
    },
    {
      id: "in_progress",
      title: "Đang dịch",
      status: "in_progress",
      color: "bg-workflow-in-progress",
      count: 5,
    },
    {
      id: "progress_checked",
      title: "Đã kiểm tra TD",
      status: "progress_checked",
      color: "bg-workflow-review",
      count: 3,
    },
    {
      id: "completed",
      title: "Hoàn thành",
      status: "completed",
      color: "bg-workflow-completed",
      count: 4,
    },
  ];

  const mockWorks = {
    draft: [
      {
        id: "1",
        name: "Thi Kinh (Kinh Thi)",
        author: "Khổng Tử biên soạn",
        translator: "Nguyễn Văn A",
        pageCount: 450,
        progress: 0,
        priority: "normal",
        dueDate: "2024-03-30",
      },
      {
        id: "2",
        name: "Thư Kinh (Kinh Thư)",
        author: "Không rõ",
        translator: null,
        pageCount: 380,
        progress: 0,
        priority: "low",
        dueDate: "2024-04-15",
      },
      {
        id: "3",
        name: "Dịch Kinh (Kinh Dịch)",
        author: "Phục Hy",
        translator: null,
        pageCount: 520,
        progress: 0,
        priority: "high",
        dueDate: "2024-03-25",
      },
    ],
    approved: [
      {
        id: "4",
        name: "Lễ Ký",
        author: "Đại Thánh",
        translator: "Trần Thị B",
        pageCount: 320,
        progress: 5,
        priority: "normal",
        dueDate: "2024-04-10",
      },
      {
        id: "5",
        name: "Xuân Thu",
        author: "Khổng Tử",
        translator: "Lê Văn C",
        pageCount: 280,
        progress: 8,
        priority: "high",
        dueDate: "2024-03-28",
      },
    ],
    in_progress: [
      {
        id: "6",
        name: "Luận Ngữ",
        author: "Khổng Tử",
        translator: "Phạm Thị D",
        pageCount: 350,
        progress: 65,
        priority: "high",
        dueDate: "2024-03-20",
      },
      {
        id: "7",
        name: "Mạnh Tử",
        author: "Mạnh Kha",
        translator: "Hoàng Văn E",
        pageCount: 420,
        progress: 45,
        priority: "normal",
        dueDate: "2024-04-05",
      },
      {
        id: "8",
        name: "Đại Học",
        author: "Khổng Cấp",
        translator: "Võ Thị F",
        pageCount: 150,
        progress: 30,
        priority: "urgent",
        dueDate: "2024-03-18",
      },
      {
        id: "9",
        name: "Trung Dung",
        author: "Tử Tư",
        translator: "Đặng Văn G",
        pageCount: 180,
        progress: 55,
        priority: "high",
        dueDate: "2024-03-22",
      },
      {
        id: "10",
        name: "Tôn Tử Binh Pháp",
        author: "Tôn Vũ",
        translator: "Bùi Thị H",
        pageCount: 220,
        progress: 70,
        priority: "normal",
        dueDate: "2024-04-08",
      },
    ],
    progress_checked: [
      {
        id: "11",
        name: "Đạo Đức Kinh",
        author: "Lão Tử",
        translator: "Mai Văn I",
        pageCount: 290,
        progress: 85,
        priority: "high",
        dueDate: "2024-03-15",
      },
      {
        id: "12",
        name: "Trang Tử",
        author: "Trang Chu",
        translator: "Đinh Thị K",
        pageCount: 410,
        progress: 80,
        priority: "normal",
        dueDate: "2024-03-25",
      },
      {
        id: "13",
        name: "Mặc Tử",
        author: "Mặc Địch",
        pageCount: 340,
        translator: "Lý Văn L",
        progress: 88,
        priority: "normal",
        dueDate: "2024-04-01",
      },
    ],
    completed: [
      {
        id: "14",
        name: "Hàn Phi Tử",
        author: "Hàn Phi",
        translator: "Phan Thị M",
        pageCount: 380,
        progress: 100,
        priority: "normal",
        dueDate: "2024-02-28",
      },
      {
        id: "15",
        name: "Tuân Tử",
        author: "Tuân Huống",
        translator: "Tạ Văn N",
        pageCount: 310,
        progress: 100,
        priority: "normal",
        dueDate: "2024-02-15",
      },
      {
        id: "16",
        name: "Liệt Tử",
        author: "Liệt Ngự Khấu",
        translator: "Vũ Thị O",
        pageCount: 260,
        progress: 100,
        priority: "low",
        dueDate: "2024-01-30",
      },
      {
        id: "17",
        name: "Quản Tử",
        author: "Quản Trọng",
        translator: "Dương Văn P",
        pageCount: 330,
        progress: 100,
        priority: "normal",
        dueDate: "2024-02-10",
      },
    ],
  };

  const priorityColors: Record<string, string> = {
    low: "bg-priority-low",
    normal: "bg-priority-normal",
    high: "bg-priority-high",
    urgent: "bg-priority-urgent",
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
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-works">
            Quản lý tác phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý tiến độ dịch thuật các tác phẩm
          </p>
        </div>
        <Button data-testid="button-add-work" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm tác phẩm
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm tác phẩm, tác giả, dịch giả..."
            className="pl-10"
            data-testid="input-search-works"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]" data-testid="select-filter-priority">
            <SelectValue placeholder="Ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="urgent">Khẩn</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="normal">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" data-testid="button-filter">
          <Filter className="h-4 w-4" />
          Lọc
        </Button>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="board" className="gap-2" data-testid="tab-board-view">
            <LayoutGrid className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2" data-testid="tab-list-view">
            <List className="h-4 w-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2" data-testid="tab-calendar-view">
            <Calendar className="h-4 w-4" />
            Lịch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {boardColumns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80" data-testid={`column-${column.id}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary">{column.count}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockWorks[column.status as keyof typeof mockWorks]?.map((work: any) => (
                    <Card 
                      key={work.id} 
                      className="hover-elevate cursor-pointer"
                      data-testid={`work-card-${work.id}`}
                    >
                      <CardHeader className="p-4 space-y-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium leading-tight">{work.name}</h4>
                          {work.priority !== "normal" && (
                            <Badge 
                              variant="outline" 
                              className={`${priorityColors[work.priority]} text-white border-0 shrink-0`}
                            >
                              <div className="flex items-center gap-1">
                                {getPriorityIcon(work.priority)}
                                {PRIORITY_LABELS[work.priority]}
                              </div>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{work.author}</p>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {work.translator || "Chưa gán"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tiến độ</span>
                            <span className="font-medium">{work.progress}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${work.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{work.pageCount} trang</span>
                          <span className={isOverdue(work.dueDate) ? "text-destructive font-medium" : "text-muted-foreground"}>
                            {new Date(work.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover-elevate"
                    data-testid={`button-add-${column.id}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tác phẩm
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-12">
                Chế độ xem danh sách
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-12">
                Chế độ xem lịch
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
