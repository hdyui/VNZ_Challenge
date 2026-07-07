import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { CalendarDays, Eye, PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateLeaveDialog } from "../components/CreateLeaveDialog";
import { useGetMyLeaves } from "../hooks/useUser";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending: { label: "Đang chờ duyệt", color: "bg-amber-100 text-amber-700" },
  Reviewed: { label: "Đã xem", color: "bg-blue-100 text-blue-700" },
  Accepted: { label: "Đã duyệt", color: "bg-green-100 text-green-700" },
  Rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
  Cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

const MyLeaveListPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyLeaves();
  const [openLeave, setOpenLeave] = useState(false);

  const leaves = data?.value?.items || data?.value || []; // Tùy cấu trúc phân trang BE trả về

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" /> Lịch sử Xin nghỉ
          phép
        </h2>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={() => setOpenLeave(true)}
        >
          <PlusCircle className="w-4 h-4" /> Tạo đơn mới
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Bạn chưa có đơn xin nghỉ nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Loại nghỉ phép</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Ngày gửi</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.map((leave: any) => (
                    <tr
                      key={leave.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {leave.leaveType === "Shift" || leave.workScheduleId
                          ? "Nghỉ theo ca"
                          : "Nghỉ dài ngày"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {leave.workScheduleId
                          ? "Theo lịch ca làm"
                          : `${format(new Date(leave.fromDate), "dd/MM/yyyy")} - ${format(new Date(leave.toDate), "dd/MM/yyyy")}`}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {format(new Date(leave.createdAt), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[leave.status]?.color || "bg-gray-100"}`}
                        >
                          {STATUS_MAP[leave.status]?.label || leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/employee/leaves/${leave.id}`)
                          }
                          className="text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateLeaveDialog open={openLeave} onOpenChange={setOpenLeave} />
    </div>
  );
};

export default MyLeaveListPage;
