// src/features/accounts/hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "../services";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters: any) => [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

export const useAccountList = (filters: any) => {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => accountApi.getAccounts(filters),
  });
};

export const useAccountDetail = (id: string) => {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountApi.getAccountById(id),
    enabled: !!id,
  });
};

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

export const useResetPassword = (id: string) => {
  return useMutation({
    mutationFn: (data: any) => accountApi.resetPassword(id, data),

    onSuccess: () => {
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
