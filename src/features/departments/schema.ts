import { z } from "zod";

export const DepartmentFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phòng ban"),
  departmentCode: z.string().min(1, "Vui lòng nhập mã phòng ban (VD: ENG)"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type DepartmentFormValues = z.infer<typeof DepartmentFormSchema>;

export const AddMemberSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn một nhân viên"),
});

export type AddMemberFormValues = z.infer<typeof AddMemberSchema>;
