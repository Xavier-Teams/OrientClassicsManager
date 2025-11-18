"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
// Note: Install zod and @hookform/resolvers if not already installed
// npm install zod @hookform/resolvers
// For now, using basic validation without zod
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Work, User } from "@/lib/api";
import { WORK_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { mapPriorityToDjango, mapPriorityFromDjango } from "@/lib/constants";

// Form values type
type WorkFormValues = {
  name: string;
  name_original?: string;
  author?: string;
  source_language: string;
  target_language: string;
  page_count: number;
  word_count: number;
  description?: string;
  translation_part_id?: number | null;
  translator_id?: number | null;
  state: string;
  priority: string;
  translation_progress: number;
  notes?: string;
};

interface WorkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work?: Work | null;
  translators?: User[];
  translationParts?: Array<{ id: number; name: string; code: string }>;
  onSubmit: (data: WorkFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function WorkForm({
  open,
  onOpenChange,
  work,
  translators = [],
  translationParts = [],
  onSubmit,
  isLoading = false,
}: WorkFormProps) {
  const form = useForm<WorkFormValues>({
    defaultValues: {
      name: "",
      name_original: "",
      author: "",
      source_language: "Hán văn",
      target_language: "Tiếng Việt",
      page_count: 0,
      word_count: 0,
      description: "",
      translation_part_id: null,
      translator_id: null,
      state: "draft",
      priority: "0",
      translation_progress: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (work) {
      form.reset({
        name: work.name || "",
        name_original: work.name_original || "",
        author: work.author || "",
        source_language: work.source_language || "Hán văn",
        target_language: work.target_language || "Tiếng Việt",
        page_count: work.page_count || 0,
        word_count: work.word_count || 0,
        description: work.description || "",
        translation_part_id: work.translation_part
          ? parseInt(work.translation_part as any)
          : null,
        translator_id: work.translator
          ? parseInt(work.translator as any)
          : null,
        state: work.state || "draft",
        priority: work.priority || "0",
        translation_progress: work.translation_progress || 0,
        notes: work.notes || "",
      });
    } else {
      form.reset({
        name: "",
        name_original: "",
        author: "",
        source_language: "Hán văn",
        target_language: "Tiếng Việt",
        page_count: 0,
        word_count: 0,
        description: "",
        translation_part_id: null,
        translator_id: null,
        state: "draft",
        priority: "0",
        translation_progress: 0,
        notes: "",
      });
    }
  }, [work, form]);

  const handleSubmit = async (data: WorkFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  // Auto-calculate word_count from page_count
  const pageCount = form.watch("page_count");
  useEffect(() => {
    if (pageCount > 0 && !work) {
      // Estimate: 500 words per page
      form.setValue("word_count", pageCount * 500);
    }
  }, [pageCount, form, work]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {work ? "Chỉnh sửa tác phẩm" : "Tạo tác phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {work
              ? "Cập nhật thông tin tác phẩm dịch thuật"
              : "Thêm tác phẩm mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tác phẩm *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên tác phẩm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name_original"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên gốc</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên gốc (nếu có)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tác giả</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên tác giả" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(WORK_STATUS_LABELS).map(([key, label]) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ nguồn *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hán văn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ đích *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tiếng Việt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="page_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số trang cơ sở</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="word_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số từ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Tự động tính: số trang × 500
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ưu tiên</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức ưu tiên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Only show unique priorities: normal, high, urgent */}
                        {/* 'low' maps to '0' same as 'normal', so we skip it */}
                        {Object.entries(PRIORITY_LABELS)
                          .filter(([key]) => key !== 'low') // Remove 'low' to avoid duplicate '0' value
                          .map(([key, label]) => (
                            <SelectItem
                              key={key}
                              value={mapPriorityToDjango(key)}
                            >
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="translation_part_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hợp phần dịch thuật</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : parseInt(value))
                      }
                      value={field.value != null ? field.value.toString() : "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hợp phần" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Không chọn</SelectItem>
                        {translationParts.map((part) => (
                          <SelectItem key={part.id} value={part.id.toString()}>
                            {part.name} ({part.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="translator_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch giả</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : parseInt(value))
                      }
                      value={field.value != null ? field.value.toString() : "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dịch giả" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Chưa gán</SelectItem>
                        {translators.map((translator) => (
                          <SelectItem
                            key={translator.id}
                            value={translator.id.toString()}
                          >
                            {translator.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="translation_progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiến độ dịch thuật (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả về tác phẩm..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ghi chú nội bộ..."
                      rows={2}
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : work ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

