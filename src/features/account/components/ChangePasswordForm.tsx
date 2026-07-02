import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { useChangePasswordMutation } from "@/features/auth/hooks/useAuth";
import {
  ChangePasswordSchema,
  type ChangePasswordTypes,
} from "@/features/employees/schema";

interface Props {
  onSuccess?: () => void;
}
const ChangePasswordForm = ({ onSuccess }: Props) => {
  const { mutate: changePassword, isPending } = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordTypes>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordTypes) => {
    changePassword(data, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div>
        <label className="text-sm font-medium mb-1 block">
          Mật khẩu hiện tại
        </label>
        <Input
          type="password"
          {...register("currentPassword")}
          placeholder="Nhập mật khẩu hiện tại"
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Mật khẩu mới</label>
        <Input
          type="password"
          {...register("newPassword")}
          placeholder="Mật khẩu ít nhất 6 ký tự"
        />
        {errors.newPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">
          Xác nhận mật khẩu mới
        </label>
        <Input
          type="password"
          {...register("confirmPassword")}
          placeholder="Nhập lại mật khẩu mới"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang xử lý..." : "Lưu mật khẩu"}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
