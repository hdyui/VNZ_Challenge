import { z } from "zod";
import { calculateShiftDurationMinutes } from "./utils/shiftValidation.util";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const MIN_SHIFT_DURATION_HOURS = 4;

export const shiftSchema = z
  .object({
    name: z
      .string()
      .min(1, "Tên ca làm là bắt buộc")
      .max(100, "Tên ca làm tối đa 100 ký tự"),
    startTime: z
      .string()
      .min(1, "Giờ bắt đầu là bắt buộc")
      .regex(timeRegex, "Định dạng giờ không hợp lệ (HH:mm:ss)"),
    endTime: z
      .string()
      .min(1, "Giờ kết thúc là bắt buộc")
      .regex(timeRegex, "Định dạng giờ không hợp lệ (HH:mm:ss)"),
    description: z
      .string()
      .max(500, "Mô tả tối đa 500 ký tự")
      .optional()
      .or(z.literal("")),
  })
  // Đã bỏ refine "endTime > startTime" — ca qua đêm (VD 22:00 -> 06:00) là hợp lệ
  .refine(
    (data) =>
      calculateShiftDurationMinutes(data.startTime, data.endTime) >=
      MIN_SHIFT_DURATION_HOURS * 60,
    {
      message: `Một ca làm nên tối thiểu ${MIN_SHIFT_DURATION_HOURS} tiếng`,
      path: ["endTime"],
    },
  );

export type ShiftFormValues = z.infer<typeof shiftSchema>;
