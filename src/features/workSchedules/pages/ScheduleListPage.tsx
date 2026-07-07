import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ScheduleFilterBar from "../components/ScheduleFilterBar";
import PendingLeaveBanner from "@/features/leave-application/components/PendingLeaveBanner";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleStatusBadge from "../components/ScheduleStatusBadge";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  useDeleteWorkSchedule,
  useWorkScheduleList,
} from "../hooks/useWorkSchedules";

import { computeYearOverview } from "../utils/computeYearOverview";
import type { ScheduleView, WorkSchedule, WorkScheduleStatus } from "../type";
import { format } from "date-fns";
import { getScheduleDateRange } from "../utils/scheduleConflict.util";
import { useEmployeeOptions } from "../hooks/useEmployeeOptions";
import { useShiftList } from "@/features/shifts/hooks/useShifts";

// NOTE: chưa có endpoint department nào được xác nhận -> giữ mảng rỗng
// cho tới khi có API thật.
// import { useDepartmentOptions } from '@/features/departments';

export default function ScheduleListPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ScheduleView>("month");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [status, setStatus] = useState<WorkScheduleStatus | undefined>();

  const { data: employees = [] } = useEmployeeOptions();
  const { data: shiftsResult } = useShiftList();
  // shiftServices.getAll trả PagedResult<Shift> = { value: { items: [...] } }
  // (interceptor CHƯA tự unwrap field `value`, giống work-schedules).
  const shifts = shiftsResult?.value?.items ?? [];
  // const { data: departments = [] } = useDepartmentOptions();
  const departments: { id: string; name: string }[] = [];

  const selectedDate = useMemo(() => new Date(date), [date]);

  // Backend GET /work-schedules chỉ lọc theo fromDate/toDate/employeeId.
  // departmentId/status không được backend hỗ trợ -> lọc thêm ở client bên dưới.
  const query = useMemo(
    () => ({
      ...getScheduleDateRange(view, selectedDate),
      employeeId,
    }),
    [view, selectedDate, employeeId],
  );

  const { data, isLoading } = useWorkScheduleList(query);
  const deleteMutation = useDeleteWorkSchedule();

  // BE chỉ trả employeeId/shiftId (không kèm tên) -> tự map tên ở client
  // dựa trên danh sách employees/shifts đã fetch sẵn (dropdown filter).
  const employeeNameMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e.name])),
    [employees],
  );
  const shiftNameMap = useMemo(
    () => new Map(shifts.map((s) => [s.id, s.name])),
    [shifts],
  );

  const schedules: WorkSchedule[] = useMemo(() => {
    const list = data ?? [];
    return list
      .filter((s) => {
        if (departmentId && s.departmentId !== departmentId) return false;
        if (status && s.status !== status) return false;
        return true;
      })
      .map((s) => ({
        ...s,
        employeeName:
          employeeNameMap.get(s.employeeId) ?? "(Không rõ nhân viên)",
        shiftName: s.isFlexibleShift
          ? s.shiftName
          : s.shiftId
            ? (shiftNameMap.get(s.shiftId) ?? "(Không rõ ca)")
            : "(Không rõ ca)",
      }));
  }, [data, departmentId, status, employeeNameMap, shiftNameMap]);

  // Backend không có endpoint year-overview riêng -> tự tính ở client
  // từ danh sách lịch cả năm khi view === 'year'.
  const yearOverview = useMemo(
    () =>
      view === "year"
        ? computeYearOverview(schedules, selectedDate.getFullYear())
        : null,
    [view, schedules, selectedDate],
  );

  const handleSelectEvent = (schedule: WorkSchedule) => {
    navigate(`/admin/schedules/update/${schedule.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa lịch làm việc này?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Lịch làm việc</h1>
          <p className="text-sm text-gray-500">
            Quản lý lịch làm việc của nhân viên theo ngày/tuần/tháng/năm
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/schedules/duplicate-create"
            className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Nhân bản lịch
          </Link>
          <Link
            to="/admin/schedules/create"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Tạo lịch
          </Link>
          <Link
            to="/admin/leave-applications"
            className="rounded-md border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
          >
            Đơn xin nghỉ
          </Link>
        </div>
      </div>

      <ScheduleFilterBar
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        employeeId={employeeId}
        onEmployeeChange={setEmployeeId}
        departmentId={departmentId}
        onDepartmentChange={setDepartmentId}
        status={status}
        onStatusChange={setStatus}
        employees={employees}
        departments={departments}
      />

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      ) : view === "year" && yearOverview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {yearOverview.months.map((m) => (
            <div
              key={m.month}
              className="rounded-lg border border-gray-200 p-4 bg-white"
            >
              <p className="text-sm font-medium text-gray-500">
                Tháng {m.month}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {m.totalWorkingHours}h làm việc
              </p>
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <p>Ngày làm việc: {m.totalWorkingDays}</p>
                <p>Ngày nghỉ: {m.totalOffDays}</p>
                <p>Vắng mặt: {m.totalAbsentDays}</p>
                <p>Hoàn thành: {m.totalCompletedDays}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <ScheduleCalendar
            schedules={schedules}
            view={view}
            date={selectedDate}
            onNavigate={(d) => setDate(format(d, "yyyy-MM-dd"))}
            onSelectEvent={handleSelectEvent}
          />

          {/* Danh sách dạng bảng bổ sung, tiện thao tác xóa nhanh */}
          {schedules.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Nhân viên
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Ca làm
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Giờ
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.employeeName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.workDate}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.isFlexibleShift ? "Linh hoạt" : s.shiftName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                      </td>
                      <td className="px-4 py-3">
                        <ScheduleStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <Link
                          to={`/admin/schedules/update/${s.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
