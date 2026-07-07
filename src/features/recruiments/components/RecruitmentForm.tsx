// src/features/recruitment/components/RecruitmentForm.tsx
import { useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Loader2,
  Save,
  FileText,
  ListChecks,
  CalendarRange,
  ImageIcon,
  Briefcase, // Đã thêm icon Briefcase cho phần thông tin chung
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  RecruitmentFormSchema,
  EMPTY_RECRUITMENT_FORM,
  RECRUITMENT_LEVELS,
  RECRUITMENT_STATUSES,
  WORKING_TYPES,
  WORKING_TYPE_LABELS,
  type RecruitmentFormSchemaType,
} from "../schema";
import { useDepartments } from "../hooks/useRecruitment";

import { CoverImageUploader } from "@/features/news/components/CoverImageUploader";
import { newsApi } from "@/features/news/services";

const STATUS_LABELS: Record<(typeof RECRUITMENT_STATUSES)[number], string> = {
  Open: "Đang mở (Open)",
  Draft: "Bản nháp (Draft)",
  Closed: "Đã đóng (Closed)",
};

interface RecruitmentFormProps {
  initialData?: Partial<RecruitmentFormSchemaType>;
  onSubmit: (data: RecruitmentFormSchemaType) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  headerExtra?: React.ReactNode;
}

export const RecruitmentForm = ({
  initialData,
  onSubmit,
  isLoading,
  isEdit,
  headerExtra,
}: RecruitmentFormProps) => {
  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill>(null);

  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useDepartments();
  const departments = departmentsData?.value?.items ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruitmentFormSchemaType>({
    resolver: zodResolver(RecruitmentFormSchema),
    defaultValues: { ...EMPTY_RECRUITMENT_FORM, ...initialData },
  });

  const imageHandler = useMemo(
    () =>
      async function (this: any) {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const editor = quillRef.current?.getEditor();
          const range = editor?.getSelection(true);
          if (!editor || !range) return;

          editor.insertText(range.index, "Đang tải ảnh lên...", "italic", true);

          try {
            const res = await newsApi.uploadImage(file);
            const url =
              (res.data as any)?.url ?? (res.data as any)?.urlImage ?? "";

            editor.deleteText(range.index, "Đang tải ảnh lên...".length);
            if (url) {
              editor.insertEmbed(range.index, "image", url, "user");
              editor.setSelection(range.index + 1, 0);
            }
          } catch {
            editor.deleteText(range.index, "Đang tải ảnh lên...".length);
          }
        };
      },
    [],
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );

  const submit = (data: RecruitmentFormSchemaType) => {
    const editor = quillRef.current?.getEditor();
    const contentJson = editor
      ? JSON.stringify(editor.getContents())
      : data.contentJson;
    onSubmit({ ...data, contentJson });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-gradient-to-r from-white via-white to-gray-900/5 p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit
              ? "Chỉnh sửa vị trí tuyển dụng"
              : "Đăng vị trí tuyển dụng mới"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEdit
              ? "Cập nhật thông tin và nội dung của vị trí này"
              : "Điền thông tin chi tiết để đăng tin tuyển dụng mới"}
          </p>
        </div>
        <div className="flex gap-2">
          {headerExtra}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/recruitments")}
            disabled={isLoading}
            className="border-slate-200"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="gap-2 bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/25"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "Lưu thay đổi" : "Đăng vị trí"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Thông tin cơ bản — full width */}
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 rounded-2xl overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              <Briefcase className="h-4 w-4 text-slate-400" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Tiêu đề vị trí
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="vd: Lập trình viên Frontend"
                  className="h-12 rounded-xl border-slate-200 bg-white text-lg font-medium focus:border-gray-900/40"
                />
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </CardContent>
        </Card>

        {/* 2. Ba bảng nhỏ — xếp hàng ngang */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
                <ListChecks className="h-4 w-4 text-slate-400" />
                Phân loại vị trí
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Phòng ban
                </label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingDepartments}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
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
                  )}
                />
                {errors.departmentId && (
                  <p className="text-xs text-red-500">
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Cấp bậc
                </label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                        <SelectValue placeholder="Chọn cấp bậc" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECRUITMENT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.level && (
                  <p className="text-xs text-red-500">{errors.level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Loại hình làm việc
                </label>
                <Controller
                  name="workingType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                        <SelectValue placeholder="Chọn loại hình làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {WORKING_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.workingType && (
                  <p className="text-xs text-red-500">
                    {errors.workingType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Địa điểm
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="vd: Hà Nội / Hồ Chí Minh / Remote"
                      className="h-11 rounded-xl border-slate-200 bg-white focus:border-gray-900/40"
                    />
                  )}
                />
                {errors.location && (
                  <p className="text-xs text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                Chỉ tiêu &amp; thời hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Số lượng tuyển
                  </label>
                  <Controller
                    name="hiringQuantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value ?? ""}
                        className="h-11 rounded-xl border-slate-200 bg-white focus:border-gray-900/40"
                      />
                    )}
                  />
                  {errors.hiringQuantity && (
                    <p className="text-xs text-red-500">
                      {errors.hiringQuantity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Hồ sơ tối đa
                  </label>
                  <Controller
                    name="maxApplications"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value ?? ""}
                        className="h-11 rounded-xl border-slate-200 bg-white focus:border-gray-900/40"
                      />
                    )}
                  />
                  {errors.maxApplications && (
                    <p className="text-xs text-red-500">
                      {errors.maxApplications.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Hạn nộp hồ sơ
                </label>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="datetime-local"
                      {...field}
                      className="h-11 rounded-xl border-slate-200 bg-white focus:border-gray-900/40"
                    />
                  )}
                />
                {errors.deadline && (
                  <p className="text-xs text-red-500">
                    {errors.deadline.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Trạng thái
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECRUITMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                Ảnh bìa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Controller
                name="coverImageUrl"
                control={control}
                render={({ field }) => (
                  <CoverImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.coverImageUrl && (
                <p className="text-xs text-red-500">
                  {errors.coverImageUrl.message as string}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Khung soạn nội dung mô tả — full width */}
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 rounded-2xl overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              <FileText className="h-4 w-4 text-slate-400" />
              Nội dung mô tả
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <p className="text-xs text-slate-400 -mt-1">
              Mô tả công việc, yêu cầu ứng viên và quyền lợi
            </p>
            <Controller
              name="contentHtml"
              control={control}
              render={({ field }) => (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white focus-within:border-gray-900/40 focus-within:ring-1 focus-within:ring-gray-900/15 transition-colors">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={modules}
                    placeholder="Mô tả trách nhiệm, yêu cầu ứng viên, quyền lợi..."
                    className="[&_.ql-container]:min-h-[360px] [&_.ql-container]:text-base"
                  />
                </div>
              )}
            />
            {errors.contentHtml && (
              <p className="text-xs text-red-500">
                {errors.contentHtml.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default RecruitmentForm;
