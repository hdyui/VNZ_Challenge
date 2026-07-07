export const LeaveApplicationStatus = {
  Pending: "Pending",
  Accepted: "Accepted",
  Rejected: "Rejected",
} as const;
export type LeaveApplicationStatus =
  (typeof LeaveApplicationStatus)[keyof typeof LeaveApplicationStatus];

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  workScheduleId: string | null;
  shiftId: string | null;
  shiftName: string | null;
  workDate: string | null;
  startTime: string | null;
  endTime: string | null;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveApplicationStatus;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface LeaveApplicationQuery {
  status?: LeaveApplicationStatus;
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailed: boolean;
  error: string | null;
  traceId: string | null;
  timestampUtc: string;
}

// Admin chỉ được set 1 trong 2 khi duyệt — Pending là trạng thái ban đầu, không tự set lại.
export interface UpdateLeaveStatusRequest {
  status: Extract<LeaveApplicationStatus, "Accepted" | "Rejected">;
  reviewNote?: string;
}
