// src/features/auth/hooks/useCurrentUserRole.ts
//
// ⚠️ GIẢ ĐỊNH: file `stores.ts` bạn upload lên đang trống nên chưa biết auth
// store thật của dự án được implement thế nào (Zustand/Context/Redux...).
// Hook này viết tạm để CommentSection có chỗ lấy role — hãy thay phần bên
// trong bằng cách lấy user/role thực tế từ store auth hiện có của bạn.
//
// Yêu cầu bắt buộc: phải trả về đúng 1 trong 4 giá trị bên dưới, khớp với
// logic phân quyền đã thống nhất (Anonymous ẩn form, Applicant/Employee/Admin
// thấy form, chỉ Admin thấy nút xóa/ẩn comment).

export type AppRole = "anonymous" | "applicant" | "employee" | "admin";

// import { useAuthStore } from "@/features/auth/stores"; // TODO: bật lại khi có store thật

export const useCurrentUserRole = (): AppRole => {
  // TODO: thay đoạn dưới bằng store thật, ví dụ:
  // const user = useAuthStore((s) => s.user);
  // if (!user) return "anonymous";
  // return (user.role?.toLowerCase() as AppRole) ?? "anonymous";

  const user = null as null | { role: AppRole };
  if (!user) return "anonymous";
  return user.role;
};
