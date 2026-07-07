import axiosClient from "@/lib/axios";
import type {
  ApiResponse,
  LeaveApplication,
  LeaveApplicationQuery,
  PagedResult,
  UpdateLeaveStatusRequest,
} from "./types";

// axiosClient.baseURL đã là ".../api/v1" -> không lặp "/api" ở đây,
// giống pattern của work-schedules/services.ts.
const BASE_URL = "/admin/leave-application";

export const leaveApplicationServices = {
  getAll: (
    query?: LeaveApplicationQuery,
  ): Promise<PagedResult<LeaveApplication>> => {
    return axiosClient
      .get(BASE_URL, {
        params: {
          Status: query?.status,
          EmployeeId: query?.employeeId,
          FromDate: query?.fromDate,
          ToDate: query?.toDate,
          Page: query?.page,
          PageSize: query?.pageSize,
        },
      })
      .then(
        (res) =>
          (res as unknown as ApiResponse<PagedResult<LeaveApplication>>)
            ?.value ?? {
            items: [],
            pageIndex: 1,
            pageSize: query?.pageSize ?? 10,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
      );
  },

  getById: (id: string): Promise<LeaveApplication> => {
    return axiosClient
      .get(`${BASE_URL}/${id}`)
      .then(
        (res) =>
          (res as unknown as ApiResponse<LeaveApplication>)
            ?.value as LeaveApplication,
      );
  },

  updateStatus: (
    id: string,
    payload: UpdateLeaveStatusRequest,
  ): Promise<LeaveApplication> => {
    return axiosClient
      .patch(`${BASE_URL}/${id}/status`, payload)
      .then(
        (res) =>
          (res as unknown as ApiResponse<LeaveApplication>)
            ?.value as LeaveApplication,
      );
  },

  // Chỉ hợp lệ khi đơn đang Pending (xem ghi chú trong hooks).
  markReviewed: (id: string): Promise<LeaveApplication> => {
    return axiosClient
      .patch(`${BASE_URL}/${id}/mark-reviewed`, {})
      .then(
        (res) =>
          (res as unknown as ApiResponse<LeaveApplication>)
            ?.value as LeaveApplication,
      );
  },
};
