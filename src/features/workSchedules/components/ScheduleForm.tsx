import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { workScheduleSchema, type WorkScheduleFormValues } from "../schema";
import { WorkScheduleStatus } from "../type";
import type { SimpleOption } from "./ScheduleFilterBar";
import ScheduleStatusBadge from "./ScheduleStatusBadge";
// Loại nhân viên đang có đơn nghỉ đã duyệt (Accepted) trùng workDate ra
// khỏi dropdown chọn nhân viên, tránh xếp lịch làm việc đè lên ngày nghỉ.
import { useApprovedLeaveEmployeeIds } from "@/features/leave-application/hooks/useLeaveApplications";

interface ShiftOption extends SimpleOption {
  startTime: string;
  endTime: string;
}

interface ScheduleFormProps {
  defaultValues?: Partial<WorkScheduleFormValues>;
  // Chỉ để HIỂN THỊ khi sửa lịch đã tồn tại — không cho chọn tay.
  // Off/Absent chỉ được set gián tiếp khi admin duyệt đơn xin nghỉ.
  currentStatus?: WorkScheduleStatus;
  employees: SimpleOption[];
  shifts: ShiftOption[];
  onSubmit: (values: WorkScheduleFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function ScheduleForm({
  defaultValues,
  currentStatus,
  employees,
  shifts,
  onSubmit,
  isSubmitting,
  submitLabel = "Lưu",
}: ScheduleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkScheduleFormValues>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      employeeId: "",
      shiftId: null,
      workDate: "",
      startTime: "",
      endTime: "",
      isFlexibleShift: false,
      note: "",
      ...defaultValues,
    },
  });

  const isFlexibleShift = watch("isFlexibleShift");
  const selectedShiftId = watch("shiftId");
  const workDate = watch("workDate");
  const selectedEmployeeId = watch("employeeId");

  // Set employeeId đang nghỉ phép (đã duyệt) đúng ngày workDate đang chọn.
  const { data: leaveEmployeeIds } = useApprovedLeaveEmployeeIds(
    workDate || undefined,
  );

  // Ẩn nhân viên đang nghỉ phép khỏi dropdown, NHƯNG vẫn giữ lại nhân viên
  // đang được chọn sẵn (trường hợp sửa lịch cũ) để không làm mất giá trị
  // hiện tại của form — chỉ đánh dấu cảnh báo bên cạnh.
  const selectableEmployees = useMemo(() => {
    if (!leaveEmployeeIds || leaveEmployeeIds.size === 0) return employees;
    return employees.filter(
      (e) => !leaveEmployeeIds.has(e.id) || e.id === selectedEmployeeId,
    );
  }, [employees, leaveEmployeeIds, selectedEmployeeId]);

  const isSelectedEmployeeOnLeave =
    !!selectedEmployeeId && !!leaveEmployeeIds?.has(selectedEmployeeId);

  const handleShiftChange = (shiftId: string) => {
    setValue("shiftId", shiftId || null);
    const shift = shifts.find((s) => s.id === shiftId);
    if (shift) {
      setValue("startTime", shift.startTime);
      setValue("endTime", shift.endTime);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngày làm việc <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register("workDate")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {errors.workDate && (
          <p className="mt-1 text-sm text-red-500">{errors.workDate.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nhân viên <span className="text-red-500">*</span>
        </label>
        <select
          {...register("employeeId")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">-- Chọn nhân viên --</option>
          {selectableEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.id === selectedEmployeeId && isSelectedEmployeeOnLeave
                ? `${e.name} (đang nghỉ phép ngày này)`
                : e.name}
            </option>
          ))}
        </select>
        {errors.employeeId && (
          <p className="mt-1 text-sm text-red-500">
            {errors.employeeId.message}
          </p>
        )}
        {!!workDate && !!leaveEmployeeIds?.size && (
          <p className="mt-1 text-xs text-amber-600">
            Đã ẩn {leaveEmployeeIds.size} nhân viên đang nghỉ phép (đã duyệt)
            vào ngày {workDate}.
          </p>
        )}
        {isSelectedEmployeeOnLeave && (
          <p className="mt-1 text-xs text-red-500">
            Nhân viên này đang có đơn nghỉ đã duyệt trùng ngày làm việc — cân
            nhắc đổi ngày hoặc chọn nhân viên khác.
          </p>
        )}
      </div>

      <Controller
        control={control}
        name="isFlexibleShift"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFlexibleShift"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isFlexibleShift" className="text-sm text-gray-700">
              Ca linh hoạt (tự nhập giờ thay vì chọn ca cố định)
            </label>
          </div>
        )}
      />

      {!isFlexibleShift ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ca làm <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedShiftId ?? ""}
            onChange={(e) => handleShiftChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">-- Chọn ca làm --</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
              </option>
            ))}
          </select>
          {errors.shiftId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shiftId.message as string}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              step={1}
              {...register("startTime")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-500">
                {errors.startTime.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              step={1}
              {...register("endTime")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-500">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>
      )}
      {currentStatus && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái hiện tại
          </label>
          <div className="flex items-center gap-2">
            <ScheduleStatusBadge status={currentStatus} />
            <span className="text-xs text-gray-500">
              (chỉ đổi được qua duyệt đơn xin nghỉ, không chỉnh tay ở đây)
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          {...register("note")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Ghi chú thêm (không bắt buộc)"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
