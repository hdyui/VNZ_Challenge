import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileRequest } from "../type";
import { userApi } from "../services";
import { toast } from "sonner";

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateProfileRequest;
    }) => {
      return userApi.updateProfile(userId, data);
    },
    onSuccess: (res) => {
      toast.success("Cập nhật hồ sơ thành công!");

      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại!");
      console.log("Lỗi update profile:", error.response?.data);
    },
  });
};

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) => {
      return userApi.uploadFile(file, folder);
    },
    // ko cần invalidateQueries ở đây vì lát nữa gọi tiếp updateProfile
  });
};
