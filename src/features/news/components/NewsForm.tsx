// src/features/news/components/NewsForm.tsx
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { NewsFormSchema, type NewsFormSchemaType } from "../schema";
import { RichTextEditor } from "@/shared/components/ui/RichTextEditor";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { NewsStatus } from "../type";
import { Link } from "react-router-dom";

interface NewsFormProps {
  initialData?: {
    title: string;
    coverImg: string;
    contentHtml: string;
    contentJson?: object;
    status: NewsStatus;
  };
  onSubmit: (data: NewsFormSchemaType) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const STATUS_OPTIONS: { value: NewsStatus; label: string }[] = [
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Xuất bản" },
  { value: "archived", label: "Lưu trữ" },
];

export const NewsForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: NewsFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewsFormSchemaType>({
    resolver: zodResolver(NewsFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      coverImg: initialData?.coverImg ?? "",
      contentHtml: initialData?.contentHtml ?? "",
      contentJson: initialData?.contentJson,
      status: initialData?.status ?? "draft",
    },
  });

  const coverImgValue = watch("coverImg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // coverImgValue có thể là File (ảnh mới vừa chọn, chưa upload) hoặc string (URL ảnh cũ).
  // Với File, tạo object URL tạm để preview, và luôn thu hồi URL cũ khi value đổi/unmount.
  const [displayUrl, setDisplayUrl] = useState<string>(
    typeof initialData?.coverImg === "string" ? initialData.coverImg : "",
  );

  useEffect(() => {
    if (coverImgValue instanceof File) {
      const objectUrl = URL.createObjectURL(coverImgValue);
      setDisplayUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setDisplayUrl((coverImgValue as string) || "");
  }, [coverImgValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp hình ảnh");
      return;
    }

    // Chỉ giữ File trong form, sẽ upload cùng lúc với submit (multipart/form-data)
    setValue("coverImg", file, { shouldValidate: true });
    e.target.value = "";
  };

  const handleRemoveCoverImg = () => {
    setValue("coverImg", "", { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="max-w-5xl mx-auto shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800">
          {isEdit ? "Cập nhật bài viết" : "Tạo bài viết mới"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Tiêu đề */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700"
            >
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Nhập tiêu đề ấn tượng..."
              className="focus-visible:ring-blue-500"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Trạng thái <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48">
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
              )}
            />
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Ảnh bìa */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Ảnh bìa <span className="text-red-500">*</span>
            </Label>

            {/* input file ẩn, trigger bằng nút bấm */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {displayUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 group">
                <img
                  src={displayUrl}
                  alt="Cover preview"
                  className="h-48 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Đổi ảnh
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveCoverImg}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
                {coverImgValue instanceof File && (
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                    Ảnh mới — sẽ tải lên khi lưu
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Nhấn để chọn ảnh bìa</span>
              </button>
            )}

            {errors.coverImg && (
              <p className="text-xs text-red-500">
                {errors.coverImg.message as string}
              </p>
            )}
          </div>

          {/* Nội dung Rich Text */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Nội dung bài viết <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="contentHtml"
              control={control}
              render={({ field }) => (
                <div className="border rounded-md overflow-hidden">
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {errors.contentHtml && (
              <p className="text-xs text-red-500">
                {errors.contentHtml.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 bg-gray-50/50 px-6 py-4 border-t">
          <Link to="/admin/news" tabIndex={isLoading ? -1 : 0}>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-24 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-40 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Xuất bản ngay"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
