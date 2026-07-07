// src/features/news/components/NewsForm.tsx
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

import { NewsFormSchema, type NewsFormSchemaType } from "../schema";
import { newsApi } from "../services";
import { CoverImageUploader } from "./CoverImageUploader";

interface NewsFormProps {
  initialData?: Partial<NewsFormSchemaType>;
  onSubmit: (data: NewsFormSchemaType) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const DEFAULT_VALUES: NewsFormSchemaType = {
  title: "",
  coverImg: "",
  contentHtml: "",
  contentJson: undefined,
  type: "Public",
  status: "draft",
};

export const NewsForm = ({
  initialData,
  onSubmit,
  isLoading,
  isEdit,
}: NewsFormProps) => {
  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsFormSchemaType>({
    resolver: zodResolver(NewsFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  });

  // ─── Xử lý chèn ảnh trong nội dung bài viết (toolbar "image") ────────────
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

          // Chèn placeholder trong lúc upload
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

  const submit = (data: NewsFormSchemaType) => {
    const editor = quillRef.current?.getEditor();
    // BE nhận contentJson là string, nên phải JSON.stringify() Delta object
    // trước khi gửi đi — nếu gửi thẳng object sẽ bị lỗi
    // "The JSON value could not be converted to System.String".
    const contentJson = editor
      ? JSON.stringify(editor.getContents())
      : data.contentJson;
    onSubmit({ ...data, contentJson });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEdit
              ? "Cập nhật nội dung và thông tin bài viết"
              : "Tạo một bài viết tin tức mới"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/news")}
            disabled={isLoading}
            className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="rounded-lg bg-[#0F6B66] hover:bg-[#0B4F4B] text-white transition-colors shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? "Lưu thay đổi" : "Đăng bài"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT CHÍNH: Tiêu đề + Nội dung */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm shadow-slate-200/60 border-slate-200 bg-white transition-all">
            <CardContent className="p-6 space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Tiêu đề bài viết
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập tiêu đề bài viết..."
                    className="h-11 rounded-lg border-slate-300 bg-white text-base text-slate-900 focus:border-[#0F6B66] focus:ring-[#0F6B66]/20 transition-all shadow-sm"
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm shadow-slate-200/60 border-slate-200 bg-white overflow-visible transition-all">
            <CardContent className="p-6 space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Nội dung chi tiết
              </label>
              <Controller
                name="contentHtml"
                control={control}
                render={({ field }) => (
                  <div className="rounded-xl overflow-hidden border border-slate-300 bg-white focus-within:border-[#0F6B66] focus-within:ring-1 focus-within:ring-[#0F6B66]/20 transition-all shadow-sm">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      placeholder="Nhập nội dung bài viết..."
                      className="[&_.ql-container]:min-h-[400px] [&_.ql-container]:text-base [&_.ql-toolbar]:border-b-slate-200 [&_.ql-toolbar]:bg-slate-50/70"
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

        {/* CỘT PHỤ: Trạng thái + Ảnh bìa */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card className="rounded-2xl shadow-sm shadow-slate-200/60 border-slate-200 bg-white transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Loại tin
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-[#0F6B66] focus:ring-[#0F6B66]/20 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Công khai</SelectItem>
                        <SelectItem value="Internal">Nội bộ</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-sm font-semibold text-slate-700">
                  Trạng thái
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-[#0F6B66] focus:ring-[#0F6B66]/20 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nháp</SelectItem>
                        <SelectItem value="published">Đã xuất bản</SelectItem>
                        <SelectItem value="archived">Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm shadow-slate-200/60 border-slate-200 bg-white transition-all">
            <CardContent className="p-6">
              <Controller
                name="coverImg"
                control={control}
                render={({ field }) => (
                  <CoverImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.coverImg && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.coverImg.message as string}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};
