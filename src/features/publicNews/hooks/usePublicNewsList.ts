// src/features/publicNews/hooks/usePublicNewsList.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { publicApi } from "../services";
import type {
  PublicNewsQueryParams,
  PublicRecruitmentQueryParams,
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
    all: (newsId: string) => ["news-comments", newsId] as const,
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

// ─── GET /api/news/public ──────────────────────────────────────────────────────
export const usePublicNewsList = (params?: PublicNewsQueryParams) => {
  return useQuery({
    queryKey: publicKeys.news.list(params ?? {}),
    queryFn: () => publicApi.getNewsList(params),
  });
};

// ─── GET /api/news/:slug + tự động gọi POST /api/news/:id/view ────────────────
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

// ─── GET /api/news/:newsId/comments ────────────────────────────────────────────
export const useNewsComments = (newsId: string) => {
  return useQuery({
    queryKey: publicKeys.comments.all(newsId),
    queryFn: () => publicApi.getComments(newsId),
    enabled: !!newsId,
  });
};

// ─── POST /api/news/:newsId/comments ───────────────────────────────────────────
export const useCreateComment = (newsId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      publicApi.createComment(newsId, payload),
    onSuccess: () => {
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
