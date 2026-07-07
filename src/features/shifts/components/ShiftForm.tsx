import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { shiftSchema, type ShiftFormValues } from "../schema";
import ShiftDayTimeline from "./ShiftDayTimeline";

interface ShiftFormProps {
  defaultValues?: Partial<ShiftFormValues>;
  onSubmit: (values: ShiftFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
      <path
        d="M9.5 3H4a1 1 0 0 0-1 1v5.5a1 1 0 0 0 .3.7l7 7a1 1 0 0 0 1.4 0l5.5-5.5a1 1 0 0 0 0-1.4l-7-7a1 1 0 0 0-.7-.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="6.75" cy="6.75" r="1" fill="currentColor" />
    </svg>
  );
}

function ClockStartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 6.5V10l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-400">
      <path
        d="M5 3.5h7l3 3V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 9h6M7 12h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

export default function ShiftForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Lưu",
}: ShiftFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
      description: "",
      ...defaultValues,
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const hasValidPreview =
    TIME_PATTERN.test(startTime ?? "") && TIME_PATTERN.test(endTime ?? "");

  const inputBase =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-[#0F6B66] focus:outline-none focus:ring-2 focus:ring-[#0F6B66]/20";
  const errorInput =
    "border-red-300 focus:border-red-500 focus:ring-red-500/20";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-7"
    >
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <TagIcon />
          Tên ca làm <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          className={`${inputBase} ${errors.name ? errorInput : ""}`}
          placeholder="Ví dụ: Ca sáng"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <ClockStartIcon />
            Giờ bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            step={1}
            {...register("startTime")}
            className={`${inputBase} font-mono tabular-nums ${
              errors.startTime ? errorInput : ""
            }`}
          />
          {errors.startTime && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.startTime.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <ClockStartIcon />
            Giờ kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            step={1}
            {...register("endTime")}
            className={`${inputBase} font-mono tabular-nums ${
              errors.endTime ? errorInput : ""
            }`}
          />
          {errors.endTime && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.endTime.message}
            </p>
          )}
        </div>
      </div>

      {hasValidPreview && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vị trí trong ngày
          </p>
          <ShiftDayTimeline startTime={startTime} endTime={endTime} size="md" />
        </div>
      )}

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <NoteIcon />
          Mô tả
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className={`${inputBase} resize-none ${
            errors.description ? errorInput : ""
          }`}
          placeholder="Mô tả thêm (không bắt buộc)"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs font-medium text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#0F6B66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0B4F4B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
