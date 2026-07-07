import type { ReactNode } from "react";
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

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl p-6 md:p-8">
      <Link
        to="/admin/shifts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-[#0F6B66]"
      >
        <ArrowLeftIcon />
        Danh sách ca làm
      </Link>
      {children}
    </div>
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
    return (
      <PageShell>
        <div className="max-w-lg animate-pulse space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-10 w-full rounded-lg bg-slate-100" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-10 rounded-lg bg-slate-100" />
          </div>
          <div className="h-20 w-full rounded-lg bg-slate-100" />
        </div>
      </PageShell>
    );
  }

  if (!shift) {
    return (
      <PageShell>
        <div className="max-w-lg rounded-2xl border border-red-100 bg-red-50/60 p-6 text-sm font-medium text-red-600">
          Không tìm thấy ca làm.
        </div>
      </PageShell>
    );
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
    <PageShell>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        Cập nhật ca làm
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Chỉnh sửa thông tin cho ca{" "}
        <span className="font-medium text-slate-700">{shift.name}</span>.
      </p>

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
    </PageShell>
  );
}
