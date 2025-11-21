"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Upload,
  Loader2,
  MoreVertical,
  Eye,
  Search,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { apiClient, ContractTemplate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ContractTemplatePreview } from "./ContractTemplatePreview";

export function ContractTemplateManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: templatesData, isLoading, error } = useQuery<{
    count: number;
    next: string | null;
    previous: string | null;
    results: ContractTemplate[];
  }>({
    queryKey: ["contractTemplates"],
    queryFn: () => apiClient.getContractTemplates({ page_size: 1000 }),
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.deleteContractTemplate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractTemplates"] });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      toast({
        title: "Thành công",
        description: "Đã xóa mẫu hợp đồng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa mẫu hợp đồng",
        variant: "destructive",
      });
    },
  });

  const templates = templatesData?.results || [];
  
  // Filter templates by search query
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.translation_part?.toLowerCase().includes(query) ||
      template.file_name?.toLowerCase().includes(query)
    );
  });

  const handleCreate = () => {
    setLocation("/contracts/templates/editor");
  };

  const handleEdit = (template: ContractTemplate) => {
    setLocation(`/contracts/templates/editor?id=${template.id}`);
  };

  const handleDelete = (template: ContractTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý mẫu hợp đồng
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các mẫu hợp đồng để sử dụng khi tạo hợp đồng mới
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo mẫu hợp đồng
        </Button>
      </div>

      {/* Search Bar */}
      {templates.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mẫu hợp đồng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách mẫu hợp đồng...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-2">
              Không thể tải danh sách mẫu hợp đồng
            </p>
            <p className="text-sm text-muted-foreground">
              {(error as any)?.message || "Đã xảy ra lỗi khi kết nối với server"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["contractTemplates"] })}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Chưa có mẫu hợp đồng nào</p>
            <p className="text-muted-foreground mb-4">
              Hãy tạo mẫu hợp đồng đầu tiên để sử dụng khi tạo hợp đồng mới
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo mẫu hợp đồng đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? (
                <>
                  Tìm thấy {filteredTemplates.length} / {templatesData?.count || templates.length} mẫu hợp đồng
                </>
              ) : (
                <>
                  Tổng cộng {templatesData?.count || templates.length} mẫu hợp đồng
                </>
              )}
            </p>
          </div>
          {filteredTemplates.length === 0 && searchQuery ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Không tìm thấy mẫu hợp đồng nào phù hợp với "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem trước
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="gap-1">
                      {template.type === "rich_text" ? (
                        <>
                          <FileText className="h-3 w-3" />
                          Soạn thảo trực tuyến
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3" />
                          File Word
                        </>
                      )}
                    </Badge>
                    {template.is_default && (
                      <Badge variant="default">Mặc định</Badge>
                    )}
                    {template.translation_part && (
                      <Badge variant="secondary">
                        {template.translation_part}
                      </Badge>
                    )}
                  </div>
                  {template.file_name && (
                    <p className="text-xs text-muted-foreground truncate" title={template.file_name}>
                      📄 {template.file_name}
                    </p>
                  )}
                  {template.created_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tạo: {new Date(template.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Template Preview Dialog */}
      <ContractTemplatePreview
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
        template={previewTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mẫu hợp đồng "{templateToDelete?.name}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

