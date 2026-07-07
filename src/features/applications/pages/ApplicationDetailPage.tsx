import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  FileText,
  Loader2,
  CheckCircle2,
  Check,
  X,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import {
  useAdminApplicationDetail,
  useMarkApplicationReviewed,
  useScheduleInterview,
  useUpdateApplicationStatus,
} from "../hooks/useApplication";

const STEPS = [
  { id: "Submitted", label: "Mới nộp" },
  { id: "Reviewed", label: "Đã xem" },
  { id: "InterviewScheduled", label: "Phỏng vấn" },
  { id: "Result", label: "Kết quả" },
];

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

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useAdminApplicationDetail(id ?? "");
  const { mutate: markReviewed } = useMarkApplicationReviewed();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateApplicationStatus();
  const { mutate: scheduleInterview, isPending: isScheduling } =
    useScheduleInterview();

  const appData = data?.value;
  const currentStep = getStepIndex(appData?.status || "Submitted");

  // State
  const [openSchedule, setOpenSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: "",
    startTime: "",
    endTime: "",
    address: "",
    room: "",
    maxCandidates: 1,
    message: "",
  });

  // State cho Reject
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (appData?.status === "Submitted") {
      markReviewed(id!);
    }
  }, [appData?.status, id, markReviewed]);

  // Đã sửa lại type: Thêm "Reviewed" vào đây
  const handleFinalResult = (
    status: "Reviewed" | "Approved" | "Rejected" | "Cancelled",
    reason?: string,
  ) => {
    updateStatus(
      { id: id!, status, rejectReason: reason },
      {
        onSuccess: () => {
          toast.success(`Đã chuyển trạng thái thành ${status}`);
          setOpenReject(false);
          setRejectReason("");
        },
        onError: () => toast.error("Có lỗi xảy ra!"),
      },
    );
  };

  const handleScheduleSubmit = () => {
    if (!scheduleForm.interviewDate || !scheduleForm.startTime)
      return toast.error("Vui lòng nhập ngày giờ!");

    const formatTime = (time: string) =>
      time.length === 5 ? `${time}:00` : time;
    const payload = {
      ...scheduleForm,
      interviewDate: new Date(scheduleForm.interviewDate).toISOString(),
      startTime: formatTime(scheduleForm.startTime),
      endTime: scheduleForm.endTime ? formatTime(scheduleForm.endTime) : "",
      maxCandidates: Number(scheduleForm.maxCandidates),
    };

    scheduleInterview(
      { id: id!, payload },
      {
        onSuccess: () => {
          toast.success("Đã lên lịch phỏng vấn cho ứng viên!");
          setOpenSchedule(false);
        },
        onError: () => toast.error("Lên lịch thất bại!"),
      },
    );
  };

  if (isLoading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (!appData)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy dữ liệu.
      </div>
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Chi tiết Hồ sơ</h2>
      </div>

      {/* STEPPER */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative flex justify-between items-center w-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold transition-colors duration-300 ${
                      isCompleted
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : isActive
                          ? "bg-white border-indigo-600 text-indigo-600"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.id === "Result" && appData.status === "Approved"
                      ? "Trúng tuyển"
                      : step.id === "Result" && appData.status === "Rejected"
                        ? "Từ chối"
                        : step.id === "Result" && appData.status === "Cancelled"
                          ? "Đã hủy"
                          : step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl text-gray-900">
                {appData.fullName}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-indigo-600">
                Ứng tuyển: {appData.recruitmentTitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appData.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số điện thoại</p>
                    <p className="text-sm font-medium text-gray-900">
                      {appData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Hồ sơ CV
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-gray-100">
              {appData.cvUrl ? (
                <iframe
                  src={`${appData.cvUrl}#toolbar=0`}
                  className="w-full h-full absolute inset-0 border-0"
                  title="CV Viewer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Không có CV
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm sticky top-6">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {appData.status === "Reviewed" && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                    Hồ sơ đang ở trạng thái <b>Đã xem</b>. Bạn có thể xếp lịch
                    phỏng vấn hoặc từ chối ngay.
                  </div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setOpenSchedule(true)}
                  >
                    <CalendarClock className="w-4 h-4 mr-2" /> Xếp lịch phỏng
                    vấn
                  </Button>
                  {/* Mở form nhập lý do từ chối */}
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setOpenReject(true)}
                  >
                    Từ chối hồ sơ
                  </Button>
                </div>
              )}

              {appData.status === "InterviewScheduled" && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 text-purple-900 text-sm rounded-xl border border-purple-100 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <CalendarClock className="w-4 h-4" /> Lịch Phỏng Vấn
                    </p>
                    <div className="space-y-1 text-xs">
                      {/* Xử lý hiển thị lịch nếu có data */}
                      <p>
                        Ngày:{" "}
                        <b>
                          {appData.interviewDate
                            ? format(
                                new Date(appData.interviewDate),
                                "dd/MM/yyyy",
                              )
                            : "N/A"}
                        </b>
                      </p>
                      <p>
                        Giờ:{" "}
                        <b>
                          {appData.startTime?.slice(0, 5)}{" "}
                          {appData.endTime
                            ? `- ${appData.endTime.slice(0, 5)}`
                            : ""}
                        </b>
                      </p>
                      <p>
                        Phòng: <b>{appData.interviewRoom || "N/A"}</b>
                      </p>
                      <p>
                        Địa điểm: <b>{appData.interviewAddress || "N/A"}</b>
                      </p>
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                  <p className="text-sm font-medium text-gray-700">
                    Chốt kết quả phỏng vấn:
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isUpdatingStatus}
                    onClick={() => handleFinalResult("Approved")}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}{" "}
                    Duyệt - Trúng tuyển
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isUpdatingStatus}
                    onClick={() => setOpenReject(true)}
                  >
                    <X className="w-4 h-4 mr-2" /> Đánh rớt (Từ chối)
                  </Button>
                </div>
              )}

              {["Approved", "Rejected", "Cancelled"].includes(
                appData.status,
              ) && (
                <div className="text-center py-4 space-y-3">
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      appData.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : appData.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {appData.status === "Approved" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <X className="w-6 h-6" />
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">
                    Hồ sơ đã{" "}
                    {appData.status === "Approved"
                      ? "Trúng tuyển"
                      : appData.status === "Rejected"
                        ? "Bị Từ chối"
                        : "Bị Hủy"}
                  </p>
                  {/* Trạng thái đã duyệt thì cho phép lui về Reviewed */}
                  <Button
                    variant="link"
                    className="text-xs text-gray-500"
                    onClick={() => handleFinalResult("Reviewed")}
                  >
                    Thu hồi lại kết quả
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* DIALOG NHẬP LÝ DO TỪ CHỐI */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <X className="w-5 h-5" /> Từ chối ứng viên
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>
              Lý do từ chối (Bắt buộc) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Nhập lý do từ chối (Ứng viên sẽ thấy nội dung này)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={isUpdatingStatus || !rejectReason.trim()}
              onClick={() => handleFinalResult("Rejected", rejectReason)}
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}{" "}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG XẾP LỊCH PHỎNG VẤN */}
      <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lên lịch phỏng vấn cá nhân</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>
                  Ngày phỏng vấn <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={scheduleForm.interviewDate}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      interviewDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Số lượng (mặc định 1)</Label>
                <Input
                  type="number"
                  min={1}
                  value={scheduleForm.maxCandidates}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm((p) => ({
                      ...p,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) =>
                    setScheduleForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Địa điểm</Label>
              <Input
                placeholder="Tầng 3 tòa nhà VNZ..."
                value={scheduleForm.address}
                onChange={(e) =>
                  setScheduleForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phòng (tùy chọn)</Label>
              <Input
                placeholder="Phòng HR 01..."
                value={scheduleForm.room}
                onChange={(e) =>
                  setScheduleForm((p) => ({ ...p, room: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Lời nhắn cho ứng viên</Label>
              <Textarea
                placeholder="Bạn nhớ mang theo Laptop nhé..."
                value={scheduleForm.message}
                onChange={(e) =>
                  setScheduleForm((p) => ({ ...p, message: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSchedule(false)}>
              Hủy
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleScheduleSubmit}
              disabled={isScheduling}
            >
              {isScheduling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}{" "}
              Lưu & Gửi thông báo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationDetailPage;
