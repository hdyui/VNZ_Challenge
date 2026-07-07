import { useMemo, useState } from "react";
import {
  useLeaveApplicationList,
  useUpdateLeaveStatus,
} from "../hooks/useLeaveApplications";
import LeaveStatusBadge from "../components/LeaveStatusBadge";
import type { LeaveApplication, LeaveApplicationStatus } from "../types";
import { useEmployeeOptions } from "@/features/workSchedules/hooks/useEmployeeOptions";

const STATUS_OPTIONS: { value: LeaveApplicationStatus; label: string }[] = [
  { value: "Pending", label: "Đang chờ duyệt" },
  { value: "Accepted", label: "Đã duyệt" },
  { value: "Rejected", label: "Đã từ chối" },
];

const PAGE_SIZE = 10;

export default function LeaveApplicationListPage() {
  const [status, setStatus] = useState<LeaveApplicationStatus | undefined>();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNoteDraft, setReviewNoteDraft] = useState<
    Record<string, string>
  >({});

  const { data: employees = [] } = useEmployeeOptions();

  const query = useMemo(
    () => ({
      status,
      employeeId,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, employeeId, fromDate, toDate, page],
  );

  const { data, isLoading } = useLeaveApplicationList(query);
  const updateStatus = useUpdateLeaveStatus();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleDecision = (
    leave: LeaveApplication,
    decision: "Accepted" | "Rejected",
  ) => {
    setProcessingId(leave.id);
    updateStatus.mutate(
      {
        id: leave.id,
        payload: {
          status: decision,
          reviewNote: reviewNoteDraft[leave.id] || undefined,
        },
      },
      { onSettled: () => setProcessingId(null) },
    );
  };

  const resetFilters = () => {
    setStatus(undefined);
    setEmployeeId(undefined);
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Đơn xin nghỉ</h1>
        <p className="text-sm text-gray-500">
          Xem và duyệt toàn bộ đơn xin nghỉ của nhân viên
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Trạng thái
          </label>
          <select
            value={status ?? ""}
            onChange={(e) => {
              setStatus(
                (e.target.value as LeaveApplicationStatus) || undefined,
              );
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm min-w-[160px]"
          >
            <option value="">Tất cả</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Nhân viên
          </label>
          <select
            value={employeeId ?? ""}
            onChange={(e) => {
              setEmployeeId(e.target.value || undefined);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm min-w-[160px]"
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
            Từ ngày
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <button
          onClick={resetFilters}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          Xóa lọc
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          Không có đơn xin nghỉ nào phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Nhân viên
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Thời gian nghỉ
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Người duyệt
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {leave.employeeName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {leave.fromDate}
                    {leave.toDate !== leave.fromDate
                      ? ` → ${leave.toDate}`
                      : ""}
                    {leave.shiftName && (
                      <div className="text-xs text-gray-400">
                        Ca: {leave.shiftName}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <LeaveStatusBadge status={leave.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {leave.reviewedByName ?? "—"}
                    {leave.reviewNote && (
                      <div className="text-xs text-gray-400">
                        {leave.reviewNote}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === "Pending" ? (
                      <div className="flex flex-col items-end gap-2">
                        <input
                          placeholder="Ghi chú duyệt (không bắt buộc)"
                          value={reviewNoteDraft[leave.id] ?? ""}
                          onChange={(e) =>
                            setReviewNoteDraft((prev) => ({
                              ...prev,
                              [leave.id]: e.target.value,
                            }))
                          }
                          className="w-48 rounded-md border border-gray-300 px-2 py-1 text-xs"
                        />
                        <div className="flex gap-2">
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
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {leave.reviewedAt
                          ? new Date(leave.reviewedAt).toLocaleString("vi-VN")
                          : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            <span>
              Trang {page}/{totalPages} — {totalCount} đơn
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
