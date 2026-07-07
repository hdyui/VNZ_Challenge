import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AdminApplicationQueryParams,
  ScheduleInterviewPayload,
} from "../../applicant/type";
import { adminApplicationsApi } from "../services";

export const useAdminApplications = (params?: AdminApplicationQueryParams) => {
  return useQuery({
    queryKey: ["admin-applications", params],
    queryFn: () => adminApplicationsApi.getApplications(params),
  });
};

export const useAdminApplicationDetail = (applicationId: string) => {
  return useQuery({
    queryKey: ["admin-application-detail", applicationId],
    queryFn: () => adminApplicationsApi.getApplicationDetail(applicationId),
    enabled: !!applicationId,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Thêm rejectReason vào mutationFn
    mutationFn: ({
      id,
      status,
      rejectReason,
    }: {
      id: string;
      status: string;
      rejectReason?: string;
    }) => adminApplicationsApi.updateStatus(id, { status, rejectReason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-application-detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ScheduleInterviewPayload;
    }) => adminApplicationsApi.scheduleInterview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-detail"] });
    },
  });
};

export const useApplicationAccount = () => {
  return useMutation({
    mutationFn: (id: string) => adminApplicationsApi.createAccount(id),
  });
};

export const useReissuePassword = () => {
  return useMutation({
    mutationFn: (id: string) => adminApplicationsApi.reissuePassword(id),
  });
};

export const useMarkApplicationReviewed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApplicationsApi.markApplicationReviewed(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-application-detail", id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });
};
