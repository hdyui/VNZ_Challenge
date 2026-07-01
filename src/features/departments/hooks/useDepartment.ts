// src/features/departments/hooks/useDepartment.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { departmentApi } from "../services";
import type { DepartmentFormValues, AddMemberFormValues } from "../schema";
import { queryClient } from "@/lib/queryClient";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  // Dùng inline type cho params vì trong types.ts của bạn chưa định nghĩa DepartmentQueryParams
  list: (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean | string;
  }) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// ─── GET /departments ─────────────────────────────────────────────────────────
export const useDepartmentList = (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | string;
}) => {
  return useQuery({
    queryKey: departmentKeys.list(params ?? {}),
    queryFn: () => departmentApi.getDepartments(params || {}),
  });
};

// ─── GET /departments/:id ─────────────────────────────────────────────────────
export const useDepartmentDetail = (id: string) => {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.getDepartmentById(id),
    enabled: !!id,
  });
};

// ─── POST /departments ────────────────────────────────────────────────────────
export const useCreateDepartment = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: DepartmentFormValues) =>
      departmentApi.createDepartment(data),
    onSuccess: (res) => {
      toast.success("Tạo phòng ban thành công");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      // Lấy ID từ res.value.id (do API bọc trong value)
      navigate(`/admin/departments/${res.value?.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Tạo phòng ban thất bại");
    },
  });
};

// ─── PUT /departments/:id ─────────────────────────────────────────────────────
export const useUpdateDepartment = (id: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: DepartmentFormValues) =>
      departmentApi.updateDepartment(id, data),
    onSuccess: () => {
      toast.success("Cập nhật phòng ban thành công");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      navigate(`/admin/departments/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    },
  });
};

// ─── DELETE /departments/:id ──────────────────────────────────────────────────
export const useDeleteDepartment = () => {
  return useMutation({
    mutationFn: (id: string) => departmentApi.deleteDepartment(id),
    onSuccess: () => {
      toast.success("Xóa phòng ban thành công");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Xóa thất bại (Có thể do còn nhân viên)",
      );
    },
  });
};

// ─── POST /departments/:id/users ──────────────────────────────────────────────
export const useAddUserToDepartment = (departmentId: string) => {
  return useMutation({
    // Type bây giờ lấy đúng AddMemberFormValues từ schema.ts của bạn
    mutationFn: (data: AddMemberFormValues) =>
      departmentApi.addMemberToDepartment(departmentId, data),
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công");
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(departmentId),
      });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Thêm nhân viên thất bại");
    },
  });
};

// ─── DELETE /departments/:id/users/:userId ────────────────────────────────────
export const useRemoveUserFromDepartment = (departmentId: string) => {
  return useMutation({
    mutationFn: (userId: string) =>
      departmentApi.removeMemberFromDepartment(departmentId, userId),
    onSuccess: () => {
      toast.success("Đã xóa nhân viên khỏi phòng ban");
      queryClient.invalidateQueries({
        queryKey: departmentKeys.detail(departmentId),
      });
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xóa nhân viên thất bại");
    },
  });
};
