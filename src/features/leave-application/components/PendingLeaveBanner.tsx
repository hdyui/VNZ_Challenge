import { useState } from "react";
import {
  useLeaveApplicationList,
  useUpdateLeaveStatus,
} from "../hooks/useLeaveApplications";
import type { LeaveApplication } from "../types";

interface PendingLeaveBannerProps {
  // Truyền vào nếu chỉ muốn xem đơn của 1 nhân viên (vd trang MySchedule).
  employeeId?: string;
}

export default function PendingLeaveBanner({
  employeeId,
}: PendingLeaveBannerProps) {
  const { data, isLoading } = useLeaveApplicationList({
    status: "Pending",
    employeeId,
    pageSize: 50,
  });
  const updateStatus = useUpdateLeaveStatus();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  if (isLoading || items.length === 0) return null;

  const handleDecision = (
    leave: LeaveApplication,
    status: "Accepted" | "Rejected",
  ) => {
    setProcessingId(leave.id);
    updateStatus.mutate(
      { id: leave.id, payload: { status } },
      { onSettled: () => setProcessingId(null) },
    );
  };

  return (
    <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-800 mb-3">
        Có {items.length} đơn xin nghỉ đang chờ duyệt
      </p>
      <ul className="space-y-2">
        {items.map((leave) => (
          <li
            key={leave.id}
            className="flex items-center justify-between gap-3 rounded border border-amber-200 bg-white px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium text-gray-900">
                {leave.employeeName}
              </span>
              <span className="text-gray-500">
                {" "}
                xin nghỉ {leave.fromDate}
                {leave.toDate !== leave.fromDate ? ` → ${leave.toDate}` : ""}
              </span>
              {leave.reason && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Lý do: {leave.reason}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={processingId === leave.id}
                onClick={() => handleDecision(leave, "Accepted")}
                className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Duyệt
              </button>
              <button
                disabled={processingId === leave.id}
                onClick={() => handleDecision(leave, "Rejected")}
                className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Từ chối
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
