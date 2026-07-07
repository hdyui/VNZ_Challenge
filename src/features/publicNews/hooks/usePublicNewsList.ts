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
  views: {
    all: ["news-views"] as const,
    detail: (newsId: string) => [...publicKeys.views.all, newsId] as const,
  },
  comments: {
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: publicKeys.news.detail(slug),
    queryFn: () => publicApi.getNewsBySlug(slug),
    enabled: !!slug,
  });

  const newsId = (query.data as any)?.value?.id as string | undefined;

  const trackedNewsIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!newsId || trackedNewsIdRef.current === newsId) return;
    trackedNewsIdRef.current = newsId;

    publicApi
      .increaseNewsView(newsId)
      .then(() => {
        // Cập nhật lạc quan viewCount (tùy chọn)
        queryClient.setQueryData(publicKeys.news.detail(slug), (old: any) => {
          if (!old?.value) return old;
          return {
            ...old,
            value: {
              ...old.value,
              viewCount: (old.value.viewCount ?? 0) + 1,
            },
          };
        });
        // Cập nhật lại view detail sau khi tăng view
        queryClient.invalidateQueries({
          queryKey: publicKeys.views.detail(newsId),
        });
      })
      .catch(() => {
        console.warn("Không thể ghi nhận lượt xem cho bài viết:", newsId);
      });
  }, [newsId, slug, queryClient]);

  return query;
};

// ─── HOOKS LẤY LƯỢT XEM (MỚI) ────────────────────────────────────────────────
export const useNewsViews = () => {
  return useQuery({
    queryKey: publicKeys.views.all,
    queryFn: () => publicApi.getNewsViews(),
  });
};

export const useNewsViewDetail = (newsId?: string) => {
  return useQuery({
    queryKey: publicKeys.views.detail(newsId ?? ""),
    queryFn: () => publicApi.getNewsViewDetail(newsId!),
    enabled: !!newsId,
  });
};

// ─── GET /api/v1/news/:newsId/comments ──────────────────────────────────────────
export const useNewsComments = (
  newsId: string,
  params?: NewsCommentsQueryParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: publicKeys.comments.list(newsId, params),
    queryFn: () => publicApi.getComments(newsId, params),
    enabled: !!newsId && (options?.enabled ?? true),
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
      queryClient.invalidateQueries({
        queryKey: publicKeys.comments.all(newsId),
      });
    },
  });
};

// ─── PATCH /api/v1/news/:newsId/comments/:commentId/hide ────────────────────────
export const useHideComment = (newsId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => publicApi.hideComment(newsId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.comments.all(newsId),
      });
    },
  });
};

// ─── PATCH /api/v1/news/:newsId/comments/:commentId/unhide ──────────────────────
export const useUnhideComment = (newsId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      publicApi.unhideComment(newsId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.comments.all(newsId),
      });
    },
  });
};

// ─── DELETE /api/v1/news/:newsId/comments/:commentId ────────────────────────────
export const useDeleteComment = (newsId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      publicApi.deleteComment(newsId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.comments.all(newsId),
      });
    },
  });
};
