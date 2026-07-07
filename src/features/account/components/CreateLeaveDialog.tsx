import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import {
  useCreateLeave,
  useCreateScheduleLeave,
  useGetWorkSchedules,
} from "../hooks/useUser";

export const CreateLeaveDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) => {
  const [leaveType, setLeaveType] = useState<"long-term" | "shift">(
    "long-term",
  );
  const [reason, setReason] = useState("");

  // State nghỉ dài ngày
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State nghỉ theo ca
  const [selectedScheduleId, setSelectedScheduleId] = useState("");

  // Tự động lấy lịch trong 7 ngày tới để cho nhân viên chọn
  const today = format(new Date(), "yyyy-MM-dd");
  const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const { data: scheduleData, isLoading: isLoadingSchedules } =
    useGetWorkSchedules({ FromDate: today, ToDate: nextWeek });
  const { mutate: createLongTerm, isPending: isCreatingLongTerm } =
    useCreateLeave();
  const { mutate: createShiftLeave, isPending: isCreatingShift } =
    useCreateScheduleLeave();

  const isPending = isCreatingLongTerm || isCreatingShift;

  // FIX 2: Trỏ đúng vào workScheduleList theo JSON của BE trả về
  const schedules = scheduleData?.value?.workScheduleList || [];

  const handleSubmit = () => {
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do xin nghỉ.");

    if (leaveType === "long-term") {
      if (!fromDate || !toDate)
        return toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");

      // FIX 1: Truyền thẳng fromDate và toDate (định dạng YYYY-MM-DD chuẩn DateOnly)
      createLongTerm(
        { fromDate, toDate, reason },
        {
          onSuccess: () => {
            toast.success("Đã gửi đơn xin nghỉ dài ngày");
            onOpenChange(false);
          },
          onError: () => toast.error("Có lỗi xảy ra khi gửi đơn xin nghỉ!"),
        },
      );
    } else {
      if (!selectedScheduleId)
        return toast.error("Vui lòng chọn ca làm việc muốn xin nghỉ.");

      createShiftLeave(
        {
          id: selectedScheduleId, // ID truyền vào URL
          payload: { reason }, // Body chỉ gửi duy nhất cái reason
        },
        {
          onSuccess: () => {
            toast.success("Đã gửi đơn xin nghỉ theo ca");
            onOpenChange(false);
          },
          onError: () => toast.error("Có lỗi xảy ra khi gửi đơn xin nghỉ ca!"),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đơn xin nghỉ phép</DialogTitle>
        </DialogHeader>

        {/* Nút chọn loại nghỉ phép */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full mb-4">
          <Button
            variant={leaveType === "long-term" ? "default" : "ghost"}
            className="w-1/2"
            onClick={() => setLeaveType("long-term")}
          >
            Dài ngày
          </Button>
          <Button
            variant={leaveType === "shift" ? "default" : "ghost"}
            className="w-1/2"
            onClick={() => setLeaveType("shift")}
          >
            Theo ca
          </Button>
        </div>

        <div className="space-y-4">
          {leaveType === "long-term" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Từ ngày</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Đến ngày</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Chọn ca làm việc (Trong 7 ngày tới)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
              >
                <option value="">-- Chọn ca cần nghỉ --</option>
                {isLoadingSchedules ? (
                  <option disabled>Đang tải lịch...</option>
                ) : (
                  schedules.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {format(new Date(s.workDate), "dd/MM/yyyy")} -{" "}
                      {s.shiftName} ({s.startTime.slice(0, 5)} -{" "}
                      {s.endTime.slice(0, 5)})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <Label>Lý do xin nghỉ</Label>
            <Textarea
              placeholder="Nhập lý do chi tiết..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{" "}
              Gửi đơn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
