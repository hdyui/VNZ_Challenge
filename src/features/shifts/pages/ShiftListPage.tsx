import { useState } from "react";
import { Link } from "react-router-dom";
import ShiftTable from "../components/ShiftTable";
import ShiftDeleteConfirmModal from "../components/ShiftDeleteConfirmModal";
import { useDeleteShift, useShiftList } from "../hooks/useShifts";
import type { Shift } from "../type";

const PAGE_SIZE = 10;

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m17 17-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d={direction === "left" ? "M12 5 7 10l5 5" : "M8 5l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShiftListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  const { data, isLoading, isFetching } = useShiftList({
    searchTerm: searchTerm || undefined,
    pageIndex,
    pageSize: PAGE_SIZE,
  });

  const deleteMutation = useDeleteShift();

  const shifts = data?.value?.items ?? [];
  const totalCount = data?.value?.totalCount ?? 0;
  const pageSize = PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleConfirmDelete = () => {
    if (!shiftToDelete) return;
    deleteMutation.mutate(shiftToDelete.id, {
      onSuccess: () => setShiftToDelete(null),
    });
  };

  return (
    <div className="max-w-6xl p-6 md:p-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Ca làm việc
            </h1>
            {!isLoading && (
              <span className="inline-flex items-center rounded-full bg-[#0F6B66]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#0F6B66]">
                {totalCount} ca
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý danh sách ca làm cố định của công ty
          </p>
        </div>
        <Link
          to="/admin/shifts/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6B66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0F6B66]/20 transition-colors hover:bg-[#0B4F4B]"
        >
          <PlusIcon />
          Tạo ca làm
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-shadow focus-within:border-[#0F6B66]/40 focus-within:ring-2 focus-within:ring-[#0F6B66]/20">
          <SearchIcon />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm theo tên ca làm..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <ShiftTable
        shifts={shifts}
        isLoading={isLoading}
        onDeleteClick={setShiftToDelete}
      />

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            disabled={pageIndex <= 1 || isFetching}
            onClick={() => setPageIndex((p) => p - 1)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:border-[#0F6B66]/30 hover:bg-[#0F6B66]/5 hover:text-[#0F6B66] disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronIcon direction="left" />
            Trước
          </button>
          <span className="px-2 text-sm tabular-nums text-slate-500">
            Trang {pageIndex}/{totalPages}
          </span>
          <button
            disabled={pageIndex >= totalPages || isFetching}
            onClick={() => setPageIndex((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:border-[#0F6B66]/30 hover:bg-[#0F6B66]/5 hover:text-[#0F6B66] disabled:pointer-events-none disabled:opacity-40"
          >
            Sau
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}

      <ShiftDeleteConfirmModal
        shift={shiftToDelete}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setShiftToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
