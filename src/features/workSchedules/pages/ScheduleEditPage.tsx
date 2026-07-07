import { useNavigate, useParams } from "react-router-dom";
import ScheduleForm from "../components/ScheduleForm";
import {
  useUpdateWorkSchedule,
  useWorkScheduleList,
  useMarkAbsent,
} from "../hooks/useWorkSchedules";
import { WorkScheduleStatus } from "../type";
import type { WorkScheduleFormValues } from "../schema";
import { useShiftList } from "@/features/shifts/hooks/useShifts";
import { useEmployeeOptions } from "../hooks/useEmployeeOptions";

export default function ScheduleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateMutation = useUpdateWorkSchedule();
  const markAbsentMutation = useMarkAbsent();

  // NOTE: nếu backend có GET /api/v1/work-schedules/{id} nên tách hook useScheduleDetail riêng
  // thay vì tải toàn bộ danh sách rồi find như dưới đây.
  const { data, isLoading } = useWorkScheduleList();
  const schedule = data?.find((s) => s.id === id);
  console.log();

  const { data: employees = [] } = useEmployeeOptions();
  const { data: shiftData } = useShiftList({ pageSize: 100 });

  const shifts = (shiftData?.value.items ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  if (isLoading) {
    return <div className="p-6 text-gray-500">Đang tải...</div>;
  }

  if (!schedule) {
    return (
      <div className="p-6 text-red-500">Không tìm thấy lịch làm việc.</div>
    );
  }

  const handleSubmit = (values: WorkScheduleFormValues) => {
    if (!id) return;
    updateMutation.mutate(
      {
        id,
        payload: {
          employeeId: values.employeeId,
          shiftId: values.isFlexibleShift ? null : values.shiftId,
          workDate: values.workDate,
          startTime: values.startTime || undefined,
          endTime: values.endTime || undefined,
          isFlexibleShift: values.isFlexibleShift,
          status: schedule.status,
          note: values.note || undefined,
        },
      },
      {
        onSuccess: () => navigate("/admin/schedules"),
      },
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Cập nhật lịch làm việc
      </h1>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Cập nhật lịch làm việc
        </h1>
        {schedule.status !== WorkScheduleStatus.Absent && (
          <button
            type="button"
            disabled={markAbsentMutation.isPending}
            onClick={() => {
              if (
                confirm(
                  `Đánh dấu ${schedule.employeeName} vắng mặt không phép ngày ${schedule.workDate}?`,
                )
              ) {
                markAbsentMutation.mutate({ id: schedule.id, schedule });
              }
            }}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {markAbsentMutation.isPending
              ? "Đang xử lý..."
              : "Đánh dấu vắng mặt không phép"}
          </button>
        )}
      </div>
      <ScheduleForm
        defaultValues={{
          employeeId: schedule.employeeId,
          shiftId: schedule.shiftId ?? null,
          workDate: schedule.workDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isFlexibleShift: schedule.isFlexibleShift,
          note: schedule.note ?? "",
        }}
        currentStatus={schedule.status}
        employees={employees}
        shifts={shifts}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}
