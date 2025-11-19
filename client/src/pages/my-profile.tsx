"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Edit,
  Save,
  X,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  Building2,
  MapPin,
  Contact,
  GraduationCap,
  FileText,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDisplayName } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";

type ProfileFormValues = {
  // Thông tin cá nhân
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  // Thông tin công việc (có thể mở rộng sau)
  username?: string;
};

export default function MyProfile() {
  const { user: currentUser, setUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(currentUser);
  const [activeTab, setActiveTab] = useState("work_info");

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      bio: "",
      username: "",
    },
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      form.reset({
        email: currentUser.email || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        phone: currentUser.phone || "",
        bio: currentUser.bio || "",
        username: currentUser.username || "",
      });
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const user = await apiClient.getCurrentUser();
      setUserData(user);
      form.reset({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        username: user.username || "",
      });
    } catch (error) {
      console.error("Failed to load user profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      form.reset({
        email: userData.email || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        username: userData.username || "",
      });
    }
  };

  const handleSave = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const updatedUser = await apiClient.updateProfile({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
      });
      
      setUserData(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công",
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Không thể tải thông tin hồ sơ
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý thông tin cá nhân của bạn
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={userData.avatar || `/avatar-${userData.id}.png`}
                alt={userData.full_name}
              />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{userData.full_name}</h2>
                {userData.is_superuser && (
                  <Badge variant="default" className="bg-primary">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                {userData.role ? getRoleDisplayName(userData.role as any) : "Chưa có vai trò"}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {userData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userData.email}
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {userData.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
          <CardDescription>
            {isEditing
              ? "Cập nhật thông tin của bạn"
              : "Xem thông tin chi tiết của bạn"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="work_info" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Hồ sơ công việc
              </TabsTrigger>
              <TabsTrigger value="personal_info" className="gap-2">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Hồ sơ công việc */}
            <TabsContent value="work_info" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Thông tin công việc
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên đăng nhập</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={true}
                                placeholder="username"
                                readOnly
                              />
                            </FormControl>
                            <FormDescription>
                              Tên đăng nhập không thể thay đổi
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
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
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email công việc
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                disabled={!isEditing}
                                placeholder="email@example.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Số điện thoại công việc
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="0123456789"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tiểu sử / Giới thiệu
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={!isEditing}
                              rows={4}
                              placeholder="Giới thiệu về bản thân và công việc của bạn..."
                            />
                          </FormControl>
                          <FormDescription>
                            Mô tả ngắn gọn về bản thân, kinh nghiệm và công việc của bạn
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Thông tin hệ thống */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Thông tin hệ thống
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Vai trò
                        </p>
                        <p className="text-base">
                          {userData.role ? getRoleDisplayName(userData.role as any) : "Chưa có vai trò"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Trạng thái
                        </p>
                        <div>
                          {userData.active !== false ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              Đã vô hiệu hóa
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Ngày tham gia
                        </p>
                        <p className="text-base">
                          {userData.created_at
                            ? new Date(userData.created_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                      {userData.last_login && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Đăng nhập lần cuối
                          </p>
                          <p className="text-base">
                            {new Date(userData.last_login).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </TabsContent>

            {/* Tab 2: Thông tin cá nhân */}
            <TabsContent value="personal_info" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin cơ bản
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        rules={{ required: "Họ và tên đệm là bắt buộc" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và tên đệm</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="Nguyễn Văn"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        rules={{ required: "Tên là bắt buộc" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="A"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email cá nhân
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                disabled={!isEditing}
                                placeholder="email@example.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Số điện thoại cá nhân
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="0123456789"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Thông tin liên hệ */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Contact className="h-5 w-5" />
                      Thông tin liên hệ
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Email công việc
                        </p>
                        <div className="flex items-center gap-2 text-base">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {userData.email || "Chưa có"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Số điện thoại công việc
                        </p>
                        <div className="flex items-center gap-2 text-base">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {userData.phone || "Chưa có"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin bổ sung */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Thông tin bổ sung
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiểu sử</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={!isEditing}
                              rows={5}
                              placeholder="Giới thiệu về bản thân, sở thích, kinh nghiệm..."
                            />
                          </FormControl>
                          <FormDescription>
                            Mô tả về bản thân, sở thích, kinh nghiệm sống và làm việc
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
