import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { shiftServices } from "../services";
import type {
  CreateShiftRequest,
  ShiftQuery,
  UpdateShiftRequest,
} from "../type";

export const SHIFT_QUERY_KEY = "shifts";

export function useShiftList(query?: ShiftQuery) {
  return useQuery({
    queryKey: [SHIFT_QUERY_KEY, query],
    queryFn: () => shiftServices.getAll(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShiftRequest) => shiftServices.create(payload),
    onSuccess: () => {
      toast.success("Tạo ca làm thành công");
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Tạo ca làm thất bại");
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateShiftRequest;
    }) => shiftServices.update(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật ca làm thành công");
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Cập nhật ca làm thất bại");
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftServices.remove(id),
    onSuccess: () => {
      toast.success("Xóa ca làm thành công");
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Xóa ca làm thất bại");
    },
  });
}
