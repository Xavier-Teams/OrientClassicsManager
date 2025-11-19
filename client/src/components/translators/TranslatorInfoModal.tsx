"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  FileText,
  Calendar,
  Banknote,
} from "lucide-react";
import { Translator } from "@/lib/api";

interface TranslatorInfoModalProps {
  translator: Translator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TranslatorInfoModal({
  translator,
  open,
  onOpenChange,
}: TranslatorInfoModalProps) {
  if (!translator) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "Chưa có";
    try {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin dịch giả
          </DialogTitle>
          <DialogDescription>
            Chi tiết thông tin dịch giả: {translator.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Họ và tên đệm
                  </p>
                  <p className="text-base">{translator.first_name || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tên
                  </p>
                  <p className="text-base">{translator.last_name || "Chưa có"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Họ và tên đầy đủ
                  </p>
                  <p className="text-base font-semibold">{translator.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin CMND/CCCD */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin CMND/CCCD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Số CMND/CCCD
                  </p>
                  <p className="text-base">{translator.id_card_number || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày cấp
                  </p>
                  <p className="text-base">{formatDate(translator.id_card_issue_date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Nơi cấp
                  </p>
                  <p className="text-base">{translator.id_card_issue_place || "Chưa có"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin liên hệ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-base">{translator.email || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </p>
                  <p className="text-base">{translator.phone || "Chưa có"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </p>
                  <p className="text-base">{translator.address || "Chưa có"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nơi công tác
                  </p>
                  <p className="text-base">{translator.workplace || "Chưa có"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin ngân hàng */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Thông tin ngân hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Số tài khoản
                  </p>
                  <p className="text-base">{translator.bank_account_number || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Tên ngân hàng
                  </p>
                  <p className="text-base">{translator.bank_name || "Chưa có"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Chi nhánh
                  </p>
                  <p className="text-base">{translator.bank_branch || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Mã số thuế TNCN
                  </p>
                  <p className="text-base">{translator.tax_code || "Chưa có"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trạng thái */}
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm text-muted-foreground">Trạng thái:</p>
            {translator.active !== false ? (
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
      </DialogContent>
    </Dialog>
  );
}

