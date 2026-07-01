// src/features/departments/schema.ts
import { z } from "zod";

// 1. Schema cho Tạo mới & Cập nhật phòng ban
export const DepartmentFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban"),
  departmentCode: z.string().min(1, "Vui lòng nhập mã phòng ban (VD: ENG)"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type DepartmentFormValues = z.infer<typeof DepartmentFormSchema>;

// 2. Schema cho Form Thêm User vào phòng ban (Popup)
export const AddMemberSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn một nhân viên"),
});

export type AddMemberFormValues = z.infer<typeof AddMemberSchema>;
