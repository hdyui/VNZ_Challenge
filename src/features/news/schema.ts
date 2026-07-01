// src/features/news/schema.ts
import { z } from "zod";

export const NewsFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tiêu đề là bắt buộc" })
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(255, { message: "Tiêu đề không được quá 255 ký tự" }),

  coverImg: z
    .string()
    .url({ message: "URL ảnh bìa không hợp lệ" })
    .optional()
    .or(z.literal("")),

  contentHtml: z.string().min(1, { message: "Nội dung bài viết là bắt buộc" }),

  contentJson: z.any().optional(),

  status: z.enum(["draft", "published", "archived"], {
    error: "Trạng thái là bắt buộc",
  }),
});

export type NewsFormSchemaType = z.infer<typeof NewsFormSchema>;
