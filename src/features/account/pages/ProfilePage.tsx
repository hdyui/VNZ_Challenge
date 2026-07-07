import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, KeyRound, CalendarOff, ClipboardList, Home } from "lucide-react";

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
import { CreateLeaveDialog } from "../components/CreateLeaveDialog"; // Đảm bảo import đúng đường dẫn

interface Props {
  showDelete?: boolean;
}

export const ProfilePage = ({ showDelete = true }: Props) => {
  const navigate = useNavigate();
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
  const [openLeave, setOpenLeave] = useState(false);

  if (isLoading) return <LoadingState />;

  // KIỂM TRA ROLE TẠI ĐÂY
  const isEmployee = role === "Employee";

  const actions = (
    <div className="flex gap-2 flex-wrap justify-end">
      {/* 1. Nút Về trang Public (Ai cũng có) */}
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
        onClick={() => navigate("/")}
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Về trang Public</span>
      </Button>

      {/* 2. CÁC NÚT DÀNH RIÊNG CHO EMPLOYEE */}
      {isEmployee && (
        <>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-gray-700 border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
            onClick={() => navigate("/employee/leaves")}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Lịch sử nghỉ phép</span>
          </Button>

          <Button
            variant="default"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-black hover:to-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0"
            onClick={() => setOpenLeave(true)}
          >
            <CalendarOff className="w-4 h-4" />
            <span className="hidden sm:inline">Xin nghỉ phép</span>
          </Button>
        </>
      )}

      {/* 3. Cập nhật hồ sơ (Ai cũng có) */}
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Cập nhật hồ sơ</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] rounded-2xl border-gray-100 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-gray-50">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Cập nhật hồ sơ cá nhân
            </DialogTitle>
          </DialogHeader>
          <UpdateProfileForm
            userInfo={userInfo}
            onSuccess={() => setOpenProfile(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 4. Đổi mật khẩu (Ai cũng có) */}
      <Dialog open={openPassword} onOpenChange={setOpenPassword}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md px-3"
            title="Đổi mật khẩu"
          >
            <KeyRound className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-gray-100 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-gray-50">
            <DialogTitle className="text-xl font-bold text-gray-900">
              Đổi mật khẩu
            </DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onSuccess={() => setOpenPassword(false)} />
        </DialogContent>
      </Dialog>

      {/* 5. Xoá tài khoản */}
      {showDelete && <DeleteAccountDialog userId={userId} />}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans animate-in fade-in duration-500">
      {/* input file ẩn dùng cho cả avatar lẫn cover */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <ProfileHeader
          userInfo={userInfo}
          role={role}
          fullName={fullName}
          triggerUpload={triggerUpload}
          actions={actions} // Render cục actions đã chia role ở trên
        />
        <ProfileInfo userInfo={userInfo} email={email} />
      </div>

      {/* CHỈ RENDER DIALOG XIN NGHỈ NẾU LÀ EMPLOYEE (Tránh lỗi 403 API) */}
      {isEmployee && (
        <CreateLeaveDialog open={openLeave} onOpenChange={setOpenLeave} />
      )}
    </div>
  );
};

export default ProfilePage;
