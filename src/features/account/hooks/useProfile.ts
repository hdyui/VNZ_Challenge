import { useRef, useState } from "react";
import { toast } from "sonner";

import { useUser } from "@/features/auth/hooks/useAuth"; // getMe
import {
  useUserDetailQuery,
  useUpdateProfileMutation,
  useUploadMutation,
} from "./useUser";

export type UploadTarget = "avatarImg" | "coverImg";

// account có thể là object hoặc mảng tuỳ response
const pickAccount = (u: any) =>
  Array.isArray(u?.account) ? u?.account?.[0] : u?.account;

// gỡ các lớp bọc thường gặp (value / data) để lấy object thật
const unwrap = (raw: any) => raw?.value?.data ?? raw?.value ?? raw?.data ?? raw;

/**
 * Hook trung tâm của trang Profile. Flow 2 bước:
 *   B1. getMe (useUser)          -> lấy userId + role + email
 *   B2. GET /users/{userId}      -> lấy chi tiết đầy đủ (departments, ...)
 * Detail ưu tiên hơn; nếu detail chưa có thì fallback dữ liệu của getMe.
 * Ngoài ra gói luôn logic upload ảnh (avatar / cover).
 *
 * Dùng chung cho cả Admin lẫn Employee.
 */
export const useProfile = () => {
  // ===== B1: getMe =====
  const { data: meData, isLoading: meLoading } = useUser();
  const me = unwrap(meData);
  const meUser = me?.user ?? me; // object user trong getMe
  const userId: string | undefined = meUser?.id;

  // ===== B2: GET /users/{userId} =====
  const { data: detailData, isLoading: detailLoading } =
    useUserDetailQuery(userId);
  const detailUser = unwrap(detailData);

  // ===== Gộp: ưu tiên detail, fallback getMe =====
  const userInfo = detailUser?.id ? detailUser : meUser;

  const account = pickAccount(detailUser) ?? pickAccount(meUser) ?? me;
  const role = account?.role ?? me?.role;
  const email = account?.email ?? me?.email;
  const accountId: string | undefined = account?.id;

  const fullName = userInfo
    ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
    : "";

  // chờ getMe; nếu đã có userId thì chờ luôn detail cho khỏi nháy
  const isLoading = meLoading || (!!userId && detailLoading);

  // ===== Logic upload ảnh =====
  const { mutateAsync: uploadImage } = useUploadMutation();
  const { mutateAsync: updateProfile } = useUpdateProfileMutation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const triggerUpload = (target: UploadTarget) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userId || !uploadTarget) return;

    try {
      setIsUploading(true);
      toast.info("Đang tải ảnh lên...");

      const folderName = uploadTarget === "avatarImg" ? "avatars" : "covers";

      // B1: Up file -> lấy link
      const uploadRes: any = await uploadImage({ file, folder: folderName });
      const imageUrl =
        uploadRes?.url ||
        uploadRes?.value?.url ||
        uploadRes?.data?.value?.url ||
        uploadRes?.data?.url;

      if (!imageUrl) {
        toast.error("Không lấy được link ảnh — kiểm tra lại response upload.");
        return;
      }

      // B2: Lưu link vào hồ sơ qua updateProfile
      const payload = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        position: userInfo.position,
        phone: userInfo.phone,
        address: userInfo.address,
        hobby: userInfo.hobby,
        quote: userInfo.quote,
        avatarImg: uploadTarget === "avatarImg" ? imageUrl : userInfo.avatarImg,
        coverImg: uploadTarget === "coverImg" ? imageUrl : userInfo.coverImg,
      };

      await updateProfile({ userId, data: payload });
      toast.success("Cập nhật ảnh thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi tải ảnh!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return {
    isLoading,
    userInfo,
    userId,
    accountId,
    role,
    email,
    fullName,
    fileInputRef,
    uploadTarget,
    isUploading,
    triggerUpload,
    handleFileChange,
  };
};
