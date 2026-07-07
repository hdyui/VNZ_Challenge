import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const MIN_SCHEDULE_DURATION_HOURS = 4;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const baseScheduleFields = {
  employeeId: z.string().min(1, "Vui lòng chọn nhân viên"),
  shiftId: z.string().nullable().optional(),
  workDate: z.string().min(1, "Vui lòng chọn ngày làm việc"),
  startTime: z
    .string()
    .regex(timeRegex, "Định dạng giờ không hợp lệ (HH:mm:ss)")
    .optional()
    .or(z.literal("")),
  endTime: z
    .string()
    .regex(timeRegex, "Định dạng giờ không hợp lệ (HH:mm:ss)")
    .optional()
    .or(z.literal("")),
  isFlexibleShift: z.boolean(),
  note: z
    .string()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
};

export const workScheduleSchema = z
  .object(baseScheduleFields)
  .superRefine((data, ctx) => {
    if (!data.isFlexibleShift && !data.shiftId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn ca làm cố định",
        path: ["shiftId"],
      });
    }

    if (data.isFlexibleShift) {
      if (!data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giờ bắt đầu là bắt buộc với ca linh hoạt",
          path: ["startTime"],
        });
      }
      if (!data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giờ kết thúc là bắt buộc với ca linh hoạt",
          path: ["endTime"],
        });
      }
      if (
        data.startTime &&
        data.endTime &&
        toMinutes(data.endTime) <= toMinutes(data.startTime)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
          path: ["endTime"],
        });
      }
      if (
        data.startTime &&
        data.endTime &&
        toMinutes(data.endTime) - toMinutes(data.startTime) <
          MIN_SCHEDULE_DURATION_HOURS * 60
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Một lịch làm việc nên tối thiểu ${MIN_SCHEDULE_DURATION_HOURS} tiếng`,
          path: ["endTime"],
        });
      }
    }
  });

export type WorkScheduleFormValues = z.infer<typeof workScheduleSchema>;

export const duplicateCreateSchema = z
  .object({
    sourceFromDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu nguồn"),
    sourceToDate: z.string().min(1, "Vui lòng chọn ngày kết thúc nguồn"),
    targetFromDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu đích"),
    employeeIds: z
      .array(z.string())
      .min(1, "Vui lòng chọn ít nhất 1 nhân viên"),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.sourceToDate) < new Date(data.sourceFromDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Ngày kết thúc nguồn phải lớn hơn hoặc bằng ngày bắt đầu nguồn",
        path: ["sourceToDate"],
      });
    }
    if (new Date(data.targetFromDate) < new Date(data.sourceFromDate)) {
      // target may be before source in some cases, but warn if needed; keep permissive
    }
  });

export type DuplicateCreateFormValues = z.infer<typeof duplicateCreateSchema>;
