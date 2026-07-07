import type { Shift } from "../type";

interface ShiftDeleteConfirmModalProps {
  shift: Shift | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-600">
      <path
        d="M12 9v4m0 3.5h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShiftDeleteConfirmModal({
  shift,
  isDeleting,
  onCancel,
  onConfirm,
}: ShiftDeleteConfirmModalProps) {
  if (!shift) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      style={{ animation: "shift-modal-backdrop 0.15s ease-out" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10"
        style={{ animation: "shift-modal-panel 0.18s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <WarningIcon />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Xóa ca làm
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Bạn có chắc muốn xóa ca làm{" "}
          <span className="font-medium text-slate-700">{shift.name}</span>? Các
          lịch làm việc đã tạo trước đó sẽ không bị ảnh hưởng.
        </p>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Đang xóa..." : "Xóa ca làm"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shift-modal-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shift-modal-panel {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
