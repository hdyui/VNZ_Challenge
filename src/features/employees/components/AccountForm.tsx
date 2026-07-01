// src/features/accounts/components/AccountForm.tsx
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAccountSchema, type CreateAccountFormValues } from "../schema";
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
import { Link } from "react-router-dom";

interface AccountFormProps {
  onSubmit: (data: CreateAccountFormValues) => void;
  isLoading?: boolean;
}

export const AccountForm = ({
  onSubmit,
  isLoading = false,
}: AccountFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      role: "Employee",
      status: "Active",
    },
  });

  return (
    <Card className="max-w-5xl mx-auto shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800">
          Thêm tài khoản nhân viên
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          {/* PHẦN 1: THÔNG TIN TÀI KHOẢN */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
              1. Thông tin đăng nhập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("email")}
                  placeholder="nguyenvana@gmail.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Mật khẩu ít nhất 6 ký tự"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
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
                        <SelectValue placeholder="Chọn vai trò" />
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
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Hoạt động</SelectItem>
                        <SelectItem value="Inactive">Khóa</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* PHẦN 2: THÔNG TIN CÁ NHÂN (USER PROFILE) */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
              2. Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input {...register("lastName")} placeholder="Nguyễn Văn" />
                {errors.lastName && (
                  <p className="text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input {...register("firstName")} placeholder="A" />
                {errors.firstName && (
                  <p className="text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Chức vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("position")}
                  placeholder="Developer, HR..."
                />
                {errors.position && (
                  <p className="text-xs text-red-500">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input {...register("phone")} placeholder="0901234567" />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ</Label>
                <Input
                  {...register("address")}
                  placeholder="Số nhà, Tên đường..."
                />
              </div>
            </div>
          </div>

          {/* PHẦN 3: FILE ẢNH (OPTIONAL) */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
              3. Ảnh hồ sơ (Tùy chọn)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ảnh đại diện (Avatar)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  {...register("avatarImg")}
                />
              </div>
              <div className="space-y-2">
                <Label>Ảnh bìa (Cover)</Label>
                <Input type="file" accept="image/*" {...register("coverImg")} />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 bg-gray-50/50 px-6 py-4 border-t">
          <Link to="/admin/accounts" tabIndex={isLoading ? -1 : 0}>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-24"
            >
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-40 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
