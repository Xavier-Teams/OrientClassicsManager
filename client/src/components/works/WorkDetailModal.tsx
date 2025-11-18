"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Work } from "@/lib/api";
import { WORK_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { mapPriorityFromDjango } from "@/lib/constants";
import { Calendar, User, FileText, Clock } from "lucide-react";

interface WorkDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work: Work | null;
}

export function WorkDetailModal({
  open,
  onOpenChange,
  work,
}: WorkDetailModalProps) {
  if (!work) return null;

  const priority = mapPriorityFromDjango(work.priority);
  const priorityLabel = PRIORITY_LABELS[priority] || work.priority;
  const statusLabel = WORK_STATUS_LABELS[work.state] || work.state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{work.name}</DialogTitle>
          <DialogDescription>
            {work.name_original && `Tên gốc: ${work.name_original}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {statusLabel}
            </Badge>
            {work.priority !== "0" && (
              <Badge variant="outline" className="text-sm">
                {priorityLabel}
              </Badge>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Tiến độ: {work.translation_progress}%
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Tác giả</p>
                      <p className="text-sm text-muted-foreground">
                        {work.author || "Không rõ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Ngôn ngữ</p>
                      <p className="text-sm text-muted-foreground">
                        {work.source_language} → {work.target_language}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Số trang / Số từ</p>
                      <p className="text-sm text-muted-foreground">
                        {work.page_count.toLocaleString()} trang /{" "}
                        {work.word_count.toLocaleString()} từ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Phân công
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Hợp phần</p>
                    <p className="text-sm text-muted-foreground">
                      {work.translation_part_name || "Chưa gán"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Dịch giả</p>
                    <p className="text-sm text-muted-foreground">
                      {work.translator_name || "Chưa gán"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {work.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Mô tả
                </h3>
                <p className="text-sm">{work.description}</p>
              </div>
            </>
          )}

          {/* Notes */}
          {work.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Ghi chú
                </h3>
                <p className="text-sm">{work.notes}</p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Tạo: {new Date(work.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Cập nhật: {new Date(work.updated_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

