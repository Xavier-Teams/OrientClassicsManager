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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  User,
  Edit,
  Eye,
  Power,
  PowerOff,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import { apiClient, Translator } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { canManageTranslators } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type TranslatorFormValues = {
  first_name: string;
  last_name: string;
  id_card_number?: string;
  id_card_issue_date?: string;
  id_card_issue_place?: string;
  workplace?: string;
  address?: string;
  phone?: string;
  email?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  tax_code?: string;
  active?: boolean;
};

export default function Translators() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [filteredTranslators, setFilteredTranslators] = useState<Translator[]>([]);
  const [selectedTranslator, setSelectedTranslator] = useState<Translator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<TranslatorFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      id_card_number: "",
      id_card_issue_date: "",
      id_card_issue_place: "",
      workplace: "",
      address: "",
      phone: "",
      email: "",
      bank_account_number: "",
      bank_name: "",
      bank_branch: "",
      tax_code: "",
      active: true,
    },
  });

  const editForm = useForm<TranslatorFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      id_card_number: "",
      id_card_issue_date: "",
      id_card_issue_place: "",
      workplace: "",
      address: "",
      phone: "",
      email: "",
      bank_account_number: "",
      bank_name: "",
      bank_branch: "",
      tax_code: "",
      active: true,
    },
  });

  useEffect(() => {
    if (canManageTranslators(currentUser)) {
      loadTranslators();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = translators.filter(
        (t) =>
          t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id_card_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTranslators(filtered);
    } else {
      setFilteredTranslators(translators);
    }
  }, [searchQuery, translators]);

  const loadTranslators = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTranslators();
      setTranslators(response.results);
      setFilteredTranslators(response.results);
    } catch (error) {
      console.error("Failed to load translators:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch giả",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTranslator = async (data: TranslatorFormValues) => {
    try {
      setIsSubmitting(true);
      await apiClient.createTranslator({
        first_name: data.first_name,
        last_name: data.last_name,
        id_card_number: data.id_card_number || undefined,
        id_card_issue_date: data.id_card_issue_date || undefined,
        id_card_issue_place: data.id_card_issue_place || undefined,
        workplace: data.workplace || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        bank_account_number: data.bank_account_number || undefined,
        bank_name: data.bank_name || undefined,
        bank_branch: data.bank_branch || undefined,
        tax_code: data.tax_code || undefined,
        active: data.active ?? true,
      });
      toast({
        title: "Thành công",
        description: "Tạo dịch giả thành công",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      loadTranslators();
    } catch (error: any) {
      console.error("Failed to create translator:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo dịch giả",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTranslator = async (data: TranslatorFormValues) => {
    if (!selectedTranslator) return;

    try {
      setIsSubmitting(true);
      const updateData: Partial<Translator> = {
        first_name: data.first_name,
        last_name: data.last_name,
        id_card_number: data.id_card_number || undefined,
        id_card_issue_date: data.id_card_issue_date || undefined,
        id_card_issue_place: data.id_card_issue_place || undefined,
        workplace: data.workplace || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        bank_account_number: data.bank_account_number || undefined,
        bank_name: data.bank_name || undefined,
        bank_branch: data.bank_branch || undefined,
        tax_code: data.tax_code || undefined,
        active: data.active,
      };

      await apiClient.updateTranslator(selectedTranslator.id, updateData);
      toast({
        title: "Thành công",
        description: "Cập nhật dịch giả thành công",
      });
      setIsEditDialogOpen(false);
      setSelectedTranslator(null);
      editForm.reset();
      loadTranslators();
    } catch (error: any) {
      console.error("Failed to update translator:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật dịch giả",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTranslator = async (translator: Translator) => {
    try {
      const fullTranslator = await apiClient.getTranslator(translator.id);
      setSelectedTranslator(fullTranslator);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load translator details:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin dịch giả",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (translator: Translator) => {
    setSelectedTranslator(translator);
    editForm.reset({
      first_name: translator.first_name || "",
      last_name: translator.last_name || "",
      id_card_number: translator.id_card_number || "",
      id_card_issue_date: translator.id_card_issue_date || "",
      id_card_issue_place: translator.id_card_issue_place || "",
      workplace: translator.workplace || "",
      address: translator.address || "",
      phone: translator.phone || "",
      email: translator.email || "",
      bank_account_number: translator.bank_account_number || "",
      bank_name: translator.bank_name || "",
      bank_branch: translator.bank_branch || "",
      tax_code: translator.tax_code || "",
      active: translator.active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteTranslator = async (translator: Translator) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dịch giả "${translator.full_name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteTranslator(translator.id);
      toast({
        title: "Thành công",
        description: "Xóa dịch giả thành công",
      });
      loadTranslators();
    } catch (error: any) {
      console.error("Failed to delete translator:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa dịch giả",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (translator: Translator) => {
    try {
      await apiClient.activateTranslator(translator.id);
      toast({
        title: "Thành công",
        description: "Kích hoạt dịch giả thành công",
      });
      loadTranslators();
    } catch (error: any) {
      console.error("Failed to activate translator:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể kích hoạt dịch giả",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (translator: Translator) => {
    try {
      await apiClient.deactivateTranslator(translator.id);
      toast({
        title: "Thành công",
        description: "Vô hiệu hóa dịch giả thành công",
      });
      loadTranslators();
    } catch (error: any) {
      console.error("Failed to deactivate translator:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể vô hiệu hóa dịch giả",
        variant: "destructive",
      });
    }
  };

  // Don't render if user doesn't have permission
  if (currentUser && !canManageTranslators(currentUser)) {
    return null;
  }

  const activeTranslatorsCount = translators.filter((t) => t.active !== false).length;
  const inactiveTranslatorsCount = translators.filter((t) => t.active === false).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-translators">
              Danh sách dịch giả
            </h1>
          </div>
          <p className="text-muted-foreground">
            Quản lý thông tin dịch giả để sử dụng trong hợp đồng và biểu mẫu
          </p>
        </div>
        <Button
          data-testid="button-add-translator"
          className="gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Thêm dịch giả
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm dịch giả..."
            className="pl-10"
            data-testid="input-search-translators"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng dịch giả</CardTitle>
            <User className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translators.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeTranslatorsCount} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <User className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTranslatorsCount}</div>
            <p className="text-xs text-muted-foreground">Dịch giả đang hoạt động</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã vô hiệu hóa</CardTitle>
            <User className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveTranslatorsCount}</div>
            <p className="text-xs text-muted-foreground">Dịch giả đã vô hiệu hóa</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTranslators.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy dịch giả nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredTranslators.map((translator) => (
              <Card
                key={translator.id}
                className="hover-elevate"
                data-testid={`translator-card-${translator.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/avatar-translator-${translator.id}.png`} alt={translator.full_name} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{translator.full_name}</h3>
                          {translator.active !== false && (
                            <Badge
                              variant="outline"
                              className="bg-workflow-completed text-white border-0"
                            >
                              Hoạt động
                            </Badge>
                          )}
                          {translator.active === false && (
                            <Badge variant="outline" className="bg-gray-500 text-white">
                              Đã vô hiệu hóa
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {translator.email && <span>{translator.email}</span>}
                          {translator.phone && <span>• {translator.phone}</span>}
                          {translator.id_card_number && <span>• CMND/CCCD: {translator.id_card_number}</span>}
                        </div>
                        {translator.workplace && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {translator.workplace}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTranslator(translator)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(translator)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Sửa
                      </Button>
                      {translator.active === false ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(translator)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          Kích hoạt
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(translator)}
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          Vô hiệu hóa
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTranslator(translator)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Translator Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm dịch giả mới</DialogTitle>
            <DialogDescription>
              Tạo thông tin dịch giả mới để sử dụng trong hợp đồng và biểu mẫu
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateTranslator)}
              className="space-y-4"
            >
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="id_card_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số CMND/CCCD</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="001234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="id_card_issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày cấp</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="id_card_issue_place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nơi cấp</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Công an TP. Hà Nội" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="workplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nơi công tác</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Trường Đại học..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Số nhà, đường, phường, quận, thành phố" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                  name="email"
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tài khoản</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên ngân hàng</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vietcombank" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="bank_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi nhánh</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Chi nhánh Hà Nội" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="tax_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế TNCN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0123456789" />
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
                  Tạo dịch giả
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Translator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch giả</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin dịch giả
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditTranslator)}
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="id_card_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số CMND/CCCD</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="001234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="id_card_issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày cấp</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="id_card_issue_place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nơi cấp</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Công an TP. Hà Nội" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="workplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nơi công tác</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Trường Đại học..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Số nhà, đường, phường, quận, thành phố" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="email"
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tài khoản</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên ngân hàng</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vietcombank" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="bank_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi nhánh</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Chi nhánh Hà Nội" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="tax_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế TNCN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0123456789" />
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
                    setSelectedTranslator(null);
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

      {/* View Translator Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin dịch giả</DialogTitle>
            <DialogDescription>
              Chi tiết thông tin dịch giả
            </DialogDescription>
          </DialogHeader>
          {selectedTranslator && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/avatar-translator-${selectedTranslator.id}.png`}
                    alt={selectedTranslator.full_name}
                  />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedTranslator.full_name}
                  </h3>
                  {selectedTranslator.active !== false && (
                    <Badge
                      variant="outline"
                      className="bg-workflow-completed text-white border-0 mt-2"
                    >
                      Hoạt động
                    </Badge>
                  )}
                  {selectedTranslator.active === false && (
                    <Badge variant="outline" className="bg-gray-500 text-white mt-2">
                      Đã vô hiệu hóa
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Họ và tên đệm</p>
                  <p className="text-base">{selectedTranslator.first_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tên</p>
                  <p className="text-base">{selectedTranslator.last_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số CMND/CCCD</p>
                  <p className="text-base">{selectedTranslator.id_card_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày cấp</p>
                  <p className="text-base">
                    {selectedTranslator.id_card_issue_date
                      ? new Date(selectedTranslator.id_card_issue_date).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nơi cấp</p>
                  <p className="text-base">{selectedTranslator.id_card_issue_place || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nơi công tác</p>
                  <p className="text-base">{selectedTranslator.workplace || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
                  <p className="text-base">{selectedTranslator.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                  <p className="text-base">{selectedTranslator.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedTranslator.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số tài khoản</p>
                  <p className="text-base">{selectedTranslator.bank_account_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tên ngân hàng</p>
                  <p className="text-base">{selectedTranslator.bank_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chi nhánh</p>
                  <p className="text-base">{selectedTranslator.bank_branch || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mã số thuế TNCN</p>
                  <p className="text-base">{selectedTranslator.tax_code || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                  <p className="text-base">
                    {selectedTranslator.created_at
                      ? new Date(selectedTranslator.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cập nhật cuối</p>
                  <p className="text-base">
                    {selectedTranslator.updated_at
                      ? new Date(selectedTranslator.updated_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

