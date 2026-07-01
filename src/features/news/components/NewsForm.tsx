// src/features/news/components/NewsForm.tsx
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
            <Label
              htmlFor="coverImg"
              className="text-sm font-semibold text-gray-700"
            >
              URL Ảnh bìa
            </Label>
            <Input
              id="coverImg"
              {...register("coverImg")}
              placeholder="https://example.com/image.png"
              className="focus-visible:ring-blue-500"
            />
            {errors.coverImg && (
              <p className="text-xs text-red-500">{errors.coverImg.message}</p>
            )}
            {coverImgValue && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                <img
                  src={coverImgValue}
                  alt="Cover preview"
                  className="h-48 w-full object-cover"
                />
              </div>
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
