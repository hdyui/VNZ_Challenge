// src/features/news/schema.ts
import { z } from "zod";

export const NewsFormSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  coverImg: z.string().min(1, "Vui lòng chọn ảnh bìa"),
  contentHtml: z
    .string()
    .min(1, "Vui lòng nhập nội dung bài viết")
    .refine((val) => val.replace(/<[^>]*>/g, "").trim().length > 0, {
      message: "Vui lòng nhập nội dung bài viết",
    }),
  // Delta JSON của Quill, đã được JSON.stringify() thành chuỗi trước khi
  // đưa vào form state — BE nhận field này là string, không phải object.
  // (Xem NewsForm.submit(): luôn stringify editor.getContents() ở đây.)
  contentJson: z.string().optional(),
  // BE bắt buộc field này (xem Swagger POST /api/v1/news)
  type: z.enum(["Public", "Internal"]),
  status: z.enum(["draft", "published", "archived"]),
});

export type NewsFormSchemaType = z.infer<typeof NewsFormSchema>;
