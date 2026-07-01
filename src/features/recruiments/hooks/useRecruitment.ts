import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRecruitmentPayload,
  PublicRecruitmentQueryParams,
  RecruitmentApplicationPayload,
  UpdateRecruitmentPayload,
} from "../type";
import { publicApi } from "../services";
import { publicKeys } from "@/features/publicNews/hooks/usePublicNewsList";

// ─── Form input (UI-facing) ────────────────────────────────────────────────────
// Form chỉ biết "departmentId" là id phòng ban được chọn từ Select.
// Toàn bộ việc map sang đúng shape mà BE cần (RecruitmentPayload) nằm ở đây,
// component không cần quan tâm field BE đặt tên gì.
export interface RecruitmentFormInput {
  title: string;
  departmentId: string;
  level: CreateRecruitmentPayload["level"];
  status: CreateRecruitmentPayload["status"];
  jobDescription: string;
  referenceInfo?: string;
}

const toCreatePayload = (
  input: RecruitmentFormInput,
): CreateRecruitmentPayload => ({
  title: input.title,
  departmentId: input.departmentId,
  level: input.level,
  status: input.status,
  jobDescription: input.jobDescription,
  referenceInfo: input.referenceInfo,
});

const toUpdatePayload = (
  id: string,
  input: RecruitmentFormInput,
): UpdateRecruitmentPayload => ({
  id,
  ...toCreatePayload(input),
});

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
export const useCreateRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecruitmentFormInput) =>
      publicApi.createRecruitment(toCreatePayload(input)),
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
    mutationFn: ({ id, ...input }: { id: string } & RecruitmentFormInput) =>
      publicApi.updateRecruitment(toUpdatePayload(id, input)),
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
