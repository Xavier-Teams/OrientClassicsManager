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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Users as UsersIcon,
  User,
  Edit,
  Eye,
  Power,
  PowerOff,
  Loader2,
  Shield,
} from "lucide-react";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { apiClient, User as ApiUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  canCreateUser,
  canEditUser,
  canManageUserStatus,
  canViewFullUserInfo,
  isAdmin,
  canManageUsers,
  getRoleDisplayName,
} from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type UserFormValues = {
  username: string;
  email: string;
  password?: string;
  password_confirm?: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  bio?: string;
  active?: boolean;
};

// Filter out dich_gia from role options for user management
const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).filter(
  ([key]) => key !== "dich_gia"
);

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check permissions
  useEffect(() => {
    if (currentUser && !canManageUsers(currentUser)) {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang quản trị người dùng",
        variant: "destructive",
      });
      setLocation("/users");
    }
  }, [currentUser, toast, setLocation]);

  const createForm = useForm<UserFormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      role: "thu_ky_hop_phan",
      phone: "",
      bio: "",
      active: true,
    },
  });

  const editForm = useForm<UserFormValues>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "thu_ky_hop_phan",
      phone: "",
      bio: "",
      active: true,
    },
  });

  useEffect(() => {
    if (canManageUsers(currentUser)) {
      loadUsers();
    }
  }, [currentUser]);

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

  const handleCreateUser = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      await apiClient.createUser({
        username: data.username,
        email: data.email,
        password: data.password!,
        password_confirm: data.password_confirm!,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone,
        bio: data.bio,
        active: data.active ?? true,
      });
      toast({
        title: "Thành công",
        description: "Tạo người dùng thành công",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      loadUsers();
    } catch (error: any) {
      console.error("Failed to create user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data: UserFormValues) => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      const updateData: Partial<ApiUser> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        role: data.role,
        active: data.active,
      };

      await apiClient.updateUser(selectedUser.id, updateData);
      toast({
        title: "Thành công",
        description: "Cập nhật người dùng thành công",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
      loadUsers();
    } catch (error: any) {
      console.error("Failed to update user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật người dùng",
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
    setSelectedUser(user);
    // Split full_name into first_name and last_name
    const nameParts = user.full_name?.split(' ') || [];
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || '';
    
    editForm.reset({
      username: user.username,
      email: user.email,
      first_name: user.first_name || firstName,
      last_name: user.last_name || lastName,
      role: user.role,
      phone: user.phone || "",
      bio: user.bio || "",
      active: user.active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleActivate = async (user: ApiUser) => {
    try {
      await apiClient.activateUser(user.id);
      toast({
        title: "Thành công",
        description: "Kích hoạt người dùng thành công",
      });
      loadUsers();
    } catch (error: any) {
      console.error("Failed to activate user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể kích hoạt người dùng",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (user: ApiUser) => {
    try {
      await apiClient.deactivateUser(user.id);
      toast({
        title: "Thành công",
        description: "Vô hiệu hóa người dùng thành công",
      });
      loadUsers();
    } catch (error: any) {
      console.error("Failed to deactivate user:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể vô hiệu hóa người dùng",
        variant: "destructive",
      });
    }
  };

  // Don't render if user doesn't have permission
  if (currentUser && !canManageUsers(currentUser)) {
    return null;
  }

  const activeUsersCount = users.filter((u) => u.active !== false).length;
  const inactiveUsersCount = users.filter((u) => u.active === false).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-admin-users">
              Quản trị người dùng
            </h1>
          </div>
          <p className="text-muted-foreground">
            Quản lý tài khoản, phân quyền và trạng thái người dùng
          </p>
        </div>
        <Button
          data-testid="button-add-user"
          className="gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
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

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã vô hiệu hóa</CardTitle>
            <User className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsersCount}</div>
            <p className="text-xs text-muted-foreground">Người dùng đã vô hiệu hóa</p>
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
            filteredUsers.map((user) => (
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
                          {user.active === false && (
                            <Badge variant="outline" className="bg-gray-500 text-white">
                              Đã vô hiệu hóa
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          {user.phone && <span>• {user.phone}</span>}
                        </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Sửa
                      </Button>
                      {user.active !== false ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(user)}
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          Vô hiệu hóa
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(user)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          Kích hoạt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng mới cho hệ thống
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateUser)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  rules={{ required: "Tên đăng nhập là bắt buộc" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
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
                        <Input type="email" {...field} placeholder="email@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="password"
                  rules={{ required: "Mật khẩu là bắt buộc", minLength: 8 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password_confirm"
                  rules={{
                    required: "Xác nhận mật khẩu là bắt buộc",
                    validate: (value) =>
                      value === createForm.getValues("password") ||
                      "Mật khẩu xác nhận không khớp",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
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
                  control={createForm.control}
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
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLE_OPTIONS.map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiểu sử</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Thông tin về người dùng..."
                        rows={3}
                      />
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
                    setIsCreateDialogOpen(false);
                    createForm.reset();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo người dùng
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>Không thể thay đổi tên đăng nhập</FormDescription>
                    </FormItem>
                  )}
                />
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
              </div>

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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLE_OPTIONS.map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                      <FormDescription>
                        Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
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
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => selectedUser && handleEditClick(selectedUser)}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

