import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteRecruitment,
  usePublicRecruitmentDetail,
  useUpdateRecruitment,
  useDepartments,
} from "../hooks/useRecruitment";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import type { RecruitmentLevel, RecruitmentStatus } from "../type";

const LEVEL_OPTIONS: RecruitmentLevel[] = [
  "Intern",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
];

const STATUS_OPTIONS: { label: string; value: RecruitmentStatus }[] = [
  { label: "Đang mở (Open)", value: "Open" },
  { label: "Bản nháp (Draft)", value: "Draft" },
  { label: "Đã đóng (Closed)", value: "Closed" },
];

interface FormState {
  title: string;
  departmentId: string;
  level: RecruitmentLevel | "";
  status: RecruitmentStatus | "";
  jobDescription: string;
  referenceInfo: string;
}

type FieldError = Partial<Record<keyof FormState, string>>;

const validate = (form: FormState): FieldError => {
  const errors: FieldError = {};
  const jobDescription = (form.jobDescription ?? "").trim();

  if (!form.title.trim()) errors.title = "Tiêu đề là bắt buộc.";
  if (!form.departmentId.trim()) errors.departmentId = "Phòng ban là bắt buộc.";
  if (!form.level) errors.level = "Cấp bậc là bắt buộc.";
  if (!form.status) errors.status = "Trạng thái là bắt buộc.";
  if (!jobDescription) errors.jobDescription = "Mô tả công việc là bắt buộc.";
  return errors;
};

const FieldWrapper = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-2 gap-5">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

const RecruitmentUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = usePublicRecruitmentDetail(id ?? "");
  const detail = data?.value;

  const { mutate: updateRecruitment, isPending: isSubmitting } =
    useUpdateRecruitment();
  const { mutate: deleteRecruitment, isPending: isDeleting } =
    useDeleteRecruitment();
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useDepartments();
  const departments = departmentsData?.value?.items ?? [];

  const [form, setForm] = useState<FormState>({
    title: "",
    departmentId: "",
    level: "",
    status: "",
    jobDescription: "",
    referenceInfo: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form once detail loads
  useEffect(() => {
    if (detail) {
      const departmentId =
        typeof detail.department === "object"
          ? (detail.department as { id: string })?.id
          : detail.department;
      setForm({
        title: detail.title ?? "",
        departmentId,
        level: detail.level ?? "",
        status: (detail.status as RecruitmentStatus) || "",
        jobDescription: detail.jobDescription ?? "",
        referenceInfo: detail.referenceInfo ?? "",
      });
    }
  }, [detail]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    if (!id) return;

    setSubmitError(null);
    updateRecruitment(
      {
        id,
        title: form.title,
        departmentId: form.departmentId,
        level: form.level as RecruitmentLevel,
        status: form.status as RecruitmentStatus,
        jobDescription: form.jobDescription ?? "",
        referenceInfo: form.referenceInfo ?? "",
      },
      {
        onSuccess: () => navigate(`/admin/recruitments/${id}`),
        onError: () => setSubmitError("Cập nhật thất bại, vui lòng thử lại."),
      },
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteRecruitment(id, {
      onSuccess: () => navigate("/admin/recruitments"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 text-gray-500 hover:text-gray-800 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <BriefcaseBusiness className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Chỉnh sửa vị trí
              </h1>
              <p className="text-sm text-gray-500">
                {isLoading ? (
                  <Skeleton className="h-4 w-40 mt-1" />
                ) : (
                  (detail?.title ?? "Đang tải...")
                )}
              </p>
            </div>
          </div>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading || isDeleting}
                className="gap-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa vị trí này?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa vĩnh viễn{" "}
                  <strong>&ldquo;{detail?.title}&rdquo;</strong>. Thao tác này
                  không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-200">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Đồng ý xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Basic Info */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Thông tin cơ bản
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Cập nhật các thông tin chính của vị trí này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <FormSkeleton />
            ) : (
              <>
                <FieldWrapper
                  label="Tiêu đề vị trí"
                  required
                  error={errors.title}
                >
                  <Input
                    placeholder="vd: Lập trình viên Frontend"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={`border-gray-200 focus-visible:ring-indigo-500 ${errors.title ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                  />
                </FieldWrapper>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FieldWrapper
                    label="Phòng ban"
                    required
                    error={errors.departmentId}
                  >
                    <Select
                      value={form.departmentId}
                      onValueChange={(v) => handleChange("departmentId", v)}
                      disabled={isLoadingDepartments}
                    >
                      <SelectTrigger
                        className={`border-gray-200 ${errors.departmentId ? "border-red-300" : ""}`}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingDepartments
                              ? "Đang tải phòng ban..."
                              : "Chọn phòng ban"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>

                  <FieldWrapper label="Cấp bậc" required error={errors.level}>
                    <Select
                      value={form.level}
                      onValueChange={(v) => handleChange("level", v)}
                    >
                      <SelectTrigger
                        className={`border-gray-200 ${errors.level ? "border-red-300" : ""}`}
                      >
                        <SelectValue placeholder="Chọn cấp bậc" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Trạng thái" required error={errors.status}>
                  <Select
                    value={form.status}
                    onValueChange={(v) => handleChange("status", v)}
                  >
                    <SelectTrigger
                      className={`border-gray-200 sm:w-1/2 ${errors.status ? "border-red-300" : ""}`}
                    >
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Nội dung
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Cập nhật mô tả công việc và các tài liệu tham khảo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 ${i === 5 ? "w-2/3" : "w-full"}`}
                  />
                ))}
              </div>
            ) : (
              <>
                <FieldWrapper
                  label="Mô tả công việc"
                  required
                  error={errors.jobDescription}
                >
                  <Textarea
                    placeholder="Mô tả trách nhiệm, yêu cầu..."
                    value={form.jobDescription}
                    onChange={(e) =>
                      handleChange("jobDescription", e.target.value)
                    }
                    rows={8}
                    className={`resize-none border-gray-200 focus-visible:ring-indigo-500 leading-relaxed ${errors.jobDescription ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {(form.jobDescription ?? "").length} ký tự
                  </p>
                </FieldWrapper>

                <Separator className="bg-gray-100" />

                <FieldWrapper
                  label="Thông tin tham khảo"
                  error={errors.referenceInfo}
                >
                  <Textarea
                    placeholder="Liên kết tùy chọn, mức lương, hoặc ghi chú bổ sung..."
                    value={form.referenceInfo}
                    onChange={(e) =>
                      handleChange("referenceInfo", e.target.value)
                    }
                    rows={4}
                    className="resize-none border-gray-200 focus-visible:ring-indigo-500 leading-relaxed"
                  />
                </FieldWrapper>
              </>
            )}
          </CardContent>
        </Card>

        {submitError && (
          <p className="text-sm text-red-500 text-right">{submitError}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/recruitments/${id}`)}
            disabled={isSubmitting}
            className="border-gray-200 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentUpdatePage;
