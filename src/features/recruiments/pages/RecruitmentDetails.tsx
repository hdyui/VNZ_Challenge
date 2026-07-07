import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useApplyRecruitment,
  usePublicRecruitmentDetail,
} from "../hooks/useRecruitment";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import type { RecruitmentLevel } from "../type";
import { WORKING_TYPE_LABELS } from "../schema";

const LEVEL_COLOR: Record<RecruitmentLevel, string> = {
  all: "bg-slate-100 text-slate-700 border-slate-200",
  Intern: "bg-slate-100 text-slate-700 border-slate-200",
  Fresher: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Junior: "bg-sky-50 text-sky-700 border-sky-200",
  Middle: "bg-violet-50 text-violet-700 border-violet-200",
  Senior:
    "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL: Record<string, string> = {
  Open: "Đang mở",
  Draft: "Bản nháp",
  Closed: "Đã đóng",
};

const STATUS_COLOR: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Closed: "bg-red-50 text-red-600 border-red-200",
};

const MetaItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/10 mt-0.5">
      <Icon className="h-4 w-4 text-gray-900" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  </div>
);

// ─── Apply form state ─────────────────────────────────────────────────────────

// ─── Apply form state ─────────────────────────────────────────────────────────

// Định nghĩa State cục bộ cho Form (lúc mới mở lên thì cvFile là null)
interface ApplyForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cvFile: File | null;
}

const INITIAL_APPLY: ApplyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  cvFile: null,
};

type ApplyError = Partial<Record<keyof ApplyForm, string>>;

const validateApply = (form: ApplyForm): ApplyError => {
  const errors: ApplyError = {};
  if (!form.fullName.trim()) errors.fullName = "Họ và tên là bắt buộc.";
  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
  }
  if (!form.phone.trim()) errors.phone = "Số điện thoại là bắt buộc.";
  if (!form.cvFile) errors.cvFile = "Vui lòng đính kèm CV (File PDF, DOC)."; // Bắt lỗi nếu chưa chọn File
  return errors;
};

// ─── Apply dialog ─────────────────────────────────────────────────────────────

const ApplyDialog = ({
  open,
  onOpenChange,
  recruitmentId,
  positionTitle,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  recruitmentId: string;
  positionTitle?: string;
}) => {
  const [form, setForm] = useState<ApplyForm>(INITIAL_APPLY);
  const [errors, setErrors] = useState<ApplyError>({});
  const [submitted, setSubmitted] = useState(false);
  const { mutate: applyRecruitment, isPending } = useApplyRecruitment();

  const handleChange = (field: keyof ApplyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const fieldErrors = validateApply(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Gọi API với Payload chuẩn theo type của bác
    applyRecruitment(
      {
        recruitmentId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        cvFile: form.cvFile as File, // Ép kiểu sang File vì đã validate ở trên chắc chắn nó không null
      },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setForm(INITIAL_APPLY);
      setErrors({});
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Đã nộp đơn ứng tuyển!
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Cảm ơn bạn đã ứng tuyển vào vị trí{" "}
                <span className="font-medium text-slate-700">
                  {positionTitle}
                </span>
                . Chúng tôi sẽ xem xét hồ sơ của bạn và phản hồi sớm nhất.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="outline"
              className="mt-2 border-slate-200"
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Ứng tuyển vị trí này
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {positionTitle && (
                  <span className="font-medium text-gray-900">
                    {positionTitle}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Full name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`border-slate-200 focus-visible:ring-gray-900 ${errors.fullName ? "border-red-300" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`border-slate-200 focus-visible:ring-gray-900 ${errors.email ? "border-red-300" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="0901 234 567"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`border-slate-200 focus-visible:ring-gray-900 ${errors.phone ? "border-red-300" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Địa chỉ{" "}
                  <span className="text-gray-400 font-normal">(tùy chọn)</span>
                </Label>
                <Input
                  placeholder="Hồ Chí Minh..."
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="border-gray-200 focus-visible:ring-gray-900"
                />
              </div>

              {/* CV File Upload */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Hồ sơ CV (PDF, DOC) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setForm((prev) => ({ ...prev, cvFile: file }));
                    if (errors.cvFile)
                      setErrors((prev) => ({ ...prev, cvFile: undefined }));
                  }}
                  className={`border-gray-200 file:text-gray-900 focus-visible:ring-gray-900 cursor-pointer ${errors.cvFile ? "border-red-300" : ""}`}
                />
                {errors.cvFile && (
                  <p className="text-xs text-red-500">{errors.cvFile}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-slate-200 text-slate-600"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="gap-2 bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/25 min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Gửi hồ sơ
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const RecruitmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePublicRecruitmentDetail(id ?? "");
  const [applyOpen, setApplyOpen] = useState(false);

  const detail = data?.value;
  const isClosed = detail?.status === "Closed";

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/5 via-white to-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
          <CardContent className="pt-10 pb-10 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto">
              <BriefcaseBusiness className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-base font-semibold text-slate-800">
              Không tìm thấy vị trí
            </p>
            <p className="text-sm text-slate-500">
              Vị trí này có thể đã bị gỡ bỏ hoặc không tồn tại.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/recruitments")}
              className="mt-4 border-slate-200"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/5 via-white to-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top bar: back + quick apply */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/recruitments")}
            className="gap-2 text-gray-500 hover:text-gray-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Cover image */}
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-2xl sm:h-72" />
        ) : (
          detail?.coverImageUrl && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <img
                src={detail.coverImageUrl}
                alt={detail.title}
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          )
        )}

        <div className="space-y-6">
          {/* 1. Thông tin cơ bản — full width */}
          <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
            <CardContent className="pt-6 pb-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                      {detail?.title}
                    </h1>
                    <div className="flex shrink-0 items-center gap-2">
                      {detail?.status && (
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[detail.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                        >
                          {STATUS_LABEL[detail.status] ?? detail.status}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${detail?.level ? LEVEL_COLOR[detail.level] : ""}`}
                      >
                        {detail?.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {typeof detail?.department === "object"
                        ? (detail.department as { name: string })?.name
                        : detail?.department}
                    </span>
                    {detail?.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {detail.location}
                      </span>
                    )}
                    {detail?.deadline && (
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Hạn nộp:{" "}
                        {format(new Date(detail.deadline), "dd/MM/yyyy HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Ba bảng nhỏ — xếp hàng ngang */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Bảng 1: Đơn vị & cấp bậc */}
            <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Đơn vị &amp; cấp bậc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </>
                ) : (
                  <>
                    <MetaItem
                      icon={Building2}
                      label="Phòng ban"
                      value={
                        typeof detail?.department === "object"
                          ? (detail.department as { name: string })?.name
                          : detail?.department
                      }
                    />
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={TrendingUp}
                      label="Cấp bậc"
                      value={
                        detail?.level ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOR[detail.level]}`}
                          >
                            {detail.level}
                          </span>
                        ) : null
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bảng 2: Hình thức làm việc */}
            <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Hình thức làm việc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </>
                ) : (
                  <>
                    <MetaItem
                      icon={MapPin}
                      label="Địa điểm"
                      value={detail?.location || "Đang cập nhật"}
                    />
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={Clock}
                      label="Loại hình làm việc"
                      value={
                        detail?.workingType
                          ? WORKING_TYPE_LABELS[detail.workingType]
                          : "Đang cập nhật"
                      }
                    />
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={Users}
                      label="Số lượng tuyển"
                      value={
                        detail?.hiringQuantity != null
                          ? `${detail.hiringQuantity} người`
                          : "Đang cập nhật"
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bảng 3: Thời gian & thống kê */}
            <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Thời gian &amp; thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </>
                ) : (
                  <>
                    <MetaItem
                      icon={CalendarClock}
                      label="Hạn nộp hồ sơ"
                      value={
                        detail?.deadline
                          ? format(
                              new Date(detail.deadline),
                              "dd/MM/yyyy HH:mm",
                            )
                          : "Đang cập nhật"
                      }
                    />
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={CalendarDays}
                      label="Ngày đăng"
                      value={
                        detail?.createdAt
                          ? format(new Date(detail.createdAt), "dd/MM/yyyy")
                          : ""
                      }
                    />
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={Eye}
                      label="Lượt xem"
                      value={detail?.viewCount ?? 0}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 3. Khung nội dung mô tả — full width */}
          <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Chi tiết công việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={`h-4 ${i === 5 ? "w-2/3" : "w-full"}`}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="prose prose-sm prose-gray max-w-none text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: detail?.contentHtml ?? "",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Bottom apply CTA */}
          {/* {!isLoading && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-gray-900/5 via-white to-white p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gray-900/5 blur-3xl" />
              <div className="relative">
                <p className="text-base font-semibold text-slate-900">
                  {isClosed
                    ? "Vị trí này hiện đã đóng tuyển"
                    : "Sẵn sàng ứng tuyển?"}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isClosed
                    ? "Hãy theo dõi các vị trí khác đang mở."
                    : "Tham gia đội ngũ của chúng tôi và tạo ra sự khác biệt."}
                </p>
              </div>
              <div className="relative w-full sm:w-auto shrink-0">
                <Button
                  onClick={() =>
                    isClosed ? navigate("/recruitments") : setApplyOpen(true)
                  }
                  className="w-full sm:w-auto gap-2 bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/25"
                >
                  <Send className="h-4 w-4" />
                  {isClosed ? "Xem các vị trí khác" : "Ứng tuyển ngay"}
                </Button>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {detail && (
        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          recruitmentId={detail.id}
          positionTitle={detail.title}
        />
      )}
    </div>
  );
};

export default RecruitmentDetails;
