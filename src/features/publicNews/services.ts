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

// Lưu ý: apiClient được giả định đã có baseURL = "/api/v1" (khớp với Swagger
// "GET /api/v1/news/{newsId}/comments", ...). Nếu baseURL khác, chỉnh lại path.
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
  // FE chỉ cần gọi khi mở trang chi tiết, không cần tự chống duplicate — BE xử lý.
  async increaseNewsView(newsId: string): Promise<void> {
    await apiClient.post(`/news/${newsId}/view`);
  },

  // ─── GET /api/v1/news/:newsId/comments ────────────────────────────────────────
  // Endpoint có phân trang (Page/PageSize) và filter theo ParentCommentId:
  //  - Không truyền ParentCommentId  -> danh sách comment gốc (root), phân trang.
  //  - Truyền ParentCommentId=<id>   -> danh sách reply của đúng comment đó, phân trang riêng.
  // BE KHÔNG nhúng sẵn replies vào comment gốc -> FE phải tự gọi thêm lần nữa
  // với ParentCommentId khi cần hiển thị reply (xem useNewsCommentReplies).
  async getComments(
    newsId: string,
    params?: NewsCommentsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<NewsComment>>> {
    return apiClient.get(`/news/${newsId}/comments`, {
      params: {
        // Giữ đúng tên/casing tham số như Swagger khai báo.
        ParentCommentId: params?.parentCommentId,
        Page: params?.page,
        PageSize: params?.pageSize,
      },
    }) as unknown as Promise<ApiResponse<PaginatedResponse<NewsComment>>>;
  },

  // ─── POST /api/v1/news/:newsId/comments ───────────────────────────────────────
  // Body: { content: string; parentCommentId?: string | null }
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
  // Cần xác nhận với BE trước khi bật thật 2 hàm dưới đây trong CommentItem.tsx.
  // async deleteComment(newsId: string, commentId: string): Promise<void> {
  //   await apiClient.delete(`/news/${newsId}/comments/${commentId}`);
  // },
  // async hideComment(newsId: string, commentId: string): Promise<void> {
  //   await apiClient.patch(`/news/${newsId}/comments/${commentId}/hide`);
  // },
};
