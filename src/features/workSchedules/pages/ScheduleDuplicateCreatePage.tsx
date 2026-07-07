import { useNavigate } from "react-router-dom";
import ScheduleDuplicateForm from "../components/ScheduleDuplicateForm";
import { useDuplicateCreateWorkSchedule } from "../hooks/useWorkSchedules";
import type { DuplicateCreateFormValues } from "../schema";
import { useEmployeeOptions } from "../hooks/useEmployeeOptions";

/**
 * Trang "Nhân bản lịch làm việc".
 *
 * QUAN TRỌNG: đây KHÔNG phải form tạo lịch lặp theo daysOfWeek như bản cũ.
 * Theo API thật (POST /work-schedules/duplicate-create), chức năng này
 * COPY lịch làm việc đã tồn tại trong khoảng [sourceFromDate, sourceToDate]
 * và dán vào bắt đầu từ targetFromDate, áp dụng cho nhiều employeeIds cùng lúc.
 */
export default function ScheduleDuplicateCreatePage() {
  const navigate = useNavigate();
  const duplicateMutation = useDuplicateCreateWorkSchedule();

  const { data: employees = [] } = useEmployeeOptions();

  const handleSubmit = (values: DuplicateCreateFormValues) => {
    duplicateMutation.mutate(
      {
        sourceFromDate: values.sourceFromDate,
        sourceToDate: values.sourceToDate,
        targetFromDate: values.targetFromDate,
        employeeIds: values.employeeIds,
      },
      {
        onSuccess: () => navigate("/admin/schedules"),
      },
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        Nhân bản lịch làm việc
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Sao chép lịch làm việc đã có trong một khoảng ngày và áp dụng lại bắt
        đầu từ một ngày khác, cho một hoặc nhiều nhân viên cùng lúc.
      </p>
      <ScheduleDuplicateForm
        employees={employees}
        onSubmit={handleSubmit}
        isSubmitting={duplicateMutation.isPending}
      />
    </div>
  );
}
