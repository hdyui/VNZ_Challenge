import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { workScheduleServices } from "../services";
import type {
  CreateWorkScheduleRequest,
  DuplicateCreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  WorkScheduleQuery,
} from "../type";
import { WorkScheduleStatus } from "../type";
export const WORK_SCHEDULE_QUERY_KEY = "workSchedules";

export function useWorkScheduleList(query?: WorkScheduleQuery) {
  return useQuery({
    queryKey: [WORK_SCHEDULE_QUERY_KEY, query],
    queryFn: () => workScheduleServices.getAll(query),
    placeholderData: keepPreviousData,
  });
}
/**
 * Đánh dấu 1 lịch làm việc là "Vắng mặt (không phép)".
 * Đây là action RIÊNG của Admin, KHÔNG đi qua leave-application, dùng cho
 * trường hợp nhân viên tự ý nghỉ không xin phép. Chỉ đổi status, giữ
 * nguyên toàn bộ field khác của lịch.
 */
export function useMarkAbsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      schedule,
    }: {
      id: string;
      schedule: import("../type").WorkSchedule;
    }) =>
      workScheduleServices.update(id, {
        employeeId: schedule.employeeId,
        shiftId: schedule.isFlexibleShift ? null : (schedule.shiftId ?? null),
        workDate: schedule.workDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isFlexibleShift: schedule.isFlexibleShift,
        status: WorkScheduleStatus.Absent,
        note: schedule.note ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Đã đánh dấu vắng mặt không phép");
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Đánh dấu vắng mặt thất bại",
      );
    },
  });
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkScheduleRequest) =>
      workScheduleServices.create(payload),
    onSuccess: () => {
      toast.success("Tạo lịch làm việc thành công");
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Tạo lịch làm việc thất bại",
      );
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkScheduleRequest;
    }) => workScheduleServices.update(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật lịch làm việc thành công");
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Cập nhật lịch làm việc thất bại",
      );
    },
  });
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workScheduleServices.remove(id),
    onSuccess: () => {
      toast.success("Xóa lịch làm việc thành công");
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Xóa lịch làm việc thất bại",
      );
    },
  });
}

/**
 * Nhân bản lịch làm việc: copy lịch đã có trong khoảng
 * [sourceFromDate, sourceToDate] và dán vào bắt đầu từ targetFromDate,
 * cho danh sách employeeIds. Backend trả về { copiedCount }.
 */
export function useDuplicateCreateWorkSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DuplicateCreateWorkScheduleRequest) =>
      workScheduleServices.duplicateCreate(payload),
    onSuccess: (result) => {
      if (result.copiedCount > 0) {
        toast.success(`Đã nhân bản thành công ${result.copiedCount} lịch`);
      } else {
        toast(
          "Không có lịch nào được nhân bản (có thể do không có lịch nguồn hoặc lịch đích đã tồn tại).",
          { icon: "⚠️" },
        );
      }
      queryClient.invalidateQueries({ queryKey: [WORK_SCHEDULE_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Nhân bản lịch làm việc thất bại",
      );
    },
  });
}
