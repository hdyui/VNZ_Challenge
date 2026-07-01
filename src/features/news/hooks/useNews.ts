// src/features/news/hooks/useNews.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { newsApi } from "../services";
import type { CreateNewsDto, NewsQueryParams, UpdateNewsDto } from "../type";
import { queryClient } from "@/lib/queryClient";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (params: NewsQueryParams) => [...newsKeys.lists(), params] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};

// ─── GET /news (danh sách có phân trang, filter, search) ─────────────────────
export const useNewsList = (params?: NewsQueryParams) => {
  return useQuery({
    queryKey: newsKeys.list(params ?? {}),
    queryFn: () => newsApi.getList(params),
  });
};

// ─── GET /news/:id (chi tiết) ─────────────────────────────────────────────────
export const useNewsDetail = (id: string) => {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => newsApi.getById(id),
    enabled: !!id,
  });
};

// ─── POST /news (tạo mới) ─────────────────────────────────────────────────────
export const useCreateNews = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateNewsDto) => newsApi.create(dto),
    onSuccess: (res) => {
      toast.success("Tạo bài viết thành công");
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      navigate(`/admin/news/${res.data.id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Tạo bài viết thất bại, vui lòng thử lại",
      );
    },
  });
};

// ─── PUT /news/:id (cập nhật) ─────────────────────────────────────────────────
export const useUpdateNews = (id: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: UpdateNewsDto) => newsApi.update(id, dto),
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công");
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
      navigate(`/admin/news/${id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại",
      );
    },
  });
};

// ─── DELETE /news/:id (soft delete) ──────────────────────────────────────────
export const useDeleteNews = () => {
  return useMutation({
    mutationFn: (id: string) => newsApi.remove(id),
    onSuccess: () => {
      toast.success("Xóa bài viết thành công");
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xóa bài viết thất bại");
    },
  });
};

// ─── POST /news/:id/images (upload ảnh) ──────────────────────────────────────
export const useUploadNewsImages = (newsId: string) => {
  return useMutation({
    mutationFn: (files: File[]) => newsApi.uploadImages(newsId, files),
    onSuccess: () => {
      toast.success("Upload ảnh thành công");
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(newsId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Upload ảnh thất bại");
    },
  });
};

// ─── DELETE /news/:newsId/images/:imageId ─────────────────────────────────────
export const useDeleteNewsImage = (newsId: string) => {
  return useMutation({
    mutationFn: (imageId: string) => newsApi.removeImage(newsId, imageId),
    onSuccess: () => {
      toast.success("Xóa ảnh thành công");
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(newsId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Xóa ảnh thất bại");
    },
  });
};
