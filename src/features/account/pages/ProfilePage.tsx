import { useState } from "react";
import { Edit, KeyRound } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { LoadingState } from "@/shared/components/common/StatusState";

import { useProfile } from "../hooks/useProfile";
import UpdateProfileForm from "../components/UpdateProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import DeleteAccountDialog from "../components/DeleteAccountDialog";
import ProfileHeader from "../components/ProfileHeader";
import ProfileInfo from "../components/ProfileInfo";

interface Props {
  /**
   * Cho phép tự xoá tài khoản. Mặc định true (employee tự xoá được).
   * Admin có thể tắt: <ProfilePage showDelete={false} />
   */
  showDelete?: boolean;
}

/**
 * Trang hồ sơ DÙNG CHUNG cho cả Admin và Employee.
 * Chỉ cần import và render: <ProfilePage /> là chạy.
 * Toàn bộ data lấy từ getMe (qua useProfile) nên không phụ thuộc role.
 */
export const ProfilePage = ({ showDelete = true }: Props) => {
  const {
    isLoading,
    userInfo,
    userId,
    role,
    email,
    fullName,
    fileInputRef,
    handleFileChange,
    triggerUpload,
  } = useProfile();

  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  if (isLoading) return <LoadingState />;

  const actions = (
    <>
      {/* Cập nhật hồ sơ */}
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Cập nhật hồ sơ</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cập nhật hồ sơ cá nhân</DialogTitle>
          </DialogHeader>
          <UpdateProfileForm
            userInfo={userInfo}
            onSuccess={() => setOpenProfile(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Đổi mật khẩu */}
      <Dialog open={openPassword} onOpenChange={setOpenPassword}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            <span className="hidden sm:inline">Đổi mật khẩu</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onSuccess={() => setOpenPassword(false)} />
        </DialogContent>
      </Dialog>

      {/* Xoá tài khoản (tuỳ chọn) */}
      {showDelete && <DeleteAccountDialog userId={userId} />}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* input file ẩn dùng cho cả avatar lẫn cover */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <ProfileHeader
          userInfo={userInfo}
          role={role}
          fullName={fullName}
          triggerUpload={triggerUpload}
          actions={actions}
        />
        <ProfileInfo userInfo={userInfo} email={email} />
      </div>
    </div>
  );
};

export default ProfilePage;
