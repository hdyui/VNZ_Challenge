import { useState, type ReactNode } from "react";
import { Quote, Camera, Eye, Image as ImageIcon } from "lucide-react";
import type { UploadTarget } from "../hooks/useProfile";

interface Props {
  userInfo: any;
  role?: string;
  fullName: string;
  triggerUpload: (target: UploadTarget) => void;
  actions?: ReactNode;
}

const ProfileHeader = ({
  userInfo,
  role,
  fullName,
  triggerUpload,
  actions,
}: Props) => {
  const [activeMenu, setActiveMenu] = useState<"avatar" | "cover" | null>(null);

  const renderAvatar = () => {
    if (userInfo?.avatarImg) {
      return (
        <img
          src={userInfo.avatarImg}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    return userInfo?.firstName?.charAt(0) || "U";
  };

  return (
    <>
      {/* 1. ẢNH BÌA */}
      <div className="h-64 sm:h-80 w-full relative group">
        {userInfo?.coverImg ? (
          <img
            src={userInfo.coverImg}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-primary opacity-80" />
        )}

        {/* Menu Hover Ảnh Bìa */}
        <div
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
          onClick={() => setActiveMenu(activeMenu === "cover" ? null : "cover")}
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">Chỉnh sửa ảnh bìa</span>
        </div>

        {activeMenu === "cover" && (
          <div className="absolute top-14 left-4 bg-white rounded-lg shadow-lg p-2 w-48 z-10 animate-in fade-in zoom-in duration-200">
            {userInfo?.coverImg && (
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => {
                  window.open(userInfo.coverImg as string, "_blank");
                  setActiveMenu(null);
                }}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Xem ảnh bìa</span>
              </div>
            )}
            <div
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => {
                triggerUpload("coverImg");
                setActiveMenu(null);
              }}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Tải ảnh lên</span>
            </div>
          </div>
        )}

        {/* 2. AVATAR */}
        <div className="absolute -bottom-16 left-8 sm:left-12 group/avatar">
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative cursor-pointer flex items-center justify-center text-4xl font-bold text-primary"
            onClick={() =>
              setActiveMenu(activeMenu === "avatar" ? null : "avatar")
            }
          >
            {renderAvatar()}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          {activeMenu === "avatar" && (
            <div className="absolute top-[170px] left-0 bg-white rounded-lg shadow-xl p-2 w-48 z-20 animate-in slide-in-from-top-2">
              {userInfo?.avatarImg && (
                <div
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => {
                    window.open(userInfo.avatarImg as string, "_blank");
                    setActiveMenu(null);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Xem ảnh đại diện</span>
                </div>
              )}
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => {
                  triggerUpload("avatarImg");
                  setActiveMenu(null);
                }}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">Tải ảnh lên</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. TÊN + ACTIONS + QUOTE */}
      <div
        className="pt-20 pb-2 px-8 sm:px-12 relative"
        onClick={() => setActiveMenu(null)}
      >
        {actions && (
          <div className="absolute top-6 right-6 sm:right-12 flex gap-3">
            {actions}
          </div>
        )}

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {fullName || "Người dùng ẩn danh"}
          </h1>
          <p className="text-lg font-medium text-primary mt-1">
            {userInfo?.position || role}
          </p>
        </div>

        {userInfo?.quote && (
          <div className="mt-6 flex items-start gap-3 bg-slate-50 p-4 rounded-lg border-l-4 border-primary">
            <Quote className="w-6 h-6 text-primary/50 shrink-0 mt-1" />
            <p className="text-gray-700 italic text-lg leading-relaxed">
              "{userInfo.quote}"
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileHeader;
