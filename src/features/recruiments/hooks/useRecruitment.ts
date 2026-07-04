import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRecruitmentPayload,
  PublicRecruitmentQueryParams,
  RecruitmentApplicationPayload,
  UpdateRecruitmentPayload,
} from "../type";
import { publicApi } from "../services";
import { publicKeys } from "@/features/publicNews/hooks/usePublicNewsList";

// ─── GET /departments ───────────────────────────────────────────────────────────
export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => publicApi.getDepartments(),
    staleTime: 5 * 60 * 1000,
  });
};

// ─── GET /public/recruitments ─────────────────────────────────────────────────
export const usePublicRecruitmentList = (
  params?: PublicRecruitmentQueryParams,
) => {
  return useQuery({
    queryKey: publicKeys.recruitments.list(params ?? {}),
    queryFn: () => publicApi.getRecruitmentList(params),
  });
};

// ─── GET /public/recruitments/:id ────────────────────────────────────────────
export const usePublicRecruitmentDetail = (id: string) => {
  return useQuery({
    queryKey: publicKeys.recruitments.detail(id),
    queryFn: () => publicApi.getRecruitmentById(id),
    enabled: !!id,
  });
};

// ─── POST /recruitments ───────────────────────────────────────────────────────
// payload đã đúng shape BE cần (title, contentHtml, contentJson, coverImageUrl,
// location, workingType, hiringQuantity, maxApplications, deadline, status,
// level, departmentId) — xem RecruitmentForm + schema.ts (toRecruitmentPayload).
export const useCreateRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecruitmentPayload) =>
      publicApi.createRecruitment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.recruitments.list({}),
      });
    },
  });
};

// ─── PUT /recruitments/:id ────────────────────────────────────────────────────
export const useUpdateRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecruitmentPayload) =>
      publicApi.updateRecruitment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.recruitments.list({}),
      });
      queryClient.invalidateQueries({
        queryKey: publicKeys.recruitments.detail(variables.id),
      });
    },
  });
};

// ─── DELETE /recruitments/:id ─────────────────────────────────────────────────
export const useDeleteRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publicApi.deleteRecruitment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: publicKeys.recruitments.list({}),
      });
    },
  });
};

// ─── POST /recruitments/:id/apply ─────────────────────────────────────────────
export const useApplyRecruitment = () => {
  return useMutation({
    mutationFn: (payload: RecruitmentApplicationPayload) =>
      publicApi.applyRecruitment(payload),
  });
};
