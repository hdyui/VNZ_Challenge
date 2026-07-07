import apiClient from "@/lib/axios";

import type { UpdateProfilePayload } from "./hooks/useUser";
import type { ApiResponse } from "@/shared/types/types";

export const userApi = {
  updateProfile: (userId: string, data: UpdateProfilePayload) => {
    const fd = new FormData();

    const text: Record<string, any> = {
      FirstName: data.firstName,
      LastName: data.lastName,
      Position: data.position,
      Phone: data.phone,
      Address: data.address,
      Hobby: data.hobby,
      Quote: data.quote,
    };
    Object.entries(text).forEach(([k, v]) => {
      if (v != null) fd.append(k, String(v));
    });

    // Ảnh là File -> gửi file; là URL string -> gửi string; null -> bỏ (giữ ảnh cũ)
    if (data.avatarImg != null) fd.append("AvatarImg", data.avatarImg as any);
    if (data.coverImg != null) fd.append("CoverImg", data.coverImg as any);

    return apiClient.put(`/users/${userId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // POST /auth/uploads (giữ lại nếu nơi khác cần)
  uploadFile: (file: File, folder: string) => {
    const fd = new FormData();
    fd.append("File", file);
    fd.append("Folder", folder);
    return apiClient.post("/auth/uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),

  // ==================== QUẢN LÝ NGHỈ PHÉP (LEAVE APPLICATION) ====================

  // 1. Xin nghỉ dài ngày
  async createLeaveApplication(payload: any): Promise<ApiResponse<null>> {
    return apiClient.post("/leave-application", payload) as unknown as Promise<
      ApiResponse<null>
    >;
  },

  // 2. Lấy danh sách ca làm việc để xin nghỉ
  async getWorkSchedules(params: {
    FromDate: string;
    ToDate: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get("/schedule-leave-application/me/work-schedules", {
      params,
    }) as unknown as Promise<ApiResponse<any>>;
  },

  // 3. Xin nghỉ theo ca

  async createScheduleLeave(
    workScheduleId: string,
    payload: any,
  ): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/schedule-leave-application/${workScheduleId}`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // 4. Lấy danh sách lịch sử xin nghỉ của tôi
  async getMyLeaves(params: any): Promise<ApiResponse<any>> {
    return apiClient.get("/leave-application/me", {
      params,
    }) as unknown as Promise<ApiResponse<any>>;
  },

  // 5. Lấy chi tiết 1 đơn xin nghỉ
  async getLeaveDetail(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/leave-application/me/${id}`) as unknown as Promise<
      ApiResponse<any>
    >;
  },

  // 6. Hủy đơn xin nghỉ (Chỉ dùng khi Pending)
  async cancelLeave(id: string): Promise<ApiResponse<null>> {
    return apiClient.patch(
      `/leave-application/${id}/cancel`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
