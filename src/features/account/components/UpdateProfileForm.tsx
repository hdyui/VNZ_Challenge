import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useUpdateProfileMutation } from "../hooks/useUser";
import {
  UpdateProfileSchema,
  type UpdateProfileSchemaType,
} from "@/features/employees/schema";

const UpdateProfileForm = ({
  userInfo,
  onSuccess,
}: {
  userInfo: any;
  onSuccess?: () => void;
}) => {
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation(
    userInfo?.id,
  );
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
    updateProfile(data, { onSuccess: () => onSuccess?.() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Họ"
          reg={register("lastName")}
          err={errors.lastName?.message}
        />
        <Field
          label="Tên"
          reg={register("firstName")}
          err={errors.firstName?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Chức vụ"
          reg={register("position")}
          err={errors.position?.message}
        />
        <Field
          label="Số điện thoại"
          reg={register("phone")}
          err={errors.phone?.message}
        />
      </div>
      <Field label="Sở thích" reg={register("hobby")} />
      <Field label="Địa chỉ" reg={register("address")} />
      <Field label="Châm ngôn sống" reg={register("quote")} />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
};

// ô input nhỏ dùng lại cho gọn
const Field = ({
  label,
  reg,
  err,
}: {
  label: string;
  reg: any;
  err?: string;
}) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <Input {...reg} />
    {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
  </div>
);

export default UpdateProfileForm;
