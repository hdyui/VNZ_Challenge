import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useApplyRecruitment,
  usePublicRecruitmentDetail,
  useGetRecruitmentViewDetail,
  useCountRecruitmentViewer,
} from "../hooks/useRecruitment";
import { ApplyFormSchema, type ApplyFormSchemaType } from "../schema";

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
  CalendarDays,
  CheckCircle2,
  Loader2,
  Send,
  TrendingUp,
  MapPin,
  Users,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import type { RecruitmentLevel } from "../type";

const LEVEL_COLOR: Record<RecruitmentLevel, string> = {
  all: "bg-slate-100 text-slate-700 border-slate-200",
  Intern: "bg-slate-100 text-slate-700 border-slate-200",
  Fresher: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Junior: "bg-sky-50 text-sky-700 border-sky-200",
  Middle: "bg-violet-50 text-violet-700 border-violet-200",
  Senior:
    "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200",
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
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F6B66]/10 mt-0.5">
      <Icon className="h-4 w-4 text-[#0F6B66]" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
    </div>
  </div>
);

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
  const [submitted, setSubmitted] = useState(false);
  const { mutate: applyRecruitment, isPending } = useApplyRecruitment();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyFormSchemaType>({
    resolver: zodResolver(ApplyFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      cvFile: undefined,
    },
  });

  const onSubmit = (data: ApplyFormSchemaType) => {
    applyRecruitment(
      {
        recruitmentId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cvFile: data.cvFile,
      },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      reset();
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Đã nộp đơn ứng tuyển!
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Tài khoản và thông tin đơn ứng tuyển đã được gửi về email của
                bạn. Vui lòng kiểm tra hòm thư.
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Ứng tuyển vị trí này
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {positionTitle && (
                  <span className="font-medium text-[#0F6B66]">
                    {positionTitle}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Nguyễn Văn A"
                      className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.fullName ? "border-red-300" : ""}`}
                    />
                  )}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@email.com"
                        className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.email ? "border-red-300" : ""}`}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        placeholder="0901 234 567"
                        className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.phone ? "border-red-300" : ""}`}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Địa chỉ{" "}
                  <span className="text-gray-400 font-normal">(tùy chọn)</span>
                </Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Nhập địa chỉ hiện tại của bạn"
                      className="border-gray-200 focus-visible:ring-indigo-500"
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Tải lên CV (PDF) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="cvFile"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      {...rest}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.cvFile ? "border-red-300" : ""}`}
                    />
                  )}
                />
                {errors.cvFile && (
                  <p className="text-xs text-red-500">
                    {errors.cvFile.message as string}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-slate-200 text-slate-600"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 bg-[#0F6B66] hover:bg-[#0B4F4B] shadow-lg shadow-[#0F6B66]/25 min-w-[120px]"
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const RecruitmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // DÙNG ĐÚNG HOOK CỦA TRANG CHI TIẾT
  const { data, isLoading, isError } = usePublicRecruitmentDetail(id ?? "");
  const { mutate: countView } = useCountRecruitmentViewer();
  const { data: viewDetailData } = useGetRecruitmentViewDetail(id ?? "");

  const [applyOpen, setApplyOpen] = useState(false);

  const detail = data?.value;
  const isClosed = detail?.status === "Closed";

  // Lấy view thực tế
  const rawViewData = viewDetailData?.value as any;
  const realViewCount =
    rawViewData && typeof rawViewData === "object"
      ? (rawViewData.viewCount ?? 0) // Nếu là Object thì chui vào lấy đúng thuộc tính viewCount
      : (rawViewData ?? detail?.viewCount ?? 0); // Nếu BE hâm hâm trả về số thì lấy số
  // Đếm lượt View (Chỉ Guest và Applicant)
  useEffect(() => {
    if (id) {
      const currentRole = localStorage.getItem("userRole");

      if (
        !currentRole ||
        currentRole === "Applicant" ||
        currentRole === "Employee"
      ) {
        countView(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F6B66]/5 via-white to-white p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl">
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
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/recruitments")}
            className="gap-2 text-slate-500 hover:text-slate-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
          {!isLoading && !isClosed && (
            <Button
              onClick={() => setApplyOpen(true)}
              className="gap-2 bg-[#0F6B66] hover:bg-[#0B4F4B] shadow-lg shadow-[#0F6B66]/25 shrink-0"
            >
              <Send className="h-4 w-4" /> Ứng tuyển ngay
            </Button>
          )}
        </div>

        {!isLoading && detail?.coverImageUrl && (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={detail.coverImageUrl}
              alt={detail.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Thông tin vị trí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
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
                    <Separator className="bg-slate-100" />
                    <MetaItem
                      icon={MapPin}
                      label="Địa điểm"
                      value={detail?.location || "Chưa cập nhật"}
                    />
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={Clock}
                      label="Loại hình làm việc"
                      value={detail?.workingType || "Chưa cập nhật"}
                    />
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={Users}
                      label="Số lượng tuyển"
                      value={
                        detail?.hiringQuantity
                          ? `${detail.hiringQuantity} người`
                          : "Không giới hạn"
                      }
                    />
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={CalendarDays}
                      label="Hạn nộp hồ sơ"
                      value={
                        detail?.deadline
                          ? format(
                              new Date(detail.deadline),
                              "dd/MM/yyyy HH:mm",
                            )
                          : "Chưa cập nhật"
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
                    <Separator className="bg-gray-100" />
                    <MetaItem
                      icon={Eye}
                      label="Lượt xem"
                      value={realViewCount}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-5">
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
                      <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        {detail?.title}
                      </h1>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${detail?.level ? LEVEL_COLOR[detail.level] : ""}`}
                      >
                        {detail?.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {typeof detail?.department === "object"
                          ? (detail.department as { name: string })?.name
                          : detail?.department}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {detail?.location || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Chi tiết công việc
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
                    className="prose prose-sm prose-indigo max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: detail?.contentHtml || "Chưa có mô tả công việc.",
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {!isLoading && (
              <div className="relative overflow-hidden rounded-2xl border border-[#0F6B66]/15 bg-gradient-to-r from-[#0F6B66]/5 via-white to-amber-50/40 p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#0F6B66]/10 blur-3xl" />
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
                    className="w-full sm:w-auto gap-2 bg-[#0F6B66] hover:bg-[#0B4F4B] shadow-lg shadow-[#0F6B66]/25"
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
