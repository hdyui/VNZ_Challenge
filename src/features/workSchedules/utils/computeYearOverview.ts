import { WorkScheduleStatus } from "../type";
import type { MonthOverview, WorkSchedule, YearOverviewResult } from "../type";

function diffHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return Math.max(minutes, 0) / 60;
}

/**
 * Backend không có endpoint year-overview riêng. Trang "xem theo năm"
 * phải gọi GET /work-schedules với fromDate/toDate phủ cả năm, sau đó
 * dùng hàm này để group theo tháng ở client.
 *
 * GIẢ ĐỊNH: giờ làm việc (totalWorkingHours) chỉ tính cho các lịch có
 * status = Completed. Nếu nghiệp vụ thực tế khác (ví dụ tính cả
 * Working), chỉnh lại switch-case bên dưới.
 */
export function computeYearOverview(
  schedules: WorkSchedule[],
  year: number,
): YearOverviewResult {
  const months: MonthOverview[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalWorkingDays: 0,
    totalOffDays: 0,
    totalAbsentDays: 0,
    totalCompletedDays: 0,
    totalWorkingHours: 0,
  }));

  for (const s of schedules) {
    const monthIndex = Number(s.workDate.slice(5, 7)) - 1;
    if (monthIndex < 0 || monthIndex > 11) continue;
    const m = months[monthIndex];

    switch (s.status) {
      case WorkScheduleStatus.Working:
        m.totalWorkingDays += 1;
        break;
      case WorkScheduleStatus.Off:
        m.totalOffDays += 1;
        break;
      case WorkScheduleStatus.Absent:
        m.totalAbsentDays += 1;
        break;
      case WorkScheduleStatus.Completed:
        m.totalCompletedDays += 1;
        m.totalWorkingHours += diffHours(s.startTime, s.endTime);
        break;
    }
  }

  return { year, months };
}
