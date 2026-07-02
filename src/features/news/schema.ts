// src/features/news/schema.ts
import { z } from "zod";

export const NewsFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tiêu đề là bắt buộc" })
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(255, { message: "Tiêu đề không được quá 255 ký tự" }),

  // Ảnh bìa: File khi người dùng chọn ảnh mới, hoặc string (URL) khi giữ ảnh cũ lúc edit
  coverImg: z.union(
    [
      z.instanceof(File, { message: "Ảnh bìa là bắt buộc" }),
      z.string().min(1).url({ message: "URL ảnh bìa không hợp lệ" }),
    ],
    { error: "Ảnh bìa là bắt buộc" },
  ),

  contentHtml: z.string().min(1, { message: "Nội dung bài viết là bắt buộc" }),

  contentJson: z.any().optional(),

  status: z.enum(["draft", "published", "archived"], {
    error: "Trạng thái là bắt buộc",
  }),
});

export type NewsFormSchemaType = z.infer<typeof NewsFormSchema>;
