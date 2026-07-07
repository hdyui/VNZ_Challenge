export interface Shift {
  id: string;
  name: string;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  description?: string | null;
}

export interface ShiftQuery {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}

// Dữ liệu phân trang thực tế nằm trong "value"
export interface PagedResult<T> {
  value: {
    items: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Wrapper chung mà API trả về (ApiResponse)
export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailed: boolean;
  error: string | null;
  traceId: string | null;
  timestampUtc: string;
}

export interface CreateShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export type UpdateShiftRequest = CreateShiftRequest;
