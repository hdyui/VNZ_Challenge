import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { userApi } from "../services";
import { useAuthStore } from "../../auth/store"; // store của feature auth
import { queryClient } from "@/lib/queryClient";

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string | null;
  address?: string | null;
  hobby?: string | null;
  quote?: string | null;
  avatarImg?: string | File | null;
  coverImg?: string | File | null;
};

// PUT /users/{id} — theo đúng pattern useUpdateAccount: truyền userId vào hook
export const useUpdateProfileMutation = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      userApi.updateProfile(userId!, data),
    onSuccess: () => {
      toast.success("Cập nhật hồ sơ thành công!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Cập nhật thất bại!"),
  });
};

// DELETE /users/{id} -> đăng xuất
export const useDeleteAccountMutation = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("Đã xoá tài khoản.");
      clearAuth();
      queryClient.removeQueries();
      navigate("/login", { replace: true });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Xoá tài khoản thất bại!"),
  });
};
