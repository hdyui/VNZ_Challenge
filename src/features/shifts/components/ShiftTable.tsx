import { Link } from "react-router-dom";
import type { Shift } from "../type";
import { formatDuration, formatTimeShort } from "../utils/shiftValidation.util";
import ShiftDayTimeline, { getShiftPeriod } from "./ShiftDayTimeline";

interface ShiftTableProps {
  shifts: Shift[];
  isLoading?: boolean;
  onDeleteClick: (shift: Shift) => void;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M13.5 3.5a1.5 1.5 0 0 1 2.12 0l.88.88a1.5 1.5 0 0 1 0 2.12L7.5 15.5 4 16.5l1-3.5 8.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2 0-.6 9.4a1.5 1.5 0 0 1-1.5 1.4H8.1a1.5 1.5 0 0 1-1.5-1.4L6 6h8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className="h-11 w-11 text-[#0F6B66]/25"
    >
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 12v8l5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-200" />
              <div className="h-3.5 w-28 rounded bg-slate-200" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-3.5 w-20 rounded bg-slate-200 mb-2" />
            <div className="h-1.5 w-24 rounded-full bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="h-3.5 w-16 rounded-full bg-slate-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-3.5 w-32 rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-3.5 w-14 rounded bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ShiftTable({
  shifts,
  isLoading,
  onDeleteClick,
}: ShiftTableProps) {
  const isEmpty = !isLoading && shifts.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50/70">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tên ca làm
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Khung giờ
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Thời lượng
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Mô tả
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading && <SkeletonRows />}

          {!isLoading &&
            shifts.map((shift) => {
              const period = getShiftPeriod(shift.startTime, shift.endTime);
              return (
                <tr
                  key={shift.id}
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        title={period?.label}
                        className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: period?.color ?? "#94A3B8" }}
                      />
                      {shift.name}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[13px] tabular-nums text-slate-600">
                        {formatTimeShort(shift.startTime)} –{" "}
                        {formatTimeShort(shift.endTime)}
                      </span>
                      <ShiftDayTimeline
                        startTime={shift.startTime}
                        endTime={shift.endTime}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-700">
                      {formatDuration(shift.startTime, shift.endTime)}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3.5 text-slate-500">
                    {shift.description || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      <Link
                        to={`/admin/shifts/update/${shift.id}`}
                        title="Sửa ca làm"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#0F6B66]/10 hover:text-[#0F6B66]"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        onClick={() => onDeleteClick(shift)}
                        title="Xóa ca làm"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F6B66]/5">
            <ClockIcon />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Chưa có ca làm nào
          </p>
          <p className="max-w-xs text-sm text-slate-400">
            Tạo ca làm đầu tiên để bắt đầu sắp xếp lịch làm việc cho công ty.
          </p>
        </div>
      )}
    </div>
  );
}
