import apiClient from "@/lib/axios";
import type { UpdateProfileRequest } from "./type";
import type {
  CreateAccountFormValues,
  UpdateAccountFormValues,
  ResetPasswordFormValues,
} from "./schema";

export const userApi = {
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest,
  ): Promise<any> {
    return apiClient.put(`/users/${userId}`, data);
  },

  uploadFile: async (file: File, folder: string): Promise<any> => {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("Folder", folder);
    const res = await apiClient.post("/auth/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // console.log("Sự thật về biến res:", res);
    return res;
  },
  getUserById: async (userId: string) => {
    const res = await apiClient.get(`/users/${userId}`);
    return res as any;
  },

  deleteUser: async (userId: string) => {
    const res = await apiClient.delete(`/users/${userId}`);
    return res as any;
  },
};

export const accountApi = {
  getAccounts: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const res = await apiClient.get("/accounts", { params });
    return res;
  },

  getAccountById: async (accountId: string) => {
    const res = await apiClient.get(`/accounts/${accountId}`);
    return res as any;
  },

  createAccount: async (data: CreateAccountFormValues) => {
    const formData = new FormData();

    formData.append("Email", data.email);
    formData.append("Password", data.password);
    formData.append("Role", data.role);
    formData.append("Status", data.status);
    formData.append("FirstName", data.firstName);
    formData.append("LastName", data.lastName);
    formData.append("Position", data.position);
    formData.append("Phone", data.phone);

    if (data.address) formData.append("Address", data.address);
    if (data.hobby) formData.append("Hobby", data.hobby);
    if (data.quote) formData.append("Quote", data.quote);

    if (data.avatarImg?.[0]) formData.append("AvatarImg", data.avatarImg[0]);
    if (data.coverImg?.[0]) formData.append("CoverImg", data.coverImg[0]);

    const res = await apiClient.post("/accounts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res as any;
  },

  updateAccount: async (accountId: string, data: UpdateAccountFormValues) => {
    const res = await apiClient.put(`/accounts/${accountId}`, data);
    return res as any;
  },

  resetPassword: async (accountId: string, data: ResetPasswordFormValues) => {
    const res = await apiClient.put(
      `/accounts/${accountId}/reset-password`,
      data,
    );
    return res as any;
  },

  deleteAccount: async (accountId: string) => {
    const res = await apiClient.delete(`/accounts/${accountId}`);
    return res as any;
  },
};
