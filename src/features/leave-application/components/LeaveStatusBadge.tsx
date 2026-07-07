import type { LeaveApplicationStatus } from "../types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Pending: {
    label: "Đang chờ duyệt",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  Accepted: {
    label: "Đã duyệt",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  Rejected: {
    label: "Đã từ chối",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

export default function LeaveStatusBadge({
  status,
}: {
  status: LeaveApplicationStatus;
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
