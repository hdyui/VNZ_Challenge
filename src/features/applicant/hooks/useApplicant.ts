import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicantApi } from "../service";

export const useApplicantMe = () => {
  return useQuery({
    queryKey: ["applicant-me"],
    queryFn: () => applicantApi.getMe(),
  });
};

export const useApplicantApplications = () => {
  return useQuery({
    queryKey: ["applicant-applications"],
    queryFn: () => applicantApi.getMyApplications(),
  });
};

export const useApplicantApplicationDetail = (applicationId: string) => {
  return useQuery({
    queryKey: ["applicant-application-detail", applicationId],
    queryFn: () => applicantApi.getMyApplicationDetail(applicationId),
    enabled: !!applicationId,
  });
};

export const useApplicantProfile = () => {
  return useQuery({
    queryKey: ["applicant-profile"],
    queryFn: () => applicantApi.getApplicantProfile(),
  });
};

export const useUpdateApplicantCv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      applicantApi.updateApplicantCv(id, file),
    onSuccess: (_, variables) => {
      // Refresh lại chi tiết đơn sau khi up CV thành công
      queryClient.invalidateQueries({
        queryKey: ["applicant-application-detail", variables.id],
      });
    },
  });
};
