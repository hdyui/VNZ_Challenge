import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DepartmentFormSchema, type DepartmentFormValues } from "../schema";
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
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface DepartmentFormProps {
  initialData?: {
    name: string;
    departmentCode: string;
    description?: string;
    isActive: boolean;
  };
  onSubmit: (data: DepartmentFormValues) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const DepartmentForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: DepartmentFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      departmentCode: initialData?.departmentCode ?? "",
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <Card className="max-w-3xl mx-auto shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800">
          {isEdit ? "Cập nhật phòng ban" : "Tạo phòng ban mới"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700"
              >
                Tên phòng ban <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ví dụ: Engineering"
                className="focus-visible:ring-blue-500"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="departmentCode"
                className="text-sm font-semibold text-gray-700"
              >
                Mã phòng ban (Unique) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="departmentCode"
                {...register("departmentCode")}
                placeholder="Ví dụ: ENG"
                className="focus-visible:ring-blue-500"
                disabled={isEdit}
              />
              {errors.departmentCode && (
                <p className="text-xs text-red-500">
                  {errors.departmentCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Trạng thái hoạt động
            </Label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(val) => field.onChange(val === "true")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Đang hoạt động</SelectItem>
                    <SelectItem value="false">Vô hiệu hóa</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.isActive && (
              <p className="text-xs text-red-500">{errors.isActive.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 bg-gray-50/50 px-6 py-4 border-t">
          <Link to="/admin/departments" tabIndex={isLoading ? -1 : 0}>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-24 disabled:opacity-50"
            >
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-40 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Tạo phòng ban"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
