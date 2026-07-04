// src/features/dashboard/services.ts
import apiClient from "@/lib/axios";
import type {
  DashboardData,
  DashboardRecentNews,
  DashboardStats,
} from "./types";
import { normalizeStatus } from "@/features/news/type";
import { accountApi } from "../employees/services"; // ⚠️ chỉnh path cho đúng dự án
import { publicApi } from "../recruiments/services"; // ⚠️ chỉnh path cho đúng dự án

export const dashboardApi = {
  async getData(): Promise<DashboardData> {
    const [
      newsAllRes,
      newsPublishedRes,
      newsRecentRes,
      accountsRes,
      recruitmentsRes,
    ] = await Promise.all([
      apiClient.get("/news/public", {
        params: { page: 1, limit: 100 },
      }) as unknown as Promise<any>,
      apiClient.get("/news/public", {
        params: { page: 1, limit: 100, status: "Published" },
      }) as unknown as Promise<any>,
      apiClient.get("/news/public", {
        params: { page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" },
      }) as unknown as Promise<any>,

      // ── Nhân viên: tổng số account trong hệ thống ─────────────────────
      // ⚠️ Nếu "Nhân viên" chỉ nên tính role = "Employee" (không tính Admin),
      // thêm role: "Employee" vào params bên dưới.
      accountApi.getAccounts({
        page: 1,
        pageSize: 1,
      }) as unknown as Promise<any>,

      // ── Tuyển dụng ─────────────────────────────────────────────────────
      // PublicRecruitmentQueryParams không có param `status`, nên lấy nguyên list
      // rồi tự filter status === "Open" ở FE để tính "Đang tuyển".
      // ⚠️ limit đặt tạm 100 để cover hầu hết trường hợp. Nếu tổng recruitment > 100,
      // cần đổi sang phân trang thật hoặc xin BE thêm filter status.
      publicApi.getRecruitmentList({
        page: 1,
        limit: 100,
      }) as unknown as Promise<any>,
    ]);

    const totalNews: number = newsAllRes?.value?.totalCount ?? 0;
    const publishedNews: number = newsPublishedRes?.value?.totalCount ?? 0;

    const recentNews: DashboardRecentNews[] = (
      newsRecentRes?.value?.items ?? []
    ).map((item: any) => ({
      ...item,
      status: normalizeStatus(item.status),
    }));

    // ⚠️ Giả định accountApi.getAccounts trả về cùng shape ApiResponse<PaginatedResponse<T>>
    // như news/recruitments (res.value.totalCount). Nếu BE trả khác (vd res.totalCount
    // trực tiếp), sửa dòng dưới.
    const totalEmployees: number = accountsRes?.value?.totalCount ?? 0;

    const recruitmentItems: { status?: string | null }[] =
      recruitmentsRes?.value?.items ?? [];

    // Tổng số tin tuyển dụng (BE trả về, không phụ thuộc trang FE đang fetch)
    const totalRecruitments: number = recruitmentsRes?.value?.totalCount ?? 0;

    // Đang tuyển = filter status "Open" trên list đã lấy (client-side)
    const activeRecruitments: number = recruitmentItems.filter(
      (item) => item.status === "Open",
    ).length;

    const stats: DashboardStats = {
      totalNews,
      publishedNews,
      draftNews: totalNews - publishedNews,
      totalEmployees,
      totalRecruitments,
      activeRecruitments,
    };

    return { stats, recentNews };
  },
};
