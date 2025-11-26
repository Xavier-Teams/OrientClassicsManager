import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiClient, WorkTask, User } from "@/lib/api";
import { 
  UserPlus, 
  MessageSquare, 
  Bell,
  Star,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import WorkTaskForm from "@/components/work-tasks/WorkTaskForm";
import TaskActions from "@/components/work-tasks/TaskActions";
import AssignmentRequestForm from "@/components/work-tasks/AssignmentRequestForm";
import AssignmentRequestsList from "@/components/work-tasks/AssignmentRequestsList";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AssignmentDemo() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch work tasks
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["work-tasks"],
    queryFn: () => apiClient.getWorkTasks({ page_size: 50 }),
  });

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiClient.getUsers({ page_size: 100 });
        setUsers(response.results);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    loadUsers();
  }, []);

  const tasks = tasksData?.results || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hoan_thanh":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "dang_tien_hanh":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Đang tiến hành
          </Badge>
        );
      case "chua_bat_dau":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Calendar className="h-3 w-3 mr-1" />
            Chưa bắt đầu
          </Badge>
        );
      case "cham_tien_do":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Chậm tiến độ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "rat_cao":
        return <Badge variant="destructive">Rất cao</Badge>;
      case "cao":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cao</Badge>;
      case "trung_binh":
        return <Badge variant="outline">Trung bình</Badge>;
      case "thap":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Thấp</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demo Chức năng Giao việc</h1>
            <p className="text-gray-600 mt-1">
              Quản lý công việc với tính năng giao việc, giám sát và đánh giá
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <Button onClick={() => setFormOpen(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Tạo công việc mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Đã giao việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.is_assigned).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Có đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.supervisor_rating).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === "hoan_thanh").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Danh sách công việc
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Yêu cầu điều chỉnh
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Yêu cầu của tôi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách công việc</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Đang tải...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ưu tiên</TableHead>
                        <TableHead>Người được giao</TableHead>
                        <TableHead>Người giám sát</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-gray-500">
                                {task.is_assigned && (
                                  <Badge variant="outline" className="text-xs">
                                    Đã giao việc
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>
                            {task.assigned_to_name ? (
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{task.assigned_to_name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Chưa giao</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.supervisor_name ? (
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-blue-400" />
                                <span className="text-sm">{task.supervisor_name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Chưa có</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.supervisor_rating ? (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= task.supervisor_rating!
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm ml-1">
                                  ({task.supervisor_rating}/5)
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Chưa đánh giá</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setFormOpen(true);
                                }}>
                                Sửa
                              </Button>
                              
                              <TaskActions 
                                task={task} 
                                users={users}
                                onTaskUpdate={refetchTasks}
                              />
                              
                              {task.is_assigned && task.assigned_to === user?.id && (
                                <AssignmentRequestForm 
                                  task={task}
                                  onRequestCreated={refetchTasks}
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <AssignmentRequestsList showPendingOnly={true} />
          </TabsContent>

          <TabsContent value="my-requests">
            <AssignmentRequestsList showMyRequests={true} />
          </TabsContent>
        </Tabs>

        {/* Task Form Dialog */}
        <WorkTaskForm
          task={selectedTask}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setSelectedTask(null);
            }
          }}
          onSuccess={() => {
            refetchTasks();
          }}
        />
      </div>
    </div>
  );
}
