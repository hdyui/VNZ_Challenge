// src/features/publicNews/hooks/usePublicNewsList.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { publicApi } from "../services";
import type {
  PublicNewsQueryParams,
  PublicRecruitmentQueryParams,
  NewsCommentsQueryParams,
  CreateCommentPayload,
} from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const publicKeys = {
  news: {
    all: ["public-news"] as const,
    lists: () => [...publicKeys.news.all, "list"] as const,
    list: (params: PublicNewsQueryParams) =>
      [...publicKeys.news.lists(), params] as const,
    detail: (slug: string) => [...publicKeys.news.all, "detail", slug] as const,
  },
  comments: {
    // Prefix chung cho 1 bài viết -> dùng để invalidate cả root list lẫn
    // mọi list replies cùng lúc (TanStack Query match theo prefix mặc định).
    all: (newsId: string) => ["news-comments", newsId] as const,
    list: (newsId: string, params?: NewsCommentsQueryParams) =>
      [...publicKeys.comments.all(newsId), params ?? {}] as const,
  },
  recruitments: {
    all: ["public-recruitments"] as const,
    lists: () => [...publicKeys.recruitments.all, "list"] as const,
    list: (params: PublicRecruitmentQueryParams) =>
      [...publicKeys.recruitments.lists(), params] as const,
    detail: (id: string) =>
      [...publicKeys.recruitments.all, "detail", id] as const,
  },
};

// ─── GET /api/v1/news/public ────────────────────────────────────────────────────
export const usePublicNewsList = (params?: PublicNewsQueryParams) => {
  return useQuery({
    queryKey: publicKeys.news.list(params ?? {}),
    queryFn: () => publicApi.getNewsList(params),
  });
};

// ─── GET /api/v1/news/:slug + tự động gọi POST /api/v1/news/:id/view ──────────
export const usePublicNewsDetail = (slug: string) => {
  const query = useQuery({
    queryKey: publicKeys.news.detail(slug),
    queryFn: () => publicApi.getNewsBySlug(slug),
    enabled: !!slug,
  });

  const newsId = (query.data as any)?.value?.id as string | undefined;

  // Chỉ gọi 1 lần cho mỗi newsId trong vòng đời component, kể cả khi
  // React StrictMode chạy effect 2 lần ở môi trường dev.
  const trackedNewsIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!newsId || trackedNewsIdRef.current === newsId) return;
    trackedNewsIdRef.current = newsId;

    publicApi.increaseNewsView(newsId).catch(() => {
      // Không chặn trải nghiệm đọc bài nếu ghi nhận view thất bại.
      console.warn("Không thể ghi nhận lượt xem cho bài viết:", newsId);
    });
  }, [newsId]);

  return query;
};

// ─── GET /api/v1/news/:newsId/comments ──────────────────────────────────────────
// Dùng chung cho cả 2 trường hợp:
//  - Lấy comment gốc:  useNewsComments(newsId, { page, pageSize })
//  - Lấy reply của 1 comment gốc: useNewsComments(newsId, { parentCommentId, page, pageSize })
export const useNewsComments = (
  newsId: string,
  params?: NewsCommentsQueryParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: publicKeys.comments.list(newsId, params),
    queryFn: () => publicApi.getComments(newsId, params),
    // Mặc định chỉ cần có newsId là fetch (dùng cho comment gốc). Khi dùng để
    // lazy-load replies, truyền enabled: false cho tới khi người dùng mở ra.
    enabled: !!newsId && (options?.enabled ?? true),
    // Giữ data trang cũ khi đổi trang/param để tránh nháy loading toàn màn hình.
    placeholderData: keepPreviousData,
  });
};

// ─── POST /api/v1/news/:newsId/comments ─────────────────────────────────────────
export const useCreateComment = (newsId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      publicApi.createComment(newsId, payload),
    onSuccess: () => {
      // Comment mới có thể là root hoặc reply của 1 comment cụ thể -> invalidate
      // toàn bộ cache comments của bài viết này (mọi biến thể phân trang/parentId).
      queryClient.invalidateQueries({
        queryKey: publicKeys.comments.all(newsId),
      });
    },
  });
};

// // ─── GET /public/recruitments ─────────────────────────────────────────────────
// export const usePublicRecruitmentList = (
//   params?: PublicRecruitmentQueryParams,
// ) => {
//   return useQuery({
//     queryKey: publicKeys.recruitments.list(params ?? {}),
//     queryFn: () => publicApi.getRecruitmentList(params),
//   });
// };

// // ─── GET /public/recruitments/:id ────────────────────────────────────────────
// export const usePublicRecruitmentDetail = (id: string) => {
//   return useQuery({
//     queryKey: publicKeys.recruitments.detail(id),
//     queryFn: () => publicApi.getRecruitmentById(id),
//     enabled: !!id,
//   });
// };
