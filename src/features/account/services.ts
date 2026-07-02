import apiClient from "@/lib/axios";

import type { UpdateProfilePayload } from "./hooks/useUser";

export const userApi = {
  updateProfile: (userId: string, data: UpdateProfilePayload) => {
    const fd = new FormData();

    const text: Record<string, any> = {
      FirstName: data.firstName,
      LastName: data.lastName,
      Position: data.position,
      Phone: data.phone,
      Address: data.address,
      Hobby: data.hobby,
      Quote: data.quote,
    };
    Object.entries(text).forEach(([k, v]) => {
      if (v != null) fd.append(k, String(v));
    });

    // Ảnh là File -> gửi file; là URL string -> gửi string; null -> bỏ (giữ ảnh cũ)
    if (data.avatarImg != null) fd.append("AvatarImg", data.avatarImg as any);
    if (data.coverImg != null) fd.append("CoverImg", data.coverImg as any);

    return apiClient.put(`/users/${userId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // POST /auth/uploads (giữ lại nếu nơi khác cần)
  uploadFile: (file: File, folder: string) => {
    const fd = new FormData();
    fd.append("File", file);
    fd.append("Folder", folder);
    return apiClient.post("/auth/uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteUser: (userId: string) => apiClient.delete(`/users/${userId}`),
};
