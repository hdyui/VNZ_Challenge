import apiClient from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";
import type {
  CreateRecruitmentPayload,
  Department,
  PublicRecruitmentDetail,
  PublicRecruitmentItem,
  PublicRecruitmentQueryParams,
  RecruitmentApplicationPayload,
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

  // ─── POST /recruitments/:id/apply ────────────────────────────────────────────
  async applyRecruitment({
    recruitmentId,
    ...payload
  }: RecruitmentApplicationPayload): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/recruitments/${recruitmentId}/apply`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
