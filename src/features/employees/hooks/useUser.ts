import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileRequest } from "../type";
import { userApi } from "../services";
import { toast } from "sonner";

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Vì hàm API cần 2 tham số (userId và data), ta bọc nó lại thành 1 object
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

      // ĐÂY LÀ PHÉP THUẬT: Báo cho React Query biết data đã cũ
      // Bác truyền đúng cái queryKey mà bác đang xài trong useUser (ở đây tui giả sử là ["me"])
      // React Query sẽ lẳng lặng gọi lại API auth/me ngầm để lấy data mới nhất up lên UI
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
    // Không cần invalidateQueries ở đây vì lát nữa mình sẽ gọi tiếp updateProfile
  });
};
