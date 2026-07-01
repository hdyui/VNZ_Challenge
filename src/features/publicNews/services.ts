// src/features/public/services/index.ts
import apiClient from "@/lib/axios";
import type {
  PublicNewsDetail,
  PublicNewsItem,
  PublicNewsQueryParams,
} from "../publicNews/types";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";

export const publicApi = {
  // ─── GET /public/news ────────────────────────────────────────────────────────
  async getNewsList(
    params?: PublicNewsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>> {
    return apiClient.get("/public/news", {
      params,
    }) as unknown as Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>>;
  },

  // ─── GET /public/news/:slug ──────────────────────────────────────────────────
  async getNewsBySlug(slug: string): Promise<ApiResponse<PublicNewsDetail>> {
    return apiClient.get(`/news/slug/${slug}`) as unknown as Promise<
      ApiResponse<PublicNewsDetail>
    >;
  },
};
