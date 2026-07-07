import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  duplicateCreateSchema,
  type DuplicateCreateFormValues,
} from "../schema";
import type { SimpleOption } from "./ScheduleFilterBar";

interface ScheduleDuplicateFormProps {
  employees: SimpleOption[];
  onSubmit: (values: DuplicateCreateFormValues) => void;
  isSubmitting?: boolean;
}

export default function ScheduleDuplicateForm({
  employees,
  onSubmit,
  isSubmitting,
}: ScheduleDuplicateFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DuplicateCreateFormValues>({
    resolver: zodResolver(duplicateCreateSchema),
    defaultValues: {
      sourceFromDate: "",
      sourceToDate: "",
      targetFromDate: "",
      employeeIds: [],
    },
  });

  const selected = watch("employeeIds") ?? [];

  const toggleEmployee = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((s: string) => s !== id)
      : [...selected, id];
    setValue("employeeIds", next);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nguồn - Từ ngày <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("sourceFromDate")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.sourceFromDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.sourceFromDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nguồn - Đến ngày <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("sourceToDate")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.sourceToDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.sourceToDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đích - Bắt đầu từ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("targetFromDate")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.targetFromDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.targetFromDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chọn nhân viên <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-md p-2">
          {employees.length === 0 ? (
            <div className="text-sm text-gray-500">Không có nhân viên</div>
          ) : (
            employees.map((e) => (
              <label key={e.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(e.id)}
                  onChange={() => toggleEmployee(e.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{e.name}</span>
              </label>
            ))
          )}
        </div>
        {errors.employeeIds && (
          <p className="mt-1 text-sm text-red-500">
            {errors.employeeIds.message as string}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Nhân bản"}
        </button>
      </div>
    </form>
  );
}
