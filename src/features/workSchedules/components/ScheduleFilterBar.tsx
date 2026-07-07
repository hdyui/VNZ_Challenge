import { WorkScheduleStatus, type ScheduleView } from "../type";

export interface SimpleOption {
  id: string;
  name: string;
}

interface ScheduleFilterBarProps {
  view: ScheduleView;
  onViewChange: (view: ScheduleView) => void;
  date: string;
  onDateChange: (date: string) => void;
  employeeId?: string;
  onEmployeeChange: (employeeId: string | undefined) => void;
  departmentId?: string;
  onDepartmentChange: (departmentId: string | undefined) => void;
  status?: WorkScheduleStatus;
  onStatusChange: (status: WorkScheduleStatus | undefined) => void;
  employees: SimpleOption[];
  departments: SimpleOption[];
  // Ẩn filter nhân viên/phòng ban khi hiển thị cho Employee (chỉ xem lịch bản thân)
  hideEmployeeFilters?: boolean;
}

const VIEW_OPTIONS: { value: ScheduleView; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const STATUS_OPTIONS = [
  { value: WorkScheduleStatus.Working, label: "Đang làm việc" },
  { value: WorkScheduleStatus.Off, label: "Nghỉ theo lịch" },
  { value: WorkScheduleStatus.Absent, label: "Vắng mặt" },
  { value: WorkScheduleStatus.Completed, label: "Đã hoàn thành" },
];

export default function ScheduleFilterBar({
  view,
  onViewChange,
  date,
  onDateChange,
  employeeId,
  onEmployeeChange,
  departmentId,
  onDepartmentChange,
  status,
  onStatusChange,
  employees,
  departments,
  hideEmployeeFilters,
}: ScheduleFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Xem theo
        </label>
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onViewChange(opt.value)}
              className={`px-3 py-1.5 text-sm ${
                view === opt.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Ngày
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {!hideEmployeeFilters && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nhân viên
            </label>
            <select
              value={employeeId ?? ""}
              onChange={(e) => onEmployeeChange(e.target.value || undefined)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[160px]"
            >
              <option value="">Tất cả</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Phòng ban
            </label>
            <select
              value={departmentId ?? ""}
              onChange={(e) => onDepartmentChange(e.target.value || undefined)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[160px]"
            >
              <option value="">Tất cả</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Trạng thái
        </label>
        <select
          value={status ?? ""}
          onChange={(e) =>
            onStatusChange((e.target.value as WorkScheduleStatus) || undefined)
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[160px]"
        >
          <option value="">Tất cả</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
