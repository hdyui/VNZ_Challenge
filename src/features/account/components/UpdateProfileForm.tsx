import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useUpdateProfileMutation } from "../hooks/useUser";
import {
  UpdateProfileSchema,
  type UpdateProfileSchemaType,
} from "@/features/employees/schema";

interface Props {
  userInfo: any;
  onSuccess?: () => void;
}

const UpdateProfileForm = ({ userInfo, onSuccess }: Props) => {
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  useEffect(() => {
    if (userInfo) {
      reset({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        position: userInfo.position || "",
        phone: userInfo.phone || "",
        address: userInfo.address || "",
        hobby: userInfo.hobby || "",
        quote: userInfo.quote || "",
      });
    }
  }, [userInfo, reset]);

  const onSubmit = (data: UpdateProfileSchemaType) => {
    const trueUserId = userInfo?.id;
    if (!trueUserId) {
      toast.error("Không tìm thấy userId!");
      return;
    }

    updateProfile(
      { userId: trueUserId, data },
      {
        onSuccess: () => onSuccess?.(),
        onError: (err: any) => toast.error(err.message || "Có lỗi xảy ra!"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Họ</label>
          <Input {...register("lastName")} placeholder="Nguyễn Văn" />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Tên</label>
          <Input {...register("firstName")} placeholder="A" />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Chức vụ</label>
          <Input
            {...register("position")}
            placeholder="Nhân viên, Quản lý..."
          />
          {errors.position && (
            <p className="text-xs text-red-500 mt-1">
              {errors.position.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            Số điện thoại
          </label>
          <Input {...register("phone")} placeholder="090123..." />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Sở thích</label>
        <Input {...register("hobby")} placeholder="Đọc sách..." />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Địa chỉ</label>
        <Input {...register("address")} placeholder="Số nhà, Tên đường..." />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Châm ngôn sống</label>
        <Input
          {...register("quote")}
          placeholder="Viết một câu nói bạn thích..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
