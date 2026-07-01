import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store";
import { queryClient } from "@/lib/queryClient";
import type { UpdateProfileRequest } from "@/features/employees/type";
import { userApi } from "@/features/employees/services";

export const useUserDetailQuery = (userId?: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUserById(userId as string),
  });
};

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateProfileRequest;
    }) => {
      return userApi.updateProfile(userId, data);
    },
    onSuccess: () => {
      toast.success("Cập nhật hồ sơ thành công!");
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại!");
      console.log("Lỗi update profile:", error.response?.data);
    },
  });
};

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) => {
      return userApi.uploadFile(file, folder);
    },
  });
};

export const useDeleteAccountMutation = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("Đã xoá tài khoản. Hẹn gặp lại bạn!");
      clearAuth();
      queryClient.removeQueries();
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Xoá tài khoản thất bại, thử lại nhé!",
      );
      console.log("Lỗi xoá tài khoản:", error.response?.data);
    },
  });
};
