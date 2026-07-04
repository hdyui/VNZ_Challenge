import { useRef, useState } from "react";
import { useUser } from "../../auth/hooks/useAuth"; // getMe (cache key ["me"])
import { useUpdateProfileMutation } from "./useUser";

export type UploadTarget = "avatarImg" | "coverImg";

export const useProfile = () => {
  const { data: meRes, isLoading } = useUser(); // dùng lại getMe, KHÔNG tạo query mới

  // gỡ lớp bọc: getMe có thể là { value: { user, role, email } } hoặc user trực tiếp
  const wrap = (meRes as any)?.value ?? meRes;
  const userInfo = wrap?.user ?? wrap;

  const account = Array.isArray(userInfo?.account)
    ? userInfo.account[0]
    : userInfo?.account;

  const userId: string | undefined = userInfo?.id;
  const role: string | undefined = wrap?.role ?? account?.role;
  const email: string | undefined =
    wrap?.email ?? account?.email ?? userInfo?.email;
  const fullName =
    `${userInfo?.lastName ?? ""} ${userInfo?.firstName ?? ""}`.trim();

  // Upload ảnh: gửi file thẳng vào PUT (mutation lo phần refetch getMe)
  const { mutate: updateProfile } = useUpdateProfileMutation(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);

  const triggerUpload = (target: UploadTarget) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId && uploadTarget) {
      updateProfile({ ...userInfo, [uploadTarget]: file });
    }
    e.target.value = "";
  };

  return {
    isLoading,
    userInfo,
    userId,
    role,
    email,
    fullName,
    fileInputRef,
    triggerUpload,
    handleFileChange,
  };
};
