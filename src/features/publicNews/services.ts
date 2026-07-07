// src/features/publicNews/services.ts
import apiClient from "@/lib/axios";
import type {
  PublicNewsDetail,
  PublicNewsItem,
  PublicNewsQueryParams,
  NewsComment,
  NewsCommentsQueryParams,
  CreateCommentPayload,
} from "./types";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";

export const publicApi = {
  // ─── GET /api/v1/news/public ──────────────────────────────────────────────────
  async getNewsList(
    params?: PublicNewsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>> {
    return apiClient.get("/news/public", {
      params,
    }) as unknown as Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>>;
  },

  // ─── GET /api/v1/news/:slug ────────────────────────────────────────────────────
  async getNewsBySlug(slug: string): Promise<ApiResponse<PublicNewsDetail>> {
    return apiClient.get(`/news/${slug}`) as unknown as Promise<
      ApiResponse<PublicNewsDetail>
    >;
  },

  // ─── POST /api/v1/news/:newsId/view ───────────────────────────────────────────
  async increaseNewsView(newsId: string): Promise<void> {
    await apiClient.post(`/news/${newsId}/view`);
  },

  // ─── GET /api/v1/news/views ──────────────────────────────────────────────────
  async getNewsViews(): Promise<ApiResponse<any>> {
    return apiClient.get("/news/views") as unknown as Promise<ApiResponse<any>>;
  },

  // ─── GET /api/v1/news/:newsId/views ──────────────────────────────────────────
  async getNewsViewDetail(newsId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/news/${newsId}/views`) as unknown as Promise<
      ApiResponse<any>
    >;
  },

  // ─── GET /api/v1/news/:newsId/comments ────────────────────────────────────────
  async getComments(
    newsId: string,
    params?: NewsCommentsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<NewsComment>>> {
    return apiClient.get(`/news/${newsId}/comments`, {
      params: {
        ParentCommentId: params?.parentCommentId,
        IncludeHidden: params?.includeHidden,
        Page: params?.page,
        PageSize: params?.pageSize,
      },
    }) as unknown as Promise<ApiResponse<PaginatedResponse<NewsComment>>>;
  },

  // ─── POST /api/v1/news/:newsId/comments ───────────────────────────────────────
  async createComment(
    newsId: string,
    payload: CreateCommentPayload,
  ): Promise<ApiResponse<NewsComment>> {
    return apiClient.post(
      `/news/${newsId}/comments`,
      payload,
    ) as unknown as Promise<ApiResponse<NewsComment>>;
  },

  // ─── PATCH /api/v1/news/:newsId/comments/:commentId/hide ──────────────────────
  async hideComment(newsId: string, commentId: string): Promise<void> {
    await apiClient.patch(`/news/${newsId}/comments/${commentId}/hide`);
  },

  // ─── PATCH /api/v1/news/:newsId/comments/:commentId/unhide ────────────────────
  async unhideComment(newsId: string, commentId: string): Promise<void> {
    await apiClient.patch(`/news/${newsId}/comments/${commentId}/unhide`);
  },

  // ─── DELETE /api/v1/news/:newsId/comments/:commentId ──────────────────────────
  async deleteComment(newsId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/news/${newsId}/comments/${commentId}`);
  },
};
