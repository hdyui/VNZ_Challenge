// src/features/departments/services.ts
import apiClient from "@/lib/axios";
import type { DepartmentFormValues, AddMemberFormValues } from "./schema";

export const departmentApi = {
  getDepartments: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean | string;
  }) => {
    const res = await apiClient.get("/departments", { params });
    return res as any;
  },

  getDepartmentById: async (departmentId: string) => {
    const res = await apiClient.get(`/departments/${departmentId}`);
    return res as any;
  },

  createDepartment: async (data: DepartmentFormValues) => {
    const res = await apiClient.post("/departments", data);
    return res as any;
  },

  updateDepartment: async (
    departmentId: string,
    data: DepartmentFormValues,
  ) => {
    const res = await apiClient.put(`/departments/${departmentId}`, data);
    return res as any;
  },

  deleteDepartment: async (departmentId: string) => {
    const res = await apiClient.delete(`/departments/${departmentId}`);
    return res as any;
  },

  addMemberToDepartment: async (
    departmentId: string,
    data: AddMemberFormValues,
  ) => {
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

  removeMemberFromDepartment: async (departmentId: string, userId: string) => {
    const res = await apiClient.delete(
      `/departments/${departmentId}/users/${userId}`,
    );
    return res as any;
  },
};
