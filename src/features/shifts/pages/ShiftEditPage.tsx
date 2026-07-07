import { Link, useNavigate, useParams } from "react-router-dom";
import ShiftForm from "../components/ShiftForm";
import { useShiftList, useUpdateShift } from "../hooks/useShifts";
import type { ShiftFormValues } from "../schema";
import { formatTimeShort } from "../utils/shiftValidation.util";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M12.5 5 7 10l5.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShiftEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateMutation = useUpdateShift();

  // NOTE: nếu backend có sẵn GET /api/shifts/{id} nên dùng riêng useShiftDetail
  // thay vì lọc từ danh sách. Ở đây tạm lấy từ list (pageSize lớn) cho đơn giản.
  const { data, isLoading } = useShiftList({ pageSize: 100 });

  const shift = data?.value.items.find((s) => s.id === id);

  if (isLoading) {
    return <div className="p-6 text-gray-500">Đang tải...</div>;
  }

  if (!shift) {
    return <div className="p-6 text-red-500">Không tìm thấy ca làm.</div>;
  }

  const handleSubmit = (values: ShiftFormValues) => {
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        payload: { ...values, description: values.description || undefined },
      },
      {
        onSuccess: () => navigate("/admin/shifts"),
      },
    );
  };

  return (
    <div className="p-6">
      <Link
        to="/admin/shifts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-[#0F6B66]"
      >
        <ArrowLeftIcon />
        Danh sách ca làm
      </Link>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Cập nhật ca làm
      </h1>
      <ShiftForm
        defaultValues={{
          name: shift.name,
          startTime: formatTimeShort(shift.startTime) + ":00",
          endTime: formatTimeShort(shift.endTime) + ":00",
          description: shift.description ?? "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
