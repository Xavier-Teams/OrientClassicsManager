"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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

  const { data: templatesData, isLoading } = useQuery<{
    count: number;
    results: ContractTemplate[];
  }>({
    queryKey: ["contractTemplates"],
    queryFn: () => apiClient.getContractTemplates({ page_size: 1000 }),
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Chưa có mẫu hợp đồng nào. Hãy tạo mẫu hợp đồng đầu tiên.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {template.type === "rich_text" ? (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        Soạn thảo trực tuyến
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 mr-1" />
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
                  <p className="text-xs text-muted-foreground mt-2">
                    File: {template.file_name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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

