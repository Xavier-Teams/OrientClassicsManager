import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient, TaskAssignmentRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentRequestsListProps {
  showPendingOnly?: boolean;
  showMyRequests?: boolean;
}

export default function AssignmentRequestsList({ 
  showPendingOnly = false, 
  showMyRequests = false 
}: AssignmentRequestsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<TaskAssignmentRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Fetch requests
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["assignment-requests", { showPendingOnly, showMyRequests }],
    queryFn: () => {
      if (showMyRequests) {
        return apiClient.getMyAssignmentRequests({ page_size: 50 });
      } else if (showPendingOnly) {
        return apiClient.getPendingApprovals({ page_size: 50 });
      } else {
        return apiClient.getAssignmentRequests({ page_size: 50 });
      }
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message?: string }) => 
      apiClient.approveAssignmentRequest(id, message),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assignment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["work-tasks"] });
      toast({
        title: "Thành công",
        description: response.message,
      });
      setSelectedRequest(null);
      setResponseMessage("");
      setActionType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể chấp nhận yêu cầu",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message?: string }) => 
      apiClient.rejectAssignmentRequest(id, message),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assignment-requests"] });
      toast({
        title: "Thành công",
        description: response.message,
      });
      setSelectedRequest(null);
      setResponseMessage("");
      setActionType(null);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể từ chối yêu cầu",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã chấp nhận
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Đã từ chối
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDisplayValue = (type: string, value: string) => {
    switch (type) {
      case "start_date":
      case "due_date":
        return value ? new Date(value).toLocaleDateString('vi-VN') : "Chưa xác định";
      default:
        return value || "Chưa có";
    }
  };

  const handleAction = (request: TaskAssignmentRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setResponseMessage("");
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "approve") {
      approveMutation.mutate({
        id: selectedRequest.id,
        message: responseMessage,
      });
    } else {
      rejectMutation.mutate({
        id: selectedRequest.id,
        message: responseMessage,
      });
    }
  };

  const requests = requestsData?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
          <CardTitle className="text-lg text-gray-600 mb-1">
            {showMyRequests ? "Chưa có yêu cầu nào" : "Không có yêu cầu chờ xử lý"}
          </CardTitle>
          <CardDescription>
            {showMyRequests 
              ? "Bạn chưa gửi yêu cầu điều chỉnh nào"
              : "Tất cả yêu cầu điều chỉnh đã được xử lý"
            }
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {showMyRequests ? "Yêu cầu của tôi" : "Yêu cầu điều chỉnh"}
          </CardTitle>
          <CardDescription>
            {showMyRequests 
              ? "Danh sách yêu cầu điều chỉnh bạn đã gửi"
              : "Danh sách yêu cầu điều chỉnh cần xử lý"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Công việc</TableHead>
                <TableHead>Loại yêu cầu</TableHead>
                <TableHead>Giá trị hiện tại</TableHead>
                <TableHead>Giá trị mới</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{request.task_title}</div>
                      <div className="text-xs text-gray-500">
                        {showMyRequests 
                          ? `Người xử lý: ${request.approver_name}`
                          : `Người yêu cầu: ${request.requester_name}`
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.request_type_display}</TableCell>
                  <TableCell className="text-sm">
                    {getDisplayValue(request.request_type, request.current_value || "")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {getDisplayValue(request.request_type, request.requested_value)}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(request.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Chi tiết yêu cầu</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Công việc</Label>
                              <p className="text-sm">{request.task_title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Loại yêu cầu</Label>
                              <p className="text-sm">{request.request_type_display}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Giá trị hiện tại</Label>
                              <p className="text-sm">{getDisplayValue(request.request_type, request.current_value || "")}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Giá trị mới</Label>
                              <p className="text-sm font-medium">{getDisplayValue(request.request_type, request.requested_value)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Lý do</Label>
                              <p className="text-sm">{request.reason}</p>
                            </div>
                            {request.response_message && (
                              <div>
                                <Label className="text-sm font-medium">Phản hồi</Label>
                                <p className="text-sm">{request.response_message}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-sm font-medium">Trạng thái</Label>
                              <div className="mt-1">{getStatusBadge(request.status)}</div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!showMyRequests && request.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(request, "approve")}
                            className="text-green-600 hover:text-green-700">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(request, "reject")}
                            className="text-red-600 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog 
        open={!!selectedRequest && !!actionType} 
        onOpenChange={() => {
          setSelectedRequest(null);
          setActionType(null);
          setResponseMessage("");
        }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Chấp nhận yêu cầu" : "Từ chối yêu cầu"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">{selectedRequest.task_title}</div>
                  <div className="text-gray-600">
                    {selectedRequest.request_type_display}: {getDisplayValue(selectedRequest.request_type, selectedRequest.requested_value)}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="response">
                  {actionType === "approve" ? "Ghi chú (tùy chọn)" : "Lý do từ chối"}
                </Label>
                <Textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={
                    actionType === "approve" 
                      ? "Ghi chú kèm theo khi chấp nhận..."
                      : "Vui lòng giải thích lý do từ chối..."
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setActionType(null);
                    setResponseMessage("");
                  }}
                  disabled={approveMutation.isPending || rejectMutation.isPending}>
                  Hủy
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  variant={actionType === "approve" ? "default" : "destructive"}
                  className="flex items-center gap-2">
                  {actionType === "approve" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {approveMutation.isPending || rejectMutation.isPending
                    ? "Đang xử lý..."
                    : actionType === "approve" 
                    ? "Chấp nhận" 
                    : "Từ chối"
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
