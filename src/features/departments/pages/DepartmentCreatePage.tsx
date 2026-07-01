// src/features/departments/pages/DepartmentCreatePage.tsx
import { DepartmentForm } from "../components/DepartmentForm";
import { useCreateDepartment } from "../hooks/useDepartment";
import type { DepartmentFormValues } from "../schema";

export const DepartmentCreatePage = () => {
  const { mutate: createDepartment, isPending } = useCreateDepartment();

  const handleCreate = (data: DepartmentFormValues) => {
    createDepartment(data);
  };

  return (
    <div className="py-4 animate-in fade-in duration-300">
      <DepartmentForm onSubmit={handleCreate} isLoading={isPending} />
    </div>
  );
};
