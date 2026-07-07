import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  FileText,
  Ban,
  CheckCircle2,
  MessageSquareWarning,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useCancelLeave, useGetLeaveDetail } from "../hooks/useUser";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> =
  {
    Pending: {
      label: "Đang chờ duyệt",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      icon: Clock,
    },
    Reviewed: {
      label: "Đã xem",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: Eye,
    },
    Accepted: {
      label: "Đã duyệt",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: CheckCircle2,
    },
    Rejected: {
      label: "Từ chối",
      color: "text-red-600 bg-red-50 border-red-200",
      icon: Ban,
    },
    Cancelled: {
      label: "Đã hủy",
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: Ban,
    },
  };

const MyLeaveDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useGetLeaveDetail(id ?? "");
  const { mutate: cancelLeave, isPending: isCanceling } = useCancelLeave();

  const leave = data?.value;

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy đơn xin nghỉ này không?")) {
      cancelLeave(id!, {
        onSuccess: () => toast.success("Đã hủy đơn xin nghỉ thành công!"),
        onError: () => toast.error("Có lỗi xảy ra khi hủy đơn!"),
      });
    }
  };

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (!leave)
    return <div className="text-center py-12">Không tìm thấy đơn!</div>;

  const StatusIcon = STATUS_MAP[leave.status]?.icon || Clock;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="gap-2 text-gray-500 -ml-4"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Button>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Chi tiết đơn xin
              nghỉ
            </CardTitle>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${STATUS_MAP[leave.status]?.color}`}
            >
              <StatusIcon className="w-4 h-4" />{" "}
              {STATUS_MAP[leave.status]?.label || leave.status}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Loại nghỉ phép</p>
              <p className="font-semibold text-gray-900">
                {leave.workScheduleId ? "Nghỉ theo ca" : "Nghỉ dài ngày"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Ngày gửi đơn</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(leave.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
            </div>

            {leave.workScheduleId ? (
              <div className="col-span-2 p-3 bg-indigo-50 rounded-lg">
                <p className="text-gray-500 mb-1">Ca xin nghỉ</p>
                {/* NOTE: Tùy BE trả chi tiết ca thế nào, bác map hiển thị ra đây */}
                <p className="font-semibold text-indigo-900">
                  ID Ca làm việc: {leave.workScheduleId}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-gray-500 mb-1">Từ ngày</p>
                  <p className="font-semibold text-gray-900">
                    {leave.fromDate
                      ? format(new Date(leave.fromDate), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Đến ngày</p>
                  <p className="font-semibold text-gray-900">
                    {leave.toDate
                      ? format(new Date(leave.toDate), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
              </>
            )}

            <div className="col-span-2">
              <p className="text-gray-500 mb-1">Lý do xin nghỉ</p>
              <p className="bg-gray-50 p-3 rounded-lg text-gray-800 border border-gray-100">
                {leave.reason || "Không có lý do"}
              </p>
            </div>
          </div>

          {/* Nếu Pending thì hiện nút Hủy */}
          {leave.status === "Pending" && (
            <>
              <hr className="border-gray-100" />
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCanceling}
                >
                  <Ban className="w-4 h-4 mr-2" /> Hủy Đơn Này
                </Button>
              </div>
            </>
          )}

          {/* Nếu Rejected thì hiện lý do từ Admin (nếu BE có trường rejectReason) */}
          {leave.status === "Rejected" && leave.rejectReason && (
            <div className="bg-red-50 p-4 rounded-lg flex gap-3 border border-red-100">
              <MessageSquareWarning className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-red-900 text-sm">
                  Lý do từ chối từ Quản lý:
                </p>
                <p className="text-red-700 text-sm mt-1">
                  {leave.rejectReason}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyLeaveDetailPage;
