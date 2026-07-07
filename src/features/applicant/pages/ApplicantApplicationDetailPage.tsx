import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  MessageSquareWarning,
  ExternalLink,
  CalendarClock,
  Map,
  UploadCloud,
  Loader2,
  Check, // Nhớ import icon Check nhé
} from "lucide-react";
import { format } from "date-fns";
import {
  useApplicantApplicationDetail,
  useUpdateApplicantCv,
} from "@/features/applicant/hooks/useApplicant";

const STATUS_LABELS: Record<string, string> = {
  Submitted: "Hồ sơ của bạn đã được gửi",
  Reviewed: "Hồ sơ của bạn đang được xem xét",
  InterviewScheduled: "Hồ sơ của bạn đã được duyệt sang vòng phỏng vấn",
  Approved: "Chúc mừng! Bạn đã trúng tuyển",
  Rejected: "Hồ sơ của bạn chưa phù hợp, cảm ơn bạn đã ứng tuyển tại VNZ",
  Cancelled: "Đơn ứng tuyển của bạn đã hủy",
};

// ─── ĐỊNH NGHĨA CÁC BƯỚC CHO STEPPER ───
const STEPS = [
  { id: "Submitted", label: "Mới nộp" },
  { id: "Reviewed", label: "Đã xem" },
  { id: "InterviewScheduled", label: "Phỏng vấn" },
  { id: "Result", label: "Kết quả" },
];

// Hàm xác định vị trí bước hiện tại
const getStepIndex = (status: string) => {
  switch (status) {
    case "Submitted":
      return 0;
    case "Reviewed":
      return 1;
    case "InterviewScheduled":
      return 2;
    case "Approved":
    case "Rejected":
    case "Cancelled":
      return 3;
    default:
      return 0;
  }
};

const ApplicantApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useApplicantApplicationDetail(id ?? "");
  const { mutate: updateCv, isPending: isUpdatingCv } = useUpdateApplicantCv();

  const [openCvDialog, setOpenCvDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const appDetail = data?.value;
  // Lấy ra thứ tự bước hiện tại của ứng viên
  const currentStep = getStepIndex(appDetail?.status || "Submitted");

  const handleUploadCv = () => {
    if (!selectedFile) return toast.error("Vui lòng chọn file CV");
    updateCv(
      { id: id!, file: selectedFile },
      {
        onSuccess: () => {
          toast.success("Cập nhật CV thành công!");
          setOpenCvDialog(false);
          setSelectedFile(null);
        },
        onError: () => toast.error("Cập nhật CV thất bại."),
      },
    );
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-gray-200 shadow-sm">
          <CardContent className="pt-10 pb-10 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto">
              <BriefcaseBusiness className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Không tìm thấy đơn ứng tuyển
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/applicant/applications")}
              className="mt-4"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/applicant/applications")}
          className="gap-2 text-gray-500 hover:text-gray-900 -ml-4"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">
                {appDetail?.recruitmentTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />{" "}
                  {appDetail?.recruitmentLocation || "Công ty VNZ"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Nộp ngày:{" "}
                  {appDetail?.createdAt
                    ? format(new Date(appDetail.createdAt), "dd/MM/yyyy HH:mm")
                    : ""}
                </span>
              </div>
            </div>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tiến độ hồ sơ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                {/* ─── STEPPER (THANH TIẾN TRÌNH) ─── */}
                <div className="relative flex justify-between items-center w-full px-2 sm:px-6">
                  {/* Đường line nền xám */}
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0 rounded-full" />

                  {/* Đường line tiến trình màu xanh */}
                  <div
                    className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500 rounded-full"
                    style={{
                      width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 48px)`,
                    }}
                  />

                  {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                      <div
                        key={step.id}
                        className="relative z-10 flex flex-col items-center gap-2 bg-white px-2"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-semibold transition-colors duration-300 ${
                            isCompleted
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : isActive
                                ? "bg-white border-indigo-600 text-indigo-600"
                                : "bg-white border-gray-200 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <span className="text-sm sm:text-base">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] sm:text-sm font-medium whitespace-nowrap ${
                            isActive || isCompleted
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {/* Xử lý label động cho bước cuối cùng */}
                          {step.id === "Result" &&
                          appDetail?.status === "Approved"
                            ? "Trúng tuyển"
                            : step.id === "Result" &&
                                appDetail?.status === "Rejected"
                              ? "Từ chối"
                              : step.id === "Result" &&
                                  appDetail?.status === "Cancelled"
                                ? "Đã hủy"
                                : step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-gray-100" />

                {/* ─── HỘP TRẠNG THÁI HIỆN TẠI ─── */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="mt-0.5">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-900">
                      Chi tiết trạng thái
                    </h4>
                    <p className="text-indigo-700 mt-1">
                      {appDetail?.status
                        ? STATUS_LABELS[appDetail.status]
                        : "Đang cập nhật"}
                    </p>
                  </div>
                </div>

                {/* ─── HIỂN THỊ LOGIC INTERVIEW THEO RESPONSE MỚI ─── */}
                {appDetail?.status === "InterviewScheduled" && (
                  <div className="mt-2">
                    {appDetail?.interviewDate ? (
                      <div className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                        <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-4">
                          <CalendarClock className="w-5 h-5 text-purple-600" />
                          Thông tin Ca Phỏng Vấn của bạn
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Ngày & Giờ
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {format(
                                  new Date(appDetail.interviewDate),
                                  "dd/MM/yyyy",
                                )}
                                {appDetail.startTime
                                  ? ` • ${appDetail.startTime.slice(0, 5)} - ${appDetail.endTime?.slice(0, 5)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Map className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Địa điểm & Phòng
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {appDetail.interviewAddress || "Đang cập nhật"}
                                {appDetail.interviewRoom
                                  ? ` (Phòng: ${appDetail.interviewRoom})`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {appDetail.interviewMessage && (
                            <div className="flex items-start gap-3">
                              <MessageSquareWarning className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Lời nhắn từ HR
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {appDetail.interviewMessage}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm text-amber-800">
                        <div className="flex items-center gap-2 mb-2 font-semibold">
                          <Clock className="w-5 h-5 text-amber-600" /> Đang chờ
                          xếp lịch
                        </div>
                        <p className="text-sm">
                          Hồ sơ của bạn đã được duyệt sang trạng thái phỏng vấn,
                          nhưng bộ phận Tuyển dụng chưa thiết lập thời gian cụ
                          thể. Xin mời chờ và thường xuyên vào check thông tin.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {appDetail?.status === "Rejected" && appDetail.rejectReason && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                    <div className="mt-0.5">
                      <MessageSquareWarning className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-900">
                        Phản hồi từ bộ phận Tuyển dụng
                      </h4>
                      <p className="text-red-700 mt-1">
                        {appDetail.rejectReason}
                      </p>
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-100" />

                {/* ─── CV & ĐỔI CV ─── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      CV / Hồ sơ đính kèm
                    </h4>
                    {/* Nút bật Popup đổi CV */}
                    {appDetail?.status === "Submitted" && (
                      <Dialog
                        open={openCvDialog}
                        onOpenChange={setOpenCvDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                          >
                            <UploadCloud className="w-4 h-4" /> Đổi CV
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Cập nhật CV mới</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) =>
                                setSelectedFile(e.target.files?.[0] || null)
                              }
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setOpenCvDialog(false)}
                            >
                              Hủy
                            </Button>
                            <Button
                              onClick={handleUploadCv}
                              disabled={isUpdatingCv}
                            >
                              {isUpdatingCv ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}{" "}
                              Lưu thay đổi
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <a
                    href={appDetail?.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 p-3 pr-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="h-10 w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                        Xem CV của bạn
                      </p>
                      <p className="text-xs text-gray-500">Định dạng File</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-2 group-hover:text-indigo-500" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicantApplicationDetailPage;
