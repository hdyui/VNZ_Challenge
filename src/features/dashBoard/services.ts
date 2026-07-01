// src/features/dashboard/services.ts
import apiClient from "@/lib/axios";
import type {
  DashboardData,
  DashboardRecentNews,
  DashboardStats,
} from "./types";
import { normalizeStatus } from "@/features/news/type";

// Gọi song song các API để lấy data thống kê
export const dashboardApi = {
  async getData(): Promise<DashboardData> {
    // Gọi song song news list (để lấy totalCount + recent items)
    const [newsAllRes, newsPublishedRes, newsRecentRes] = await Promise.all([
      apiClient.get("/public/news", {
        params: { page: 1, limit: 1 },
      }) as unknown as Promise<any>,
      apiClient.get("/public/news", {
        params: { page: 1, limit: 1, status: "Published" },
      }) as unknown as Promise<any>,
      apiClient.get("/public/news", {
        params: { page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" },
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

    const stats: DashboardStats = {
      totalNews,
      publishedNews,
      draftNews: totalNews - publishedNews,
      // Các module khác chưa có API → để 0, dễ mở rộng sau
      totalEmployees: 0,
      totalRecruitments: 0,
      activeRecruitments: 0,
    };

    return { stats, recentNews };
  },
};
