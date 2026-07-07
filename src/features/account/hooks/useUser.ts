import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
export const useCreateLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => userApi.createLeaveApplication(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-leaves"] }),
  });
};

export const useGetWorkSchedules = (params: {
  FromDate: string;
  ToDate: string;
}) => {
  return useQuery({
    queryKey: ["work-schedules", params],
    queryFn: () => userApi.getWorkSchedules(params),
    enabled: !!params.FromDate && !!params.ToDate,
  });
};

export const useCreateScheduleLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Sửa lại mutationFn để nhận tham số id riêng biệt
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      userApi.createScheduleLeave(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-leaves"] }),
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.cancelLeave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-detail", id] });
    },
  });
};

// Lấy danh sách đơn
export const useGetMyLeaves = (params?: any) => {
  return useQuery({
    queryKey: ["my-leaves", params],
    queryFn: () => userApi.getMyLeaves(params),
  });
};

// Lấy chi tiết 1 đơn
export const useGetLeaveDetail = (id: string) => {
  return useQuery({
    queryKey: ["leave-detail", id],
    queryFn: () => userApi.getLeaveDetail(id),
    enabled: !!id,
  });
};
