import { WorkScheduleStatus } from "../type";

const STATUS_CONFIG: Record<
  WorkScheduleStatus,
  { label: string; className: string }
> = {
  [WorkScheduleStatus.Working]: {
    label: "Đang làm việc",
    className: "bg-blue-300 text-gray-800 ring-gray-500/20",
  },
  [WorkScheduleStatus.Off]: {
    label: "Nghỉ theo lịch",
    className: "bg-pink-100 text-gray-600 ring-gray-500/20",
  },
  [WorkScheduleStatus.Absent]: {
    label: "Vắng mặt",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
  [WorkScheduleStatus.Completed]: {
    label: "Đã hoàn thành",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
};

export default function ScheduleStatusBadge({
  status,
}: {
  status: WorkScheduleStatus;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}
