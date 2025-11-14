import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Users as UsersIcon, User } from "lucide-react";
import { USER_ROLE_LABELS } from "@/lib/constants";

export default function Users() {
  const users = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      role: "chu_nhiem",
      status: "active",
      worksCount: 5,
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      role: "pho_chu_nhiem",
      status: "active",
      worksCount: 3,
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "levanc@example.com",
      role: "bien_tap_vien",
      status: "active",
      worksCount: 8,
    },
    {
      id: "4",
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      role: "dich_gia",
      status: "active",
      worksCount: 12,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-users">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và phân quyền
          </p>
        </div>
        <Button data-testid="button-add-user" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <UsersIcon className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+5 tháng này</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dịch giả</CardTitle>
            <User className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biên tập viên</CardTitle>
            <User className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyên gia</CardTitle>
            <User className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className="hover-elevate cursor-pointer"
            data-testid={`user-card-${user.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatar-${user.id}.png`} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge variant="secondary">
                        {USER_ROLE_LABELS[user.role]}
                      </Badge>
                      {user.status === "active" && (
                        <Badge variant="outline" className="bg-workflow-completed text-white border-0">
                          Hoạt động
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tác phẩm</p>
                    <p className="text-lg font-semibold">{user.worksCount}</p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
