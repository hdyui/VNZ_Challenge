import apiClient from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";
import type {
  CreateRecruitmentPayload,
  Department,
  InterviewSession,
  PublicRecruitmentDetail,
  PublicRecruitmentItem,
  PublicRecruitmentQueryParams,
  RecruitmentApplicationPayload,
  ScheduleInterviewPayload,
  UpdateRecruitmentPayload,
} from "./type";

// ─── GET /recruitments/public ────────────────────────────────────────────────
export const publicApi = {
  // ─── GET /departments ─────────────────────────────────────────────────────────
  async getDepartments(): Promise<ApiResponse<PaginatedResponse<Department>>> {
    return apiClient.get("/departments") as unknown as Promise<
      ApiResponse<PaginatedResponse<Department>>
    >;
  },

  async getRecruitmentList(
    params?: PublicRecruitmentQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<PublicRecruitmentItem>>> {
    return apiClient.get("/recruitments/public", {
      params,
    }) as unknown as Promise<
      ApiResponse<PaginatedResponse<PublicRecruitmentItem>>
    >;
  },

  // ─── GET /public/recruitments/:id ───────────────────────────────────────────
  async getRecruitmentById(
    id: string,
  ): Promise<ApiResponse<PublicRecruitmentDetail>> {
    return apiClient.get(`/recruitments/${id}`) as unknown as Promise<
      ApiResponse<PublicRecruitmentDetail>
    >;
  },

  // ─── POST /recruitments ──────────────────────────────────────────────────────
  async createRecruitment(
    payload: CreateRecruitmentPayload,
  ): Promise<ApiResponse<PublicRecruitmentDetail>> {
    return apiClient.post("/recruitments", payload) as unknown as Promise<
      ApiResponse<PublicRecruitmentDetail>
    >;
  },

  // ─── PUT /recruitments/:id ───────────────────────────────────────────────────
  async updateRecruitment({
    id,
    ...payload
  }: UpdateRecruitmentPayload): Promise<ApiResponse<PublicRecruitmentDetail>> {
    return apiClient.put(`/recruitments/${id}`, payload) as unknown as Promise<
      ApiResponse<PublicRecruitmentDetail>
    >;
  },

  // ─── DELETE /recruitments/:id ────────────────────────────────────────────────
  async deleteRecruitment(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/recruitments/${id}`) as unknown as Promise<
      ApiResponse<null>
    >;
  },

  // ─── POST /recruitments/:id/applications (API Ứng tuyển mới) ────────────────
  // ─── POST /recruitments/:id/applications (API Ứng tuyển) ────────────────
  async applyRecruitment({
    recruitmentId,
    fullName,
    email,
    phone,
    address,
    cvFile,
  }: RecruitmentApplicationPayload): Promise<ApiResponse<null>> {
    // Tạo cái "thùng carton" FormData
    const formData = new FormData();
    formData.append("FullName", fullName);
    formData.append("Email", email);
    formData.append("Phone", phone);
    if (address) formData.append("Address", address);
    formData.append("CvFile", cvFile); // Nhét file PDF vào thùng

    return apiClient.post(
      `/recruitments/${recruitmentId}/applications`,
      formData, // Gửi cái thùng đi
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── POST /recruitments/:id/count-viewer (API Đếm lượt xem) ────────────────
  async countRecruitmentViewer(
    recruitmentId: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/recruitments/${recruitmentId}/count-viewer`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
  // ─── GET /recruitments/count-viewer (Lấy view của nguyên danh sách) ────────
  async getRecruitmentViews(): Promise<ApiResponse<any>> {
    return apiClient.get("/recruitments/count-viewer") as unknown as Promise<
      ApiResponse<any>
    >;
  },

  // ─── GET /recruitments/:id/count-viewer (Lấy view của 1 bài cụ thể) ────────
  async getRecruitmentViewDetail(id: string): Promise<ApiResponse<number>> {
    return apiClient.get(
      `/recruitments/${id}/count-viewer`,
    ) as unknown as Promise<ApiResponse<number>>;
  },
  // ─── PUT /recruitments/:id/open ─────────────────────────────────────────────
  async openRecruitment(recruitmentId: string): Promise<ApiResponse<null>> {
    return apiClient.put(
      `/recruitments/${recruitmentId}/open`,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── PUT /recruitments/:id/close ────────────────────────────────────────────
  async closeRecruitment(recruitmentId: string): Promise<ApiResponse<null>> {
    return apiClient.put(
      `/recruitments/${recruitmentId}/close`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
