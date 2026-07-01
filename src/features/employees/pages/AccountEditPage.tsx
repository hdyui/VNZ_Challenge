// src/features/accounts/pages/AccountEditPage.tsx
import { useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
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

// BÊ NGUYÊN DÀN DIALOG CỦA SHADCN VÀO ĐÂY
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// popup reset password --- shadcn

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
        onClose(false); // Đóng Dialog khi thành công
        reset(); // Xóa form
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Shadcn DialogContent đã có sẵn nút X tắt mặc định nên không cần code thêm */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Đặt lại mật khẩu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Mật khẩu mới <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                {...register("newPassword")}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                {...register("confirmPassword")}
                placeholder="Nhập lại mật khẩu mới"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onClose(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
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

// TRANG EDIT CHÍNH
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
  });

  // Khi API lấy data cũ thành công thì nhét vào form
  useEffect(() => {
    // Đón lõng mọi nẻo đường y như trang List
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
      <div className="py-20 text-center">Đang tải dữ liệu tài khoản...</div>
    );

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <Card className="max-w-2xl mx-auto shadow-sm border-gray-200 relative overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b bg-gray-50/50">
          <CardTitle className="text-2xl text-gray-800">
            Cập nhật tài khoản
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <KeyRound size={16} className="mr-2" />
            Đổi mật khẩu
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Hoạt động</SelectItem>
                      <SelectItem value="Inactive">Khóa (Inactive)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 bg-gray-50/50 px-6 py-4 border-t mt-6">
            <Link to="/admin/accounts">
              <Button variant="outline" type="button" disabled={isPending}>
                Quay lại
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* NHÚNG COMPONENT DIALOG VÀO ĐÂY */}
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={setIsResetOpen}
        accountId={id!}
      />
    </div>
  );
};
