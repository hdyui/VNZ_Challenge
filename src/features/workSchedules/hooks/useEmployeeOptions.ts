import { accountApi } from "@/features/employees/services";
import type { AccountListItem } from "@/features/employees/type";
import { useQuery } from "@tanstack/react-query";

export interface EmployeeOption {
  id: string; // = user.id (userId) — dùng làm WorkSchedule.employeeId
  name: string;
}

/**
 * Danh sách nhân viên dùng cho dropdown chọn "employeeId" ở feature
 * work-schedules. Tái sử dụng accountApi.getAccounts (feature accounts)
 * thay vì gọi API riêng, vì WorkSchedule.employeeId thực chất tham chiếu
 * tới User.id (= account.userId), không phải account.id.
 *
 * Chỉ lấy account có role = "Employee" (bỏ Admin) để hiển thị trong
 * dropdown chọn nhân viên.
 *
 * NOTE: axios interceptor hiện tại (không sửa) trả nguyên response.data,
 * tức dạng { value: { items: [...] }, isSuccess, ... } — CHƯA unwrap field
 * `value`. Nên ở đây phải tự unwrap thêm 1 lớp `.value` trước khi đọc `.items`.
 */
export function useEmployeeOptions() {
  return useQuery({
    queryKey: ["accounts", "employee-options"],
    queryFn: async () => {
      const res = await accountApi.getAccounts({
        role: "Employee",
        pageSize: 100,
      });

      // Phòng thủ nhiều dạng response có thể gặp:
      // 1) { value: { items: [...] } }  <- dạng thật hiện tại (interceptor chưa unwrap `value`)
      // 2) { items: [...] }             <- nếu sau này interceptor được sửa để tự unwrap
      // 3) mảng thẳng: AccountListItem[]
      const raw = (res as any)?.value ?? res;
      const list: AccountListItem[] = Array.isArray(raw)
        ? (raw as AccountListItem[])
        : (raw?.items ?? []);

      const options: EmployeeOption[] = list
        .filter((a) => a.role === "Employee")
        .map((a) => ({
          id: a.user.id, // = userId, dùng cho WorkSchedule.employeeId
          name: `${a.user.firstName} ${a.user.lastName}`.trim(),
        }));

      return options;
    },
    staleTime: 5 * 60 * 1000,
  });
}
