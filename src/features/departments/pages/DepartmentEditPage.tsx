// src/features/departments/pages/DepartmentEditPage.tsx
import { useParams, Link } from "react-router-dom";
import { DepartmentForm } from "../components/DepartmentForm";
import {
  useDepartmentDetail,
  useUpdateDepartment,
} from "../hooks/useDepartment";
import type { DepartmentFormValues } from "../schema";

export const DepartmentEditPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useDepartmentDetail(id!);
  const { mutate: updateDepartment, isPending } = useUpdateDepartment(id!);

  const handleUpdate = (formData: DepartmentFormValues) => {
    updateDepartment(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        Đang tải thông tin phòng ban...
      </div>
    );
  }

  if (isError || !data?.value) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-500">
        <p>Không tìm thấy phòng ban.</p>
        <Link
          to="/admin/departments"
          className="text-blue-600 hover:underline text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const department = data.value;
  return (
    <div className="py-4 animate-in fade-in duration-300">
      <DepartmentForm
        initialData={{
          name: department.name,
          departmentCode: department.departmentCode,
          description: department.description,
          isActive: department.isActive,
        }}
        onSubmit={handleUpdate}
        isLoading={isPending}
        isEdit
      />
    </div>
  );
};
