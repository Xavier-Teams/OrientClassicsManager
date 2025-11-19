"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { PRIORITY_LABELS } from "@/lib/constants";
import { mapPriorityToDjango } from "@/lib/constants";

type WorkQuickCreateFormValues = {
  name: string;
  name_original?: string;
  author?: string;
  source_language: string;
  target_language: string;
  page_count: number;
  word_count: number;
  description?: string;
  translation_part_id?: number | null;
  state: string;
  priority: string;
  notes?: string;
};

interface WorkQuickCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workName?: string; // Tên tác phẩm đã nhập từ contract form
  translationParts?: Array<{ id: number; name: string; code: string }>;
  onSubmit: (data: WorkQuickCreateFormValues) => Promise<number>; // Returns work ID
  isLoading?: boolean;
}

export function WorkQuickCreateForm({
  open,
  onOpenChange,
  workName = "",
  translationParts = [],
  onSubmit,
  isLoading = false,
}: WorkQuickCreateFormProps) {
  const form = useForm<WorkQuickCreateFormValues>({
    defaultValues: {
      name: workName,
      name_original: "",
      author: "",
      source_language: "Hán văn",
      target_language: "Tiếng Việt",
      page_count: 0,
      word_count: 0,
      description: "",
      translation_part_id: null,
      state: "draft",
      priority: "0",
      notes: "",
    },
  });

  useEffect(() => {
    if (workName) {
      form.setValue("name", workName);
    }
  }, [workName, form]);

  const handleSubmit = async (data: WorkQuickCreateFormValues) => {
    const workId = await onSubmit(data);
    if (workId) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo mới tác phẩm</DialogTitle>
          <DialogDescription>
            Nhập đầy đủ thông tin tác phẩm mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Tên tác phẩm là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tác phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Luận Ngữ" />
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
                      <Input {...field} placeholder="論語" />
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
                      <Input {...field} placeholder="Khổng Tử" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="none">Chưa gán</SelectItem>
                        {translationParts.map((part) => (
                          <SelectItem key={part.id} value={part.id.toString()}>
                            {part.name}
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
                rules={{ required: "Ngôn ngữ nguồn là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ nguồn</FormLabel>
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
                rules={{ required: "Ngôn ngữ đích là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngôn ngữ đích</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tiếng Việt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="page_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số trang</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                        {...field}
                        type="number"
                        placeholder="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Mô tả về tác phẩm..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Dự kiến</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức ưu tiên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={mapPriorityToDjango(value)}>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Ghi chú..." />
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu lại
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

