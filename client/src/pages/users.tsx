"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Users as UsersIcon,
  User,
  Edit,
  Eye,
  Loader2,
  Shield,
} from "lucide-react";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { apiClient, User as ApiUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  canEditUser,
  canViewFullUserInfo,
  getRoleDisplayName,
  canManageUsers,
} from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UserFormValues = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editForm = useForm<UserFormValues>({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      bio: "",
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.results);
      setFilteredUsers(response.results);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (data: UserFormValues) => {
    if (!selectedUser || !currentUser) return;

    // Only allow editing own profile
    if (selectedUser.id !== currentUser.id) {
      toast({
        title: "Lỗi",
        description: "Bạn chỉ có thể chỉnh sửa thông tin của chính mình",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData: Partial<ApiUser> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
      };

      await apiClient.updateUser(selectedUser.id, updateData);
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
      loadUsers();
      // Reload current user info
      const updatedUser = await apiClient.getCurrentUser();
      // Update auth context if needed
    } catch (error: any) {
      console.error("Failed to update user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = async (user: ApiUser) => {
    try {
      const fullUser = await apiClient.getUser(user.id);
      setSelectedUser(fullUser);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load user details:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (user: ApiUser) => {
    // Only allow editing own profile
    if (!currentUser || user.id !== currentUser.id) {
      toast({
        title: "Thông báo",
        description: "Bạn chỉ có thể chỉnh sửa thông tin của chính mình",
      });
      return;
    }

    setSelectedUser(user);
    // Split full_name into first_name and last_name
    const nameParts = user.full_name?.split(' ') || [];
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || '';
    
    editForm.reset({
      email: user.email,
      first_name: user.first_name || firstName,
      last_name: user.last_name || lastName,
      phone: user.phone || "",
      bio: user.bio || "",
    });
    setIsEditDialogOpen(true);
  };

  const activeUsersCount = users.filter((u) => u.active !== false).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-users">
            Người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem thông tin người dùng và quản lý tài khoản của bạn
          </p>
        </div>
        {canManageUsers(currentUser) && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation("/admin/users")}
          >
            <Shield className="h-4 w-4" />
            Quản trị người dùng
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="pl-10"
            data-testid="input-search-users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <UsersIcon className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsersCount} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <User className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => {
              const canEdit = canEditUser(currentUser, user.id);
              const canViewFull = canViewFullUserInfo(currentUser, user.id);
              const isOwnProfile = user.id === currentUser?.id;

              return (
                <Card
                  key={user.id}
                  className="hover-elevate"
                  data-testid={`user-card-${user.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.full_name} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{user.full_name}</h3>
                            <Badge variant="secondary">
                              {getRoleDisplayName(user.role as any)}
                            </Badge>
                            {user.active !== false && (
                              <Badge
                                variant="outline"
                                className="bg-workflow-completed text-white border-0"
                              >
                                Hoạt động
                              </Badge>
                            )}
                            {isOwnProfile && (
                              <Badge variant="outline">Tài khoản của tôi</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            {canViewFull && user.phone && (
                              <span>• {user.phone}</span>
                            )}
                          </div>
                          {!canViewFull && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Chỉ hiển thị thông tin cơ bản
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Button>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Edit User Dialog - Only for own profile */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin của bạn
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditUser)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="first_name"
                  rules={{ required: "Họ và tên đệm là bắt buộc" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên đệm</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nguyễn Văn" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="last_name"
                  rules={{ required: "Tên là bắt buộc" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="email"
                rules={{
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiểu sử</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                    editForm.reset();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
                  <p className="text-base">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
              </div>
              {canViewFullUserInfo(currentUser, selectedUser.id) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tên đăng nhập
                      </p>
                      <p className="text-base">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vai trò</p>
                      <p className="text-base">
                        {getRoleDisplayName(selectedUser.role as any)}
                      </p>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="text-base">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.bio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tiểu sử</p>
                      <p className="text-base whitespace-pre-wrap">{selectedUser.bio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Trạng thái
                      </p>
                      <Badge
                        variant={selectedUser.active !== false ? "default" : "secondary"}
                      >
                        {selectedUser.active !== false ? "Hoạt động" : "Đã vô hiệu hóa"}
                      </Badge>
                    </div>
                    {selectedUser.created_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Ngày tạo
                        </p>
                        <p className="text-base">
                          {new Date(selectedUser.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedUser &&
              canEditUser(currentUser, selectedUser.id) && (
                <Button onClick={() => handleEditClick(selectedUser)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
