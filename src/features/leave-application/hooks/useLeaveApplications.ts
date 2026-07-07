import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { leaveApplicationServices } from "../services";
import type { LeaveApplicationQuery } from "../types";
import { WORK_SCHEDULE_QUERY_KEY } from "@/features/workSchedules/hooks/useWorkSchedules";

export const LEAVE_APPLICATION_QUERY_KEY = "leaveApplications";

export function useLeaveApplicationList(query?: LeaveApplicationQuery) {
  return useQuery({
    queryKey: [LEAVE_APPLICATION_QUERY_KEY, query],
    queryFn: () => leaveApplicationServices.getAll(query),
    placeholderData: keepPreviousData,
  });
}

export function useLeaveApplicationDetail(id?: string) {
  return useQuery({
    queryKey: [LEAVE_APPLICATION_QUERY_KEY, "detail", id],
    queryFn: () => leaveApplicationServices.getById(id as string),
    enabled: !!id,
  });
}

/**
 * Duyệt/từ chối đơn xin nghỉ.
 * BE tự đồng bộ WorkSchedule tương ứng khi status -> Accepted/Rejected
 * (đã xác nhận), nên FE KHÔNG tự gọi thêm workScheduleServices.update nữa
 * -> chỉ cần invalidate cả 2 query key để tự refetch lịch mới nhất.
 */
export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: "Accepted" | "Rejected"; reviewNote?: string };
    }) => leaveApplicationServices.updateStatus(id, payload),
    onSuccess: (updated) => {
      toast.success(
        updated.status === "Accepted"
          ? "Đã duyệt đơn xin nghỉ"
          : "Đã từ chối đơn xin nghỉ",
      );
      queryClient.invalidateQueries({
        queryKey: [LEAVE_APPLICATION_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Xử lý đơn xin nghỉ thất bại",
      );
    },
  });
}

/**
 * Trả về Set<employeeId> đang có đơn xin nghỉ ĐÃ DUYỆT (Accepted) trùng
 * với `date` truyền vào. Dùng để loại nhân viên đang nghỉ phép ra khỏi
 * dropdown chọn nhân viên khi tạo/sửa lịch làm việc (ScheduleForm), tránh
 * xếp lịch làm việc trùng ngày đã được duyệt nghỉ.
 *
 * LƯU Ý: đang dùng fromDate = toDate = date để hỏi BE "đơn nào phủ ngày
 * này". Giả định BE lọc theo kiểu overlap (fromDate <= date <= toDate).
 * Nếu BE chỉ so khớp chính xác fromDate/toDate thay vì overlap khoảng
 * ngày, cần chỉnh lại query hoặc thêm endpoint riêng — nên xác nhận với
 * backend trước khi dùng cho production.
 */
export function useApprovedLeaveEmployeeIds(date?: string) {
  return useQuery({
    queryKey: [LEAVE_APPLICATION_QUERY_KEY, "approved-employee-ids", date],
    queryFn: async () => {
      const result = await leaveApplicationServices.getAll({
        status: "Accepted",
        fromDate: date,
        toDate: date,
        pageSize: 100,
      });
      return new Set(result.items.map((item) => item.employeeId));
    },
    enabled: !!date,
    staleTime: 60 * 1000,
  });
}

export function useMarkLeaveReviewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApplicationServices.markReviewed(id),
    onSuccess: () => {
      toast.success("Đã đánh dấu đơn đã xem");
      queryClient.invalidateQueries({
        queryKey: [LEAVE_APPLICATION_QUERY_KEY],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Không thể đánh dấu (đơn có thể đã được xử lý rồi)",
      );
    },
  });
}
