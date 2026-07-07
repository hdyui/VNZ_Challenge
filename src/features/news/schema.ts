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
  // Delta JSON của Quill — dùng để khôi phục lại editor khi edit mà không
  // mất định dạng phức tạp (nếu BE không cần lưu, có thể bỏ field này).
  contentJson: z.any().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type NewsFormSchemaType = z.infer<typeof NewsFormSchema>;
