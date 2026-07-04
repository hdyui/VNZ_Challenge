// src/features/publicNews/services.ts
import apiClient from "@/lib/axios";
import type {
  PublicNewsDetail,
  PublicNewsItem,
  PublicNewsQueryParams,
  NewsComment,
  CreateCommentPayload,
} from "./types";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";

// Lưu ý: apiClient được giả định đã có baseURL = "/api" (khớp với tài liệu
// "GET /api/news/public", "GET /api/news/{slug}", ...). Nếu baseURL khác,
// chỉnh lại path cho phù hợp.
export const publicApi = {
  // ─── GET /api/news/public ────────────────────────────────────────────────────
  async getNewsList(
    params?: PublicNewsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>> {
    return apiClient.get("/news/public", {
      params,
    }) as unknown as Promise<ApiResponse<PaginatedResponse<PublicNewsItem>>>;
  },

  // ─── GET /api/news/:slug ──────────────────────────────────────────────────────
  async getNewsBySlug(slug: string): Promise<ApiResponse<PublicNewsDetail>> {
    return apiClient.get(`/news/${slug}`) as unknown as Promise<
      ApiResponse<PublicNewsDetail>
    >;
  },

  // ─── POST /api/news/:newsId/view ─────────────────────────────────────────────
  // FE chỉ cần gọi khi mở trang chi tiết, không cần tự chống duplicate — BE xử lý.
  async increaseNewsView(newsId: string): Promise<void> {
    await apiClient.post(`/news/${newsId}/view`);
  },

  // ─── GET /api/news/:newsId/comments ──────────────────────────────────────────
  async getComments(newsId: string): Promise<ApiResponse<NewsComment[]>> {
    return apiClient.get(`/news/${newsId}/comments`) as unknown as Promise<
      ApiResponse<NewsComment[]>
    >;
  },

  // ─── POST /api/news/:newsId/comments ─────────────────────────────────────────
  async createComment(
    newsId: string,
    payload: CreateCommentPayload,
  ): Promise<ApiResponse<NewsComment>> {
    return apiClient.post(
      `/news/${newsId}/comments`,
      payload,
    ) as unknown as Promise<ApiResponse<NewsComment>>;
  },

  // ⚠️ CHƯA CÓ TRONG TÀI LIỆU API: xóa/ẩn comment (dành cho Admin).
  // Tài liệu 12.1/12.2 hiện không liệt kê endpoint này. Cần xác nhận với BE
  // trước khi bật thật 2 hàm dưới đây trong CommentItem.tsx.
  // async deleteComment(newsId: string, commentId: string): Promise<void> {
  //   await apiClient.delete(`/news/${newsId}/comments/${commentId}`);
  // },
  // async hideComment(newsId: string, commentId: string): Promise<void> {
  //   await apiClient.patch(`/news/${newsId}/comments/${commentId}/hide`);
  // },
};
