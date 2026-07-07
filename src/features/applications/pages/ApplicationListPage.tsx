import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Search, Eye, Filter } from "lucide-react";
import { format } from "date-fns";
import { useAdminApplications } from "@/features/applications/hooks/useApplication";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Submitted: { label: "Mới nộp", color: "bg-blue-100 text-blue-700" },
  Reviewed: { label: "Đã xem", color: "bg-yellow-100 text-yellow-700" },
  InterviewScheduled: {
    label: "Hẹn phỏng vấn",
    color: "bg-purple-100 text-purple-700",
  },
  Approved: { label: "Trúng tuyển", color: "bg-green-100 text-green-700" },
  Rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
  Cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Mới nộp", value: "Submitted" },
  { label: "Đã xem", value: "Reviewed" },
  { label: "Hẹn phỏng vấn", value: "InterviewScheduled" },
  { label: "Trúng tuyển", value: "Approved" },
  { label: "Từ chối", value: "Rejected" },
  { label: "Đã hủy", value: "Cancelled" },
];

const ApplicationListPage = () => {
  const navigate = useNavigate();

  // States cho bộ lọc
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Gọi Hook
  const { data, isLoading } = useAdminApplications({
    Keyword: debouncedSearch,
    Status: statusFilter === "all" ? "" : (statusFilter as any),
    Page: page,
    PageSize: pageSize,
  });

  const applications = data?.value?.items ?? [];
  const totalItems = data?.value?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Đơn Ứng Tuyển
          </h2>
          <p className="text-sm text-gray-500">
            Xem và xử lý hồ sơ ứng viên nộp vào công ty.
          </p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Bộ lọc
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên, email, sđt..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1); // Reset trang khi search
                  }}
                  className="pl-9 w-full"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[250px]">Ứng viên</TableHead>
                <TableHead>Vị trí ứng tuyển</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-gray-500"
                  >
                    Không tìm thấy đơn ứng tuyển nào.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app: any) => {
                  const statusConf =
                    STATUS_CONFIG[app.status] || STATUS_CONFIG["Submitted"];
                  return (
                    <TableRow
                      key={app.id || app.applicationId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {app.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-indigo-600">
                        {app.recruitmentTitle || "Vị trí đã xóa"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {app.createdAt
                          ? format(new Date(app.createdAt), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/admin/applications/${app.id || app.applicationId}`,
                            )
                          }
                          className="hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Phân trang */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Hiển thị trang {page} / {totalPages} (Tổng {totalItems} đơn)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationListPage;
