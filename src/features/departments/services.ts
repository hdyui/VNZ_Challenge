// src/features/departments/services.ts
import apiClient from "@/lib/axios";
import type { DepartmentFormValues, AddMemberFormValues } from "./schema";

export const departmentApi = {
  // 1. Lấy danh sách (Có phân trang, search, filter isActive)
  getDepartments: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean | string;
  }) => {
    const res = await apiClient.get("/departments", { params });
    return res as any; // Bịt miệng TypeScript, đón lõng vỏ "value" ở UI
  },

  // 2. Lấy chi tiết phòng ban (Kèm list thành viên)
  getDepartmentById: async (departmentId: string) => {
    const res = await apiClient.get(`/departments/${departmentId}`);
    return res as any;
  },

  // 3. Tạo mới phòng ban (Gửi JSON bình thường, KHÔNG dùng FormData)
  createDepartment: async (data: DepartmentFormValues) => {
    const res = await apiClient.post("/departments", data);
    return res as any;
  },

  // 4. Cập nhật thông tin phòng ban
  updateDepartment: async (
    departmentId: string,
    data: DepartmentFormValues,
  ) => {
    const res = await apiClient.put(`/departments/${departmentId}`, data);
    return res as any;
  },

  // 5. Xóa (Soft Delete) phòng ban
  deleteDepartment: async (departmentId: string) => {
    const res = await apiClient.delete(`/departments/${departmentId}`);
    return res as any;
  },

  // 6. Thêm User vào phòng ban
  addMemberToDepartment: async (
    departmentId: string,
    data: AddMemberFormValues,
  ) => {
    // API yêu cầu có joinedAt, mình lấy luôn giờ hiện tại của hệ thống gửi lên
    const payload = {
      userId: data.userId,
      joinedAt: new Date().toISOString(),
    };
    const res = await apiClient.post(
      `/departments/${departmentId}/users`,
      payload,
    );
    return res as any;
  },

  // 7. Xóa User khỏi phòng ban
  removeMemberFromDepartment: async (departmentId: string, userId: string) => {
    const res = await apiClient.delete(
      `/departments/${departmentId}/users/${userId}`,
    );
    return res as any;
  },
};
