// src/features/departments/components/DepartmentStatusBadge.tsx
interface DepartmentStatusBadgeProps {
  isActive: boolean;
}

export const DepartmentStatusBadge = ({
  isActive,
}: DepartmentStatusBadgeProps) => {
  if (isActive) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Đang hoạt động
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
      Đã vô hiệu hóa
    </span>
  );
};
