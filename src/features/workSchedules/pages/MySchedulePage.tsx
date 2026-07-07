import { useMemo, useState } from "react";
import ScheduleFilterBar from "../components/ScheduleFilterBar";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleStatusBadge from "../components/ScheduleStatusBadge";
import { useWorkScheduleList } from "../hooks/useWorkSchedules";

import { computeYearOverview } from "../utils/computeYearOverview";
import type { ScheduleView, WorkSchedule } from "../type";
import { getScheduleDateRange } from "../utils/scheduleConflict.util";
import { format } from "date-fns";

/**
 * Trang xem lịch cá nhân dành cho Employee.
 * KHÔNG truyền employeeId lên query — backend tự lấy employeeId từ access token.
 * Không hiển thị filter theo nhân viên/phòng ban vì Employee chỉ được xem lịch của chính mình.
 */
export default function MySchedulePage() {
  const [view, setView] = useState<ScheduleView>("month");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const selectedDate = useMemo(() => new Date(date), [date]);

  const query = useMemo(
    () => getScheduleDateRange(view, selectedDate),
    [view, selectedDate],
  );

  const { data, isLoading } = useWorkScheduleList(query);
  const schedules: WorkSchedule[] = data ?? [];

  const yearOverview = useMemo(
    () =>
      view === "year"
        ? computeYearOverview(schedules, selectedDate.getFullYear())
        : null,
    [view, schedules, selectedDate],
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Lịch làm việc của tôi
        </h1>
        <p className="text-sm text-gray-500">
          Xem lịch làm việc cá nhân theo ngày, tuần, tháng hoặc năm
        </p>
      </div>

      <ScheduleFilterBar
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        onEmployeeChange={() => {}}
        onDepartmentChange={() => {}}
        onStatusChange={() => {}}
        employees={[]}
        departments={[]}
        hideEmployeeFilters
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
            onSelectEvent={() => {}}
          />

          {schedules.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
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
                    <th className="px-4 py-3 text-left font-medium text-gray-500">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {s.workDate}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.isFlexibleShift ? "Linh hoạt" : s.shiftName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                      </td>
                      <td className="px-4 py-3">
                        <ScheduleStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.note || "—"}
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
