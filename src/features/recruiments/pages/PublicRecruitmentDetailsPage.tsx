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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import type { RecruitmentLevel } from "../type";

const LEVEL_COLOR: Record<RecruitmentLevel, string> = {
  all: "bg-slate-100 text-slate-700 border-slate-200",
  Intern: "bg-slate-100 text-slate-700 border-slate-200",
  Fresher: "bg-green-50 text-green-700 border-green-200",
  Junior: "bg-blue-50 text-blue-700 border-blue-200",
  Middle: "bg-violet-50 text-violet-700 border-violet-200",
  Senior: "bg-amber-50 text-amber-700 border-amber-200",
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
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 mt-0.5">
      <Icon className="h-4 w-4 text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
    </div>
  </div>
);

// ─── Apply form state ─────────────────────────────────────────────────────────

interface ApplyForm {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  cvUrl: string;
}

const INITIAL_APPLY: ApplyForm = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  cvUrl: "",
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
    applyRecruitment(
      { recruitmentId, ...form },
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
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Đã nộp đơn ứng tuyển!
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Cảm ơn bạn đã ứng tuyển vào vị trí{" "}
                <span className="font-medium text-gray-700">
                  {positionTitle}
                </span>
                . Chúng tôi sẽ xem xét hồ sơ của bạn và phản hồi sớm nhất.
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="outline"
              className="mt-2 border-gray-200"
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Ứng tuyển vị trí này
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {positionTitle && (
                  <span className="font-medium text-indigo-700">
                    {positionTitle}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Full name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.fullName ? "border-red-300" : ""}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.email ? "border-red-300" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="0901 234 567"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.phone ? "border-red-300" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* CV URL */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Đường dẫn CV / Portfolio{" "}
                  <span className="text-gray-400 font-normal">(tùy chọn)</span>
                </Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={form.cvUrl}
                  onChange={(e) => handleChange("cvUrl", e.target.value)}
                  className="border-gray-200 focus-visible:ring-indigo-500"
                />
              </div>

              {/* Cover letter */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Thư giới thiệu{" "}
                  <span className="text-gray-400 font-normal">(tùy chọn)</span>
                </Label>
                <Textarea
                  placeholder="Hãy chia sẻ đôi điều về bản thân và lý do bạn phù hợp với vị trí này..."
                  value={form.coverLetter}
                  onChange={(e) => handleChange("coverLetter", e.target.value)}
                  rows={4}
                  className="resize-none border-gray-200 focus-visible:ring-indigo-500 leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-gray-200 text-gray-600"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
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
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-gray-200 shadow-sm">
          <CardContent className="pt-10 pb-10 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto">
              <BriefcaseBusiness className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Không tìm thấy vị trí
            </p>
            <p className="text-sm text-gray-500">
              Vị trí này có thể đã bị gỡ bỏ hoặc không tồn tại.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/recruitments")}
              className="mt-4 border-gray-200"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top bar: back + quick apply */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/recruitments")}
            className="gap-2 text-gray-500 hover:text-gray-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>

          {!isLoading && !isClosed && (
            <Button
              onClick={() => setApplyOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shrink-0"
            >
              <Send className="h-4 w-4" />
              Ứng tuyển ngay
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Meta card */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Thông tin vị trí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : (
                  <>
                    <MetaItem
                      icon={BriefcaseBusiness}
                      label="Tiêu đề"
                      value={detail?.title}
                    />
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={Building2}
                      label="Phòng ban"
                      value={
                        typeof detail?.department === "object"
                          ? (detail.department as { name: string })?.name
                          : detail?.department
                      }
                    />
                    <Separator className="bg-gray-100" />
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
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={CalendarDays}
                      label="Ngày đăng"
                      value={
                        detail?.createdAt
                          ? format(new Date(detail.createdAt), "dd/MM/yyyy")
                          : ""
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title header */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="pt-6 pb-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        {detail?.title}
                      </h1>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${detail?.level ? LEVEL_COLOR[detail.level] : ""}`}
                      >
                        {detail?.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {typeof detail?.department === "object"
                        ? (detail.department as { name: string })?.name
                        : detail?.department}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Mô tả công việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className={`h-4 ${i === 4 ? "w-2/3" : "w-full"}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: detail?.jobDescription ?? "",
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Reference Info */}
            {(isLoading || detail?.referenceInfo) && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Thông tin tham khảo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: detail?.referenceInfo ?? "",
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bottom apply CTA */}
            {!isLoading && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {isClosed
                      ? "Vị trí này hiện đã đóng tuyển"
                      : "Sẵn sàng ứng tuyển?"}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isClosed
                      ? "Hãy theo dõi các vị trí khác đang mở."
                      : "Tham gia đội ngũ của chúng tôi và tạo ra sự khác biệt."}
                  </p>
                </div>
                <div className="w-full sm:w-auto shrink-0">
                  <Button
                    onClick={() =>
                      isClosed ? navigate("/recruitments") : setApplyOpen(true)
                    }
                    className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="h-4 w-4" />
                    {isClosed ? "Xem các vị trí khác" : "Ứng tuyển ngay"}
                  </Button>
                </div>
              </div>
            )}
          </div>
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
