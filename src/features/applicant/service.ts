import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/shared/types/types";
import type {
  ApplicantProfile,
  ApplicantApplicationItem,
} from "../applications/type";

export const applicantApi = {
  // ─── GET /applicant/me ───────────────────────────────────────────────────────
  async getMe(): Promise<ApiResponse<ApplicantProfile>> {
    return apiClient.get("/applicant/me") as unknown as Promise<
      ApiResponse<ApplicantProfile>
    >;
  },

  // ─── GET /applicant/me/recruitment-applications ────────────────────────────
  async getMyApplications(): Promise<ApiResponse<ApplicantApplicationItem[]>> {
    return apiClient.get(
      "/applicant/me/recruitment-applications",
    ) as unknown as Promise<ApiResponse<ApplicantApplicationItem[]>>;
  },

  // ─── GET /applicant/me/recruitment-applications/:id ────────────────────────
  async getMyApplicationDetail(
    applicationId: string,
  ): Promise<ApiResponse<ApplicantApplicationItem>> {
    return apiClient.get(
      `/applicant/me/recruitment-applications/${applicationId}`,
    ) as unknown as Promise<ApiResponse<ApplicantApplicationItem>>;
  },
  // Lấy thông tin Profile
  async getApplicantProfile(): Promise<ApiResponse<any>> {
    return apiClient.get("/applicant/me") as unknown as Promise<
      ApiResponse<any>
    >;
  },

  // Cập nhật CV (Gửi dạng FormData)
  async updateApplicantCv(
    applicationId: string,
    cvFile: File,
  ): Promise<ApiResponse<null>> {
    const formData = new FormData();
    formData.append("CvFile", cvFile);
    return apiClient.put(
      `/applicant/me/recruitment-applications/${applicationId}/cv`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
