// src/features/public/hooks/index.ts
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../services";
import type {
  PublicNewsQueryParams,
  PublicRecruitmentQueryParams,
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
  recruitments: {
    all: ["public-recruitments"] as const,
    lists: () => [...publicKeys.recruitments.all, "list"] as const,
    list: (params: PublicRecruitmentQueryParams) =>
      [...publicKeys.recruitments.lists(), params] as const,
    detail: (id: string) =>
      [...publicKeys.recruitments.all, "detail", id] as const,
  },
};

// ─── GET /public/news ─────────────────────────────────────────────────────────
export const usePublicNewsList = (params?: PublicNewsQueryParams) => {
  return useQuery({
    queryKey: publicKeys.news.list(params ?? {}),
    queryFn: () => publicApi.getNewsList(params),
  });
};

// ─── GET /public/news/:slug ───────────────────────────────────────────────────
export const usePublicNewsDetail = (slug: string) => {
  return useQuery({
    queryKey: publicKeys.news.detail(slug),
    queryFn: () => publicApi.getNewsBySlug(slug),
    enabled: !!slug,
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
