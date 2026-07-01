import { z } from "zod";

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().min(1, "Position is required"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number"),
  address: z.string().nullable().optional(),
  hobby: z.string().nullable().optional(),
  quote: z.string().nullable().optional(),
  avatarImg: z.string().url().nullable().optional(),
  coverImg: z.string().url().nullable().optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp!",
    path: ["confirmPassword"],
  });
export type ChangePasswordTypes = z.infer<typeof ChangePasswordSchema>;

// 1. Schema cho Form Tạo Tài Khoản (Bao gồm cả thông tin User)
export const CreateAccountSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["Admin", "Employee"]),
  status: z.enum(["Active", "Inactive"]),

  // Thông tin User đi kèm
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  position: z.string().min(1, "Vui lòng nhập chức vụ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().optional(),
  hobby: z.string().optional(),
  quote: z.string().optional(),

  // File ảnh (Lưu ở dạng mảng file từ thẻ input type="file")
  avatarImg: z.any().optional(),
  coverImg: z.any().optional(),
});

export type CreateAccountFormValues = z.infer<typeof CreateAccountSchema>;

// 2. Schema cho Form Cập Nhật (Chỉ update Email, Role, Status)
export const UpdateAccountSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  role: z.enum(["Admin", "Employee"]),
  status: z.enum(["Active", "Inactive"]),
});

export type UpdateAccountFormValues = z.infer<typeof UpdateAccountSchema>;

// 3. Schema cho Form Reset Mật Khẩu
export const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp, hãy kiểm tra lại",
    path: ["confirmPassword"], // Hiển thị lỗi ngay dưới ô confirm
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;
