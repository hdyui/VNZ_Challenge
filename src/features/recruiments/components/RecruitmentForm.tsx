// src/features/recruitment/components/RecruitmentForm.tsx
import { useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
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

// NOTE: CoverImageUploader và newsApi.uploadImage hiện đang sống trong feature
// `news`. Ảnh bìa / ảnh chèn trong nội dung recruitment tái dùng tạm 2 thứ này
// để không phải build lại upload flow. Nếu về sau có endpoint upload riêng cho
// recruitment, chỉ cần đổi 2 import bên dưới.
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
  /** Slot cho action riêng của page cha, vd nút Xóa ở trang chỉnh sửa */
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

  // ─── Xử lý chèn ảnh trong nội dung (toolbar "image") ─────────────────────
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
    // BE nhận contentJson là string (JSON.stringify của Quill Delta), không
    // phải object thô — nếu gửi object sẽ bị lỗi "could not be converted to
    // System.String" ở BE.
    const contentJson = editor
      ? JSON.stringify(editor.getContents())
      : data.contentJson;
    onSubmit({ ...data, contentJson });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit
              ? "Chỉnh sửa vị trí tuyển dụng"
              : "Đăng vị trí tuyển dụng mới"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột chính: tiêu đề + nội dung */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tiêu đề vị trí
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="vd: Lập trình viên Frontend"
                    className="h-11 rounded-xl border-gray-200 bg-slate-50 text-base focus:bg-white focus:border-indigo-300"
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200 overflow-visible">
            <CardContent className="p-5 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nội dung (mô tả công việc, yêu cầu, quyền lợi...)
              </label>
              <Controller
                name="contentHtml"
                control={control}
                render={({ field }) => (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
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

        {/* Cột phụ: thông tin tuyển dụng + ảnh bìa */}
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
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
                      <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
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
                <label className="text-sm font-medium text-gray-700">
                  Cấp bậc
                </label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
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
                <label className="text-sm font-medium text-gray-700">
                  Loại hình làm việc
                </label>
                <Controller
                  name="workingType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
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
                <label className="text-sm font-medium text-gray-700">
                  Địa điểm
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="vd: Hà Nội / Hồ Chí Minh / Remote"
                      className="h-11 rounded-xl border-gray-200 bg-white"
                    />
                  )}
                />
                {errors.location && (
                  <p className="text-xs text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
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
                        className="h-11 rounded-xl border-gray-200 bg-white"
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
                  <label className="text-sm font-medium text-gray-700">
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
                        className="h-11 rounded-xl border-gray-200 bg-white"
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
                <label className="text-sm font-medium text-gray-700">
                  Hạn nộp hồ sơ
                </label>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="datetime-local"
                      {...field}
                      className="h-11 rounded-xl border-gray-200 bg-white"
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
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white">
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

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ảnh bìa
              </label>
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
      </div>
    </form>
  );
};

export default RecruitmentForm;
