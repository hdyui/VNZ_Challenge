// import { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Edit,
//   KeyRound,
//   Quote,
//   Camera,
//   Eye,
//   Image as ImageIcon,
// } from "lucide-react";

// import { Button } from "@/shared/components/ui/button";
// import { Input } from "@/shared/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/shared/components/ui/dialog";

// import {
//   useUser,
//   useChangePasswordMutation,
// } from "@/features/auth/hooks/useAuth";
// import { useUpdateProfileMutation, useUploadMutation } from "../hooks/useUser";
// import {
//   ChangePasswordSchema,
//   UpdateProfileSchema,
//   type ChangePasswordTypes,
//   type UpdateProfileSchemaType,
// } from "../schema";
// import { toast } from "sonner";
// import { LoadingState } from "@/shared/components/common/StatusState";
// const UpdateProfileForm = ({
//   userData,
//   setOpen,
// }: {
//   userData: any;
//   setOpen: (v: boolean) => void;
// }) => {
//   const { mutate: updateProfile, isPending } = useUpdateProfileMutation();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<UpdateProfileSchemaType>({
//     resolver: zodResolver(UpdateProfileSchema),
//   });

//   // Tuyệt chiêu moi data theo đúng cấu trúc Backend mới (value -> user -> id)
//   const rawData = userData as any;
//   const userInfo = rawData?.value?.user || rawData?.user;

//   useEffect(() => {
//     if (userInfo) {
//       reset({
//         firstName: userInfo.firstName || "",
//         lastName: userInfo.lastName || "",
//         position: userInfo.position || "",
//         phone: userInfo.phone || "",
//         address: userInfo.address || "",
//         hobby: userInfo.hobby || "",
//         quote: userInfo.quote || "",
//       });
//     }
//   }, [userInfo, reset]);

//   const onSubmit = (data: UpdateProfileSchemaType) => {
//     // LẤY ĐÚNG ID TỪ OBJECT USER BÊN TRONG
//     const trueUserId = userInfo?.id;

//     if (!trueUserId) {
//       alert("Lỗi: Không tìm thấy userId!");
//       return;
//     }

//     updateProfile(
//       { userId: trueUserId, data },
//       {
//         onSuccess: () => {
//           toast.success("Cập nhật thành công rực rỡ!");
//           setOpen(false);
//         },
//         onError: (err: any) => alert(err.message || "Có lỗi xảy ra!"),
//       },
//     );
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="text-sm font-medium mb-1 block">Họ</label>
//           <Input {...register("lastName")} placeholder="Nguyễn Văn" />
//           {errors.lastName && (
//             <p className="text-xs text-red-500 mt-1">
//               {errors.lastName.message}
//             </p>
//           )}
//         </div>
//         <div>
//           <label className="text-sm font-medium mb-1 block">Tên</label>
//           <Input {...register("firstName")} placeholder="A" />
//           {errors.firstName && (
//             <p className="text-xs text-red-500 mt-1">
//               {errors.firstName.message}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="text-sm font-medium mb-1 block">Chức vụ</label>
//           <Input
//             {...register("position")}
//             placeholder="Nhân viên, Quản lý..."
//           />
//           {errors.position && (
//             <p className="text-xs text-red-500 mt-1">
//               {errors.position.message}
//             </p>
//           )}
//         </div>
//         <div>
//           <label className="text-sm font-medium mb-1 block">
//             Số điện thoại
//           </label>
//           <Input {...register("phone")} placeholder="090123..." />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="col-span-2">
//           <label className="text-sm font-medium mb-1 block">Sở thích</label>
//           <Input {...register("hobby")} placeholder="Đọc sách..." />
//         </div>
//       </div>

//       <div>
//         <label className="text-sm font-medium mb-1 block">Địa chỉ</label>
//         <Input {...register("address")} placeholder="Số nhà, Tên đường..." />
//       </div>

//       <div>
//         <label className="text-sm font-medium mb-1 block">Châm ngôn sống</label>
//         <Input
//           {...register("quote")}
//           placeholder="Viết một câu nói bạn thích..."
//         />
//       </div>

//       <div className="flex justify-end pt-4">
//         <Button type="submit" disabled={isPending}>
//           {isPending ? "Đang lưu..." : "Lưu thay đổi"}
//         </Button>
//       </div>
//     </form>
//   );
// };

// // ==========================================
// // 3. COMPONENT: FORM ĐỔI MẬT KHẨU
// // ==========================================
// const ChangePasswordForm = ({ setOpen }: { setOpen: (v: boolean) => void }) => {
//   const { mutate: changePassword, isPending } = useChangePasswordMutation();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ChangePasswordTypes>({
//     resolver: zodResolver(ChangePasswordSchema),
//   });

//   const onSubmit = (data: ChangePasswordTypes) => {
//     changePassword(data, {
//       onSuccess: () => setOpen(false),
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
//       <div>
//         <label className="text-sm font-medium mb-1 block">
//           Mật khẩu hiện tại
//         </label>
//         <Input
//           type="password"
//           {...register("currentPassword")}
//           placeholder="Nhập mật khẩu hiện tại"
//         />
//         {errors.currentPassword && (
//           <p className="text-xs text-red-500 mt-1">
//             {errors.currentPassword.message}
//           </p>
//         )}
//       </div>
//       <div>
//         <label className="text-sm font-medium mb-1 block">Mật khẩu mới</label>
//         <Input
//           type="password"
//           {...register("newPassword")}
//           placeholder="Mật khẩu ít nhất 6 ký tự"
//         />
//         {errors.newPassword && (
//           <p className="text-xs text-red-500 mt-1">
//             {errors.newPassword.message}
//           </p>
//         )}
//       </div>
//       <div>
//         <label className="text-sm font-medium mb-1 block">
//           Xác nhận mật khẩu mới
//         </label>
//         <Input
//           type="password"
//           {...register("confirmPassword")}
//           placeholder="Nhập lại mật khẩu mới"
//         />
//         {errors.confirmPassword && (
//           <p className="text-xs text-red-500 mt-1">
//             {errors.confirmPassword.message}
//           </p>
//         )}
//       </div>
//       <div className="flex justify-end pt-4">
//         <Button type="submit" disabled={isPending}>
//           {isPending ? "Đang xử lý..." : "Lưu mật khẩu"}
//         </Button>
//       </div>
//     </form>
//   );
// };

// // ==========================================
// // 4. MAIN PAGE
// // ==========================================
// export const ProfilePage = () => {
//   const { data: userData, isLoading } = useUser();
//   const { mutateAsync: uploadImage } = useUploadMutation();
//   const { mutateAsync: updateProfile } = useUpdateProfileMutation();

//   const [openProfile, setOpenProfile] = useState(false);
//   const [openPassword, setOpenPassword] = useState(false);

//   // State quản lý Menu hiển thị (Xem ảnh/Đổi ảnh)
//   const [activeMenu, setActiveMenu] = useState<"avatar" | "cover" | null>(null);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [uploadTarget, setUploadTarget] = useState<
//     "avatarImg" | "coverImg" | null
//   >(null);

//   if (isLoading) return <LoadingState />;
//   // Dùng chung tuyệt chiêu moi data cho màn hình ở ngoài
//   // =====================================================
//   // 1. GOM HẾT DATA VÀO ĐÂY (Khai báo 1 lần duy nhất)
//   // =====================================================
//   const rawData = userData as any;
//   const userInfo =
//     rawData?.value?.data?.user ||
//     rawData?.value?.user ||
//     rawData?.value ||
//     rawData?.data?.user ||
//     rawData?.user ||
//     rawData;
//   const role =
//     rawData?.value?.data?.role ||
//     rawData?.value?.role ||
//     rawData?.data?.role ||
//     rawData?.role;
//   const email =
//     rawData?.value?.data?.email ||
//     rawData?.value?.email ||
//     rawData?.data?.email ||
//     rawData?.email;

//   const fullName = userInfo
//     ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
//     : "Admin";

//   const renderAvatar = () => {
//     if (userInfo?.avatarImg) {
//       return (
//         <img
//           src={userInfo.avatarImg}
//           alt="Avatar"
//           className="w-full h-full object-cover rounded-full"
//         />
//       );
//     }
//     return userInfo?.firstName?.charAt(0) || "U";
//   };

//   // =====================================================
//   // 2. HÀM UPLOAD ẢNH CỦA BÁC (Đã sửa user thành userInfo)
//   // =====================================================
//   // =====================================================
//   // 2. HÀM UPLOAD ẢNH CỦA BÁC (Đã bổ sung Bước 2)
//   // =====================================================
//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file || !userInfo?.id || !uploadTarget) return;

//     try {
//       toast.info("Đang tải ảnh lên Cloudinary...");
//       const folderName = uploadTarget === "avatarImg" ? "avatars" : "covers";

//       // BƯỚC 1: Up lên Server lấy Link
//       const uploadRes = await uploadImage({ file, folder: folderName });

//       // LOG RA ĐỂ BẮT TẬN TAY NÓ TRẢ VỀ CÁI GÌ (F12 coi Console nha)
//       console.log("Cục data lúc up ảnh xong:", uploadRes);

//       // QUÉT MỌI NGÓC NGÁCH ĐỂ TÌM CÁI LINK URL (Bao trọn ổ)
//       const imageUrl =
//         uploadRes?.url ||
//         uploadRes?.value?.url ||
//         uploadRes?.data?.value?.url ||
//         uploadRes?.data?.url;

//       if (!imageUrl) {
//         toast.error(
//           "Lạ hén! Bác F12 mở Console coi cái log 'Cục data...' nó chứa gì rồi gửi tui coi!",
//         );
//         return;
//       }

//       toast.info("Đang lưu link ảnh vào hồ sơ...");

//       // BƯỚC 2: Gọi API Update Profile để cất cái Link vào Database
//       const payload = {
//         firstName: userInfo.firstName,
//         lastName: userInfo.lastName,
//         position: userInfo.position,
//         phone: userInfo.phone,
//         address: userInfo.address,
//         hobby: userInfo.hobby,
//         quote: userInfo.quote,
//         avatarImg: uploadTarget === "avatarImg" ? imageUrl : userInfo.avatarImg,
//         coverImg: uploadTarget === "coverImg" ? imageUrl : userInfo.coverImg,
//       };

//       await updateProfile({ userId: userInfo.id, data: payload });
//     } catch (error) {
//       console.log(error);
//       toast.error("Có lỗi xảy ra khi up ảnh ròi!");
//     } finally {
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       setActiveMenu(null);
//     }
//   };

//   const triggerUpload = (target: "avatarImg" | "coverImg") => {
//     setUploadTarget(target);
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="max-w-4xl mx-auto pb-10">
//       {/* INPUT FILE ẨN CỦA HỆ THỐNG */}
//       <input
//         type="file"
//         hidden
//         ref={fileInputRef}
//         accept="image/*"
//         onChange={handleFileChange}
//       />

//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
//         {/* 1. ẢNH BÌA (COVER) */}
//         <div className="h-64 sm:h-80 w-full relative group">
//           {userInfo?.coverImg ? (
//             <img
//               src={userInfo.coverImg}
//               alt="Cover"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-r from-blue-500 to-primary opacity-80"></div>
//           )}

//           {/* Menu Hover Ảnh Bìa */}
//           <div
//             className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
//             onClick={() =>
//               setActiveMenu(activeMenu === "cover" ? null : "cover")
//             }
//           >
//             <Camera className="w-4 h-4" />{" "}
//             <span className="text-sm font-medium">Chỉnh sửa ảnh bìa</span>
//           </div>

//           {activeMenu === "cover" && (
//             <div className="absolute top-14 left-4 bg-white rounded-lg shadow-lg p-2 w-48 z-10 animate-in fade-in zoom-in duration-200">
//               {userInfo?.coverImg && (
//                 <div
//                   className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                   onClick={() => {
//                     window.open(userInfo.coverImg as string, "_blank");
//                     setActiveMenu(null);
//                   }}
//                 >
//                   <Eye className="w-4 h-4" />{" "}
//                   <span className="text-sm">Xem ảnh bìa</span>
//                 </div>
//               )}
//               <div
//                 className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                 onClick={() => triggerUpload("coverImg")}
//               >
//                 <ImageIcon className="w-4 h-4" />{" "}
//                 <span className="text-sm">Tải ảnh lên</span>
//               </div>
//             </div>
//           )}

//           {/* 2. AVATAR */}
//           <div className="absolute -bottom-16 left-8 sm:left-12 group/avatar">
//             <div
//               className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative cursor-pointer"
//               onClick={() =>
//                 setActiveMenu(activeMenu === "avatar" ? null : "avatar")
//               }
//             >
//               {renderAvatar()}

//               {/* Overlay đen lúc hover Avatar */}
//               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
//                 <Camera className="w-8 h-8 text-white" />
//               </div>
//             </div>

//             {/* Menu Pop-up Avatar */}
//             {activeMenu === "avatar" && (
//               <div className="absolute top-[170px] left-0 bg-white rounded-lg shadow-xl p-2 w-48 z-20 animate-in slide-in-from-top-2">
//                 {userInfo?.avatarImg && (
//                   <div
//                     className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                     onClick={() => {
//                       window.open(userInfo.avatarImg as string, "_blank");
//                       setActiveMenu(null);
//                     }}
//                   >
//                     <Eye className="w-4 h-4" />{" "}
//                     <span className="text-sm">Xem ảnh đại diện</span>
//                   </div>
//                 )}
//                 <div
//                   className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                   onClick={() => triggerUpload("avatarImg")}
//                 >
//                   <ImageIcon className="w-4 h-4" />{" "}
//                   <span className="text-sm">Tải ảnh lên</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* 3. BODY */}
//         <div
//           className="pt-20 pb-8 px-8 sm:px-12 relative"
//           onClick={() => setActiveMenu(null)}
//         >
//           {/* Nhóm Modal Hành Động */}
//           <div className="absolute top-6 right-6 sm:right-12 flex gap-3">
//             <Dialog open={openProfile} onOpenChange={setOpenProfile}>
//               <DialogTrigger asChild>
//                 <Button variant="outline" className="flex items-center gap-2">
//                   <Edit className="w-4 h-4" />{" "}
//                   <span className="hidden sm:inline">Cập nhật hồ sơ</span>
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[600px]">
//                 <DialogHeader>
//                   <DialogTitle>Cập nhật hồ sơ cá nhân</DialogTitle>
//                 </DialogHeader>
//                 <UpdateProfileForm
//                   userData={userData}
//                   setOpen={setOpenProfile}
//                 />
//               </DialogContent>
//             </Dialog>

//             <Dialog open={openPassword} onOpenChange={setOpenPassword}>
//               <DialogTrigger asChild>
//                 <Button className="flex items-center gap-2">
//                   <KeyRound className="w-4 h-4" />{" "}
//                   <span className="hidden sm:inline">Đổi mật khẩu</span>
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                   <DialogTitle>Đổi mật khẩu</DialogTitle>
//                 </DialogHeader>
//                 <ChangePasswordForm setOpen={setOpenPassword} />
//               </DialogContent>
//             </Dialog>
//           </div>

//           {/* ... Thông tin Text hiển thị y như cũ ... */}
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
//               {fullName || "Người dùng ẩn danh"}
//             </h1>
//             <p className="text-lg font-medium text-primary mt-1">
//               {userInfo?.position || role}
//             </p>
//           </div>
//           {userInfo?.quote && (
//             <div className="mt-6 flex items-start gap-3 bg-slate-50 p-4 rounded-lg border-l-4 border-primary">
//               <Quote className="w-6 h-6 text-primary/50 shrink-0 mt-1" />
//               <p className="text-gray-700 italic text-lg leading-relaxed">
//                 "{userInfo.quote}"
//               </p>
//             </div>
//           )}

//           {/* (Phần lưới hiển thị Email, Phone, Address... tui lược đi cho bớt dài, bác bê y nguyên phần cũ dán vào là đẹp) */}
//         </div>
//       </div>
//     </div>
//   );
// };
