import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search,
  ClipboardCheck,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye
} from "lucide-react";
import { REVIEW_TYPE_LABELS, REVIEW_STATUS_LABELS } from "@/lib/constants";

export default function Reviews() {
  const reviews = [
    {
      id: "1",
      workName: "Luận Ngữ",
      type: "expert_review",
      status: "in_progress",
      scheduledDate: "2024-03-20",
      councilName: "Hội đồng thẩm định chuyên gia",
      membersCount: 5,
      evaluationsCompleted: 3,
      overallRating: null,
    },
    {
      id: "2",
      workName: "Đạo Đức Kinh",
      type: "project_acceptance",
      status: "pending",
      scheduledDate: "2024-03-25",
      councilName: "Hội đồng nghiệm thu Dự án",
      membersCount: 7,
      evaluationsCompleted: 0,
      overallRating: null,
    },
    {
      id: "3",
      workName: "Mạnh Tử",
      type: "progress_check",
      status: "completed",
      scheduledDate: "2024-03-10",
      councilName: "Tổ kiểm tra tiến độ",
      membersCount: 3,
      evaluationsCompleted: 3,
      overallRating: 4,
    },
    {
      id: "4",
      workName: "Đại Học",
      type: "trial_review",
      status: "approved",
      scheduledDate: "2024-02-28",
      councilName: "Tổ thẩm định dịch thử",
      membersCount: 3,
      evaluationsCompleted: 3,
      overallRating: 5,
    },
  ];

  const councils = [
    {
      id: "1",
      name: "Hội đồng thẩm định chuyên gia",
      type: "expert_review",
      membersCount: 5,
      activeReviews: 2,
      completedReviews: 8,
    },
    {
      id: "2",
      name: "Hội đồng nghiệm thu Dự án",
      type: "project_acceptance",
      membersCount: 7,
      activeReviews: 1,
      completedReviews: 5,
    },
    {
      id: "3",
      name: "Tổ kiểm tra tiến độ",
      type: "progress_check",
      membersCount: 3,
      activeReviews: 0,
      completedReviews: 12,
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-workflow-draft",
    in_progress: "bg-workflow-in-progress",
    completed: "bg-workflow-completed",
    approved: "bg-workflow-completed",
    rejected: "bg-destructive",
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    in_progress: ClipboardCheck,
    completed: CheckCircle2,
    approved: CheckCircle2,
    rejected: AlertCircle,
  };

  const typeColors: Record<string, string> = {
    trial_review: "bg-chart-1",
    progress_check: "bg-chart-2",
    expert_review: "bg-chart-3",
    project_acceptance: "bg-chart-4",
    proofreading_review: "bg-chart-5",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-reviews">
            Quản lý thẩm định
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổ chức và theo dõi các hoạt động thẩm định, nghiệm thu
          </p>
        </div>
        <Button data-testid="button-add-review" className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo thẩm định
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm thẩm định, tác phẩm, hội đồng..."
            className="pl-10"
            data-testid="input-search-reviews"
          />
        </div>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            Thẩm định
          </TabsTrigger>
          <TabsTrigger value="councils" data-testid="tab-councils">
            Hội đồng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <Clock className="h-4 w-4 text-workflow-draft" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Cần lên lịch</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang tiến hành</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-workflow-in-progress" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Đang thu thập đánh giá</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-workflow-completed" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Tháng này</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ phê duyệt</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">Trong 6 tháng</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {reviews.map((review) => {
              const StatusIcon = statusIcons[review.status];
              
              return (
                <Card 
                  key={review.id} 
                  className="hover-elevate cursor-pointer"
                  data-testid={`review-card-${review.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{review.workName}</h3>
                            <Badge 
                              variant="outline" 
                              className={`${typeColors[review.type]} text-white border-0`}
                            >
                              {REVIEW_TYPE_LABELS[review.type]}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${statusColors[review.status]} text-white border-0`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {REVIEW_STATUS_LABELS[review.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.councilName}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Ngày dự kiến</p>
                            <p className="text-sm font-medium">
                              {new Date(review.scheduledDate).toLocaleDateString("vi-VN")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Thành viên</p>
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-sm font-medium">{review.membersCount}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Đánh giá</p>
                            <p className="text-sm font-medium">
                              {review.evaluationsCompleted}/{review.membersCount}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Điểm TB</p>
                            <p className="text-sm font-medium">
                              {review.overallRating ? `${review.overallRating}/5` : "Chưa có"}
                            </p>
                          </div>
                        </div>

                        {review.status === "in_progress" && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Tiến độ thu thập đánh giá</span>
                              <span className="font-medium">
                                {Math.round((review.evaluationsCompleted / review.membersCount) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all" 
                                style={{ 
                                  width: `${(review.evaluationsCompleted / review.membersCount) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" size="sm" data-testid={`button-view-review-${review.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="councils" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {councils.map((council) => (
              <Card 
                key={council.id} 
                className="hover-elevate cursor-pointer"
                data-testid={`council-card-${council.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-base">{council.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${typeColors[council.type]} text-white border-0 w-fit`}
                  >
                    {REVIEW_TYPE_LABELS[council.type]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Thành viên</span>
                    <span className="font-medium">{council.membersCount} người</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Đang tiến hành</span>
                    <span className="font-medium">{council.activeReviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Đã hoàn thành</span>
                    <span className="font-medium">{council.completedReviews}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
