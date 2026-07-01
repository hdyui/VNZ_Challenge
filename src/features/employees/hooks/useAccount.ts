// src/features/accounts/hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "../services";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Hoặc thư viện toast bác đang xài (react-toastify)

// Quản lý key của React Query để dễ xóa cache
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters: any) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

// 1. Hook Lấy danh sách
export const useAccountList = (filters: any) => {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => accountApi.getAccounts(filters),
  });
};

// 2. Hook Lấy chi tiết
export const useAccountDetail = (id: string) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountApi.getAccountById(id),
    enabled: !!id, // Chỉ gọi API khi có id
  });
};

// 3. Hook Tạo mới (Create)
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: accountApi.createAccount,
    onSuccess: () => {
      toast.success("Tạo tài khoản nhân viên thành công!");
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      navigate("/admin/accounts"); // Chuyển về trang danh sách
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Tạo thất bại. Có thể email đã tồn tại!",
      );
    },
  });
};

// 4. Hook Cập nhật (Update)
export const useUpdateAccount = (id: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: any) => accountApi.updateAccount(id, data),
    onSuccess: () => {
      toast.success("Cập nhật tài khoản thành công!");
      queryClient.invalidateQueries({ queryKey: accountKeys.details() });
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      navigate("/admin/accounts");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại!");
    },
  });
};

// 5. Hook Xóa (Delete)
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.deleteAccount,
    onSuccess: () => {
      toast.success("Đã khóa/xóa tài khoản thành công!");
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Không thể xóa tài khoản này!",
      );
    },
  });
};

// 6. Hook Đổi mật khẩu (Reset Password)
export const useResetPassword = (id: string) => {
  return useMutation({
    mutationFn: (data: any) => accountApi.resetPassword(id, data),

    onSuccess: () => {
      // Thông báo khi thành công (Không cần invalidateQueries vì đổi pass không ảnh hưởng UI)
      toast.success("Đặt lại mật khẩu thành công!");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại!",
      );
    },
  });
};
