// Dùng pattern "const object + type" thay vì `enum` thật của TS,
// vì tsconfig của dự án bật `erasableSyntaxOnly` (không cho phép cú pháp
// sinh ra code JS thật như enum/namespace có giá trị).
// Cách dùng ở nơi khác không đổi: WorkScheduleStatus.Working, ...
export const WorkScheduleStatus = {
  Working: "Working",
  Off: "Off",
  Absent: "Absent",
  Completed: "Completed",
} as const;
export type WorkScheduleStatus =
  (typeof WorkScheduleStatus)[keyof typeof WorkScheduleStatus];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export type ScheduleView = "day" | "week" | "month" | "year";

/**
 * Model dùng trong UI (component, table, calendar...).
 * Có employeeName/departmentName/shiftName để hiển thị trực tiếp.
 */
export interface WorkSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId?: string | null;
  departmentName?: string | null;
  shiftId?: string;
  shiftName?: string | null;
  workDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  isFlexibleShift: boolean;
  status: WorkScheduleStatus;
  note?: string | null;
}

/**
 * Shape THẬT mà GET /work-schedules trả về bên trong `value`:
 * { workScheduleList: [...] }
 * Item trong list chỉ có id tham chiếu (employeeId, shiftId), KHÔNG có
 * employeeName/departmentName/shiftName -> phải map thêm ở client
 * (xem mapWorkScheduleRaw trong services.ts).
 */
export interface WorkScheduleRaw {
  id: string;
  employeeId: string;
  shiftId?: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  isFlexibleShift: boolean;
  status: WorkScheduleStatus;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface WorkScheduleListResponse {
  workScheduleList: WorkScheduleRaw[];
}

/**
 * Query thật mà backend hỗ trợ (GET /work-schedules).
 * Backend chỉ lọc theo khoảng ngày + nhân viên, KHÔNG hỗ trợ
 * view/month/year/departmentId/status/phân trang -> các phần đó
 * phải xử lý ở client (xem utils/scheduleDateRange.ts và
 * utils/computeYearOverview.ts).
 */
export interface WorkScheduleQuery {
  fromDate?: string; // "YYYY-MM-DD"
  toDate?: string; // "YYYY-MM-DD"
  employeeId?: string;
}

/**
 * Envelope chuẩn mà API thật trả về cho mọi endpoint.
 */
export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailed: boolean;
  error: string | null;
  traceId: string | null;
  timestampUtc: string;
}

/**
 * Overview theo tháng — được TÍNH Ở CLIENT từ danh sách WorkSchedule
 * trả về cho cả năm (backend không có endpoint year-overview riêng).
 */
export interface MonthOverview {
  month: number;
  totalWorkingDays: number;
  totalOffDays: number;
  totalAbsentDays: number;
  totalCompletedDays: number;
  totalWorkingHours: number;
}

export interface YearOverviewResult {
  year: number;
  months: MonthOverview[];
}

export interface CreateWorkScheduleRequest {
  employeeId: string;
  shiftId?: string | null;
  workDate: string;
  startTime?: string;
  endTime?: string;
  isFlexibleShift: boolean;
  status?: WorkScheduleStatus;
  note?: string;
}

export type UpdateWorkScheduleRequest = CreateWorkScheduleRequest;

/**
 * POST /work-schedules/duplicate-create
 *
 * LƯU Ý: đây KHÔNG phải "tạo lịch lặp theo daysOfWeek" như bản cũ từng
 * giả định. Theo Swagger thật, đây là chức năng NHÂN BẢN lịch làm việc
 * đã tồn tại trong khoảng [sourceFromDate, sourceToDate] và dán (paste)
 * vào bắt đầu từ targetFromDate, áp dụng cho danh sách employeeIds.
 *
 * Ví dụ: nhân bản lịch tuần này (sourceFromDate..sourceToDate) sang
 * tuần sau (targetFromDate = ngày đầu tuần sau) cho nhiều nhân viên.
 */
export interface DuplicateCreateWorkScheduleRequest {
  sourceFromDate: string; // "YYYY-MM-DD"
  sourceToDate: string; // "YYYY-MM-DD"
  targetFromDate: string; // "YYYY-MM-DD"
  employeeIds: string[];
}

export interface DuplicateCreateResult {
  copiedCount: number;
}

export interface ScheduleConflictError {
  status: number;
  message: string;
}
