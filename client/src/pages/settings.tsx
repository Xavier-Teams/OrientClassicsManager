import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-settings">
          Cài đặt
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý cấu hình hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Cài đặt hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            Trang cài đặt đang được phát triển
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
