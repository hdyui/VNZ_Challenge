import apiClient from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";
import type {} from "./type";
import type {
  AdminApplicationQueryParams,
  ScheduleInterviewPayload,
} from "../applicant/type";

export const adminApplicationsApi = {
  // ─── GET /admin/recruitment-applications ───────────────────────────────────
  async getApplications(
    params?: AdminApplicationQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    return apiClient.get("/admin/recruitment-applications", {
      params,
    }) as unknown as Promise<ApiResponse<PaginatedResponse<any>>>;
  },

  // ─── GET /admin/recruitment-applications/:id ───────────────────────────────
  async getApplicationDetail(applicationId: string): Promise<ApiResponse<any>> {
    return apiClient.get(
      `/admin/recruitment-applications/${applicationId}`,
    ) as unknown as Promise<ApiResponse<any>>;
  },

  // ─── PATCH /admin/recruitment-applications/:id/status ──────────────────────
  async updateStatus(
    applicationId: string,
    payload: { status: string; rejectReason?: string },
  ): Promise<ApiResponse<null>> {
    return apiClient.patch(
      `/admin/recruitment-applications/${applicationId}/status`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },
  // ─── PATCH /admin/recruitment-applications/:id/schedule-interview ──────────
  async scheduleInterview(
    applicationId: string,
    payload: ScheduleInterviewPayload,
  ): Promise<ApiResponse<null>> {
    return apiClient.patch(
      `/admin/recruitment-applications/${applicationId}/schedule-interview`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── POST /admin/recruitment-applications/:id/account ──────────────────────
  async createAccount(applicationId: string): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/admin/recruitment-applications/${applicationId}/account`,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── POST /admin/recruitment-applications/:id/account/reissue-password ─────
  async reissuePassword(applicationId: string): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/admin/recruitment-applications/${applicationId}/account/reissue-password`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
  // ============================================================================
  // ─── INTERVIEW SESSIONS (CA PHỎNG VẤN) ──────────────────────────────────────
  // ============================================================================

  // ─── GET /admin/recruitments/:recruitmentId/interview-sessions ──────────────
  async getInterviewSessions(recruitmentId: string): Promise<ApiResponse<any>> {
    return apiClient.get(
      `/admin/recruitments/${recruitmentId}/interview-sessions`,
    ) as unknown as Promise<ApiResponse<any>>;
  },

  // ─── POST /admin/recruitments/:recruitmentId/interview-sessions ─────────────
  async createInterviewSession(
    recruitmentId: string,
    payload: any,
  ): Promise<ApiResponse<null>> {
    return apiClient.post(
      `/admin/recruitments/${recruitmentId}/interview-sessions`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── PUT /admin/interview-sessions/:interviewSessionId ──────────────────────
  async updateInterviewSession(
    interviewSessionId: string,
    payload: any,
  ): Promise<ApiResponse<null>> {
    return apiClient.put(
      `/admin/interview-sessions/${interviewSessionId}`,
      payload,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  // ─── DELETE /admin/interview-sessions/:interviewSessionId ───────────────────
  async deleteInterviewSession(
    interviewSessionId: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.delete(
      `/admin/interview-sessions/${interviewSessionId}`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
  // 1. Cập nhật trạng thái (Approved, Rejected, Cancelled)

  // 2. Tự động chuyển sang Reviewed
  async markApplicationReviewed(
    applicationId: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.patch(
      `/admin/recruitment-applications/${applicationId}/mark-reviewed`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
