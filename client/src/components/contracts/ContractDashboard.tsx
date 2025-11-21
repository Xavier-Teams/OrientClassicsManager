"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, ContractStatistics, ContractProgressReport } from "@/lib/api";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ContractDashboard() {
  const { data: statistics, isLoading: isLoadingStats } = useQuery<ContractStatistics>({
    queryKey: ["contractStatistics"],
    queryFn: () => apiClient.getContractStatistics(),
  });

  const { data: progressReport, isLoading: isLoadingProgress } = useQuery<ContractProgressReport>({
    queryKey: ["contractProgressReport"],
    queryFn: () => apiClient.getContractProgressReport(),
  });

  if (isLoadingStats || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tổng hợp trạng thái hợp đồng */}
      <Card>
        <CardHeader>
          <CardTitle>TỔNG HỢP TRẠNG THÁI HỢP ĐỒNG DỊCH THUẬT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Số lượng hợp đồng đã ký */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  SỐ LƯỢNG HỢP ĐỒNG ĐÃ KÝ
                </h3>
                {statistics && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hợp phần</TableHead>
                        <TableHead className="text-center">GĐ 1</TableHead>
                        <TableHead className="text-center">GĐ 2</TableHead>
                        <TableHead className="text-center">GĐ 3</TableHead>
                        <TableHead className="text-center">GĐ 4</TableHead>
                        <TableHead className="text-center">GĐ 5</TableHead>
                        <TableHead className="text-center">Tổng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.by_part.map((part, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {part.translation_part}
                          </TableCell>
                          <TableCell className="text-center">
                            {part.stage_1}
                          </TableCell>
                          <TableCell className="text-center">
                            {part.stage_2}
                          </TableCell>
                          <TableCell className="text-center">
                            {part.stage_3}
                          </TableCell>
                          <TableCell className="text-center">
                            {part.stage_4}
                          </TableCell>
                          <TableCell className="text-center">
                            {part.stage_5}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {part.total}
                          </TableCell>
                        </TableRow>
                      ))}
                      {statistics.total && (
                        <TableRow className="font-semibold bg-muted">
                          <TableCell>Tổng</TableCell>
                          <TableCell className="text-center">
                            {statistics.total.stage_1}
                          </TableCell>
                          <TableCell className="text-center">
                            {statistics.total.stage_2}
                          </TableCell>
                          <TableCell className="text-center">
                            {statistics.total.stage_3}
                          </TableCell>
                          <TableCell className="text-center">
                            {statistics.total.stage_4}
                          </TableCell>
                          <TableCell className="text-center">
                            {statistics.total.stage_5}
                          </TableCell>
                          <TableCell className="text-center">
                            {statistics.total.total}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Số lượng danh mục tác phẩm */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  SỐ LƯỢNG DANH MỤC TÁC PHẨM THEO DANH SÁCH ĐƯỢC PHÊ DUYỆT
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tính năng này sẽ được tích hợp với danh sách tác phẩm được phê duyệt
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiến độ hợp đồng các hợp phần */}
      <Card>
        <CardHeader>
          <CardTitle>TIẾN ĐỘ HỢP ĐỒNG CÁC HỢP PHẦN</CardTitle>
        </CardHeader>
        <CardContent>
          {progressReport && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hợp phần</TableHead>
                  <TableHead className="text-center">Dự thảo</TableHead>
                  <TableHead className="text-center">Chờ ký</TableHead>
                  <TableHead className="text-center">Đã ký</TableHead>
                  <TableHead className="text-center">Đang thực hiện</TableHead>
                  <TableHead className="text-center">Hoàn thành</TableHead>
                  <TableHead className="text-center">Đã hủy</TableHead>
                  <TableHead className="text-center">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressReport.progress_by_part.map((part, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {part.translation_part}
                    </TableCell>
                    <TableCell className="text-center">{part.draft}</TableCell>
                    <TableCell className="text-center">{part.pending}</TableCell>
                    <TableCell className="text-center">{part.signed}</TableCell>
                    <TableCell className="text-center">{part.active}</TableCell>
                    <TableCell className="text-center">
                      {part.completed}
                    </TableCell>
                    <TableCell className="text-center">
                      {part.cancelled}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {part.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tóm tắt */}
      {progressReport && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressReport.summary.total_contracts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã ký
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressReport.summary.signed_contracts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang thực hiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressReport.summary.active_contracts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressReport.summary.completed_contracts}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

