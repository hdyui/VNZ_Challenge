import { useNavigate } from "react-router-dom";
import ScheduleForm from "../components/ScheduleForm";
import { useCreateWorkSchedule } from "../hooks/useWorkSchedules";
import type { WorkScheduleFormValues } from "../schema";
import { useShiftList } from "@/features/shifts/hooks/useShifts";
import { useEmployeeOptions } from "../hooks/useEmployeeOptions";
import { WorkScheduleStatus } from "../type";

export default function ScheduleCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateWorkSchedule();

  const { data: employees = [] } = useEmployeeOptions();
  const { data: shiftData } = useShiftList({ pageSize: 1000 });
  console.log(shiftData?.value.items);

  const shifts = (shiftData?.value.items ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const handleSubmit = (values: WorkScheduleFormValues) => {
    createMutation.mutate(
      {
        employeeId: values.employeeId,
        shiftId: values.isFlexibleShift ? null : values.shiftId,
        workDate: values.workDate,
        startTime: values.startTime || undefined,
        endTime: values.endTime || undefined,
        isFlexibleShift: values.isFlexibleShift,
        status: WorkScheduleStatus.Working,
        note: values.note || undefined,
      },
      {
        onSuccess: () => navigate("/admin/schedules"),
      },
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Tạo lịch làm việc
      </h1>
      <ScheduleForm
        employees={employees}
        shifts={shifts}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Tạo lịch"
      />
    </div>
  );
}
