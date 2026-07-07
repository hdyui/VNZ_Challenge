// src/features/accounts/pages/AccountEditPage.tsx
import { useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  KeyRound,
  UserCog,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  useAccountDetail,
  useUpdateAccount,
  useResetPassword,
} from "@/features/employees/hooks/useAccount";
import {
  UpdateAccountSchema,
  ResetPasswordSchema,
  type UpdateAccountFormValues,
  type ResetPasswordFormValues,
} from "../schema";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// ─── COMPONENT: MODAL ĐỔI MẬT KHẨU ─────────────────────────────────────────────
const ResetPasswordModal = ({
  isOpen,
  onClose,
  accountId,
}: {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  accountId: string;
}) => {
  const { mutate: resetPass, isPending } = useResetPassword(accountId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPass(data, {
      onSuccess: () => {
        onClose(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-gray-100 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-gray-50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ShieldAlert className="w-5 h-5 text-gray-700" />
            Đặt lại mật khẩu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 py-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Mật khẩu mới <span className="text-gray-900">*</span>
              </Label>
              <Input
                type="password"
                {...register("newPassword")}
                placeholder="Nhập mật khẩu mới"
                className="rounded-xl border-gray-200 focus-visible:ring-gray-200 focus-visible:border-gray-400 transition-all h-11"
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Xác nhận mật khẩu <span className="text-gray-900">*</span>
              </Label>
              <Input
                type="password"
                {...register("confirmPassword")}
                placeholder="Nhập lại mật khẩu mới"
                className="rounded-xl border-gray-200 focus-visible:ring-gray-200 focus-visible:border-gray-400 transition-all h-11"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onClose(false)}
              disabled={isPending}
              className="rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-black hover:to-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium border-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── COMPONENT CHÍNH: TRANG CẬP NHẬT TÀI KHOẢN ────────────────────────────────
export const AccountEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isResetOpen, setIsResetOpen] = useState(false);

  const { data: accountData, isLoading: isFetching } = useAccountDetail(id!);
  const { mutate: updateAccount, isPending } = useUpdateAccount(id!);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateAccountFormValues>({
    resolver: zodResolver(UpdateAccountSchema),
    defaultValues: {
      email: "",
      role: undefined, // Setup undefined để hiện Placeholder
      status: undefined,
    },
  });

  useEffect(() => {
    const detail = accountData?.value || accountData?.data || accountData;
    if (detail) {
      reset({
        email: detail.email,
        role: detail.role,
        status: detail.status,
      });
    }
  }, [accountData, reset]);

  const onSubmit = (data: UpdateAccountFormValues) => {
    updateAccount(data);
  };

  if (isFetching)
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        <p className="text-sm font-medium">Đang tải dữ liệu tài khoản...</p>
      </div>
    );

  return (
    <div className="py-6 animate-in fade-in duration-500 font-sans">
      {/* ── Nút Quay lại ── */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link to="/admin/accounts">
          <Button
            variant="ghost"
            className="gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-3 transition-colors -ml-3"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50/80 bg-white px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
              <UserCog className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-gray-900 tracking-tight">
                Cập nhật tài khoản
              </CardTitle>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Quản lý quyền và trạng thái hoạt động
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetOpen(true)}
            className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <KeyRound size={16} className="mr-2" />
            Đổi mật khẩu
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 px-8 pt-8 pb-6">
            {/* ── Email ── */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Địa chỉ Email
              </Label>
              <Input
                {...register("email")}
                className="rounded-xl border-gray-200 focus-visible:ring-gray-200 focus-visible:border-gray-400 transition-all h-11 bg-gray-50/50"
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── Vai trò (Role) ── */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Vai trò hệ thống
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl border-gray-200 focus:ring-gray-200 focus:border-gray-400 transition-all h-11 bg-white">
                        <SelectValue placeholder="-- Chọn vai trò --" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                        <SelectItem
                          value="Admin"
                          className="rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Admin (Quản trị)
                        </SelectItem>
                        <SelectItem
                          value="Employee"
                          className="rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Employee (Nhân viên)
                        </SelectItem>
                        <SelectItem
                          value="Applicant"
                          className="rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          Applicant (Ứng viên)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* ── Trạng thái (Status) ── */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái hoạt động
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl border-gray-200 focus:ring-gray-200 focus:border-gray-400 transition-all h-11 bg-white">
                        <SelectValue placeholder="-- Chọn trạng thái --" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-lg">
                        <SelectItem
                          value="Active"
                          className="rounded-lg hover:bg-gray-50 cursor-pointer font-medium text-gray-900"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-900" />{" "}
                            Hoạt động
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="Inactive"
                          className="rounded-lg hover:bg-gray-50 cursor-pointer font-medium text-gray-500"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />{" "}
                            Khóa (Inactive)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 bg-gray-50/50 px-8 py-5 border-t border-gray-50">
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-black hover:to-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium border-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* COMPONENT MODAL */}
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={setIsResetOpen}
        accountId={id!}
      />
    </div>
  );
};
