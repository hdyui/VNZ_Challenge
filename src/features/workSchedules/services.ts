import axiosClient from "@/lib/axios";
import type {
  CreateWorkScheduleRequest,
  DuplicateCreateResult,
  DuplicateCreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  WorkSchedule,
  WorkScheduleQuery,
} from "./type";

// baseURL của axiosClient đã là ".../api/v1" -> không lặp lại "/api" ở đây.
const BASE_URL = "/work-schedules";

// Response thật của GET /work-schedules: axiosClient KHÔNG tự unwrap field
// `value` (khác với comment cũ giả định) -> shape thực tế trả về là
// { value: { workScheduleList: WorkSchedule[] }, isSuccess, isFailed, error, ... }
// -> phải lấy res.value.workScheduleList, không phải res.workScheduleList.
interface WorkScheduleListResponse {
  value: {
    workScheduleList: WorkSchedule[];
  };
}

export const workScheduleServices = {
  getAll: (query?: WorkScheduleQuery): Promise<WorkSchedule[]> => {
    return axiosClient
      .get(BASE_URL, {
        // Backend nhận query PascalCase: FromDate / ToDate / EmployeeId
        params: {
          FromDate: query?.fromDate,
          ToDate: query?.toDate,
          EmployeeId: query?.employeeId,
        },
      })
      .then(
        (res) =>
          (res as unknown as WorkScheduleListResponse)?.value
            ?.workScheduleList ?? [],
      );
  },

  create: (payload: CreateWorkScheduleRequest): Promise<WorkSchedule> => {
    return axiosClient.post(
      BASE_URL,
      payload,
    ) as unknown as Promise<WorkSchedule>;
  },

  update: (
    id: string,
    payload: UpdateWorkScheduleRequest,
  ): Promise<WorkSchedule> => {
    return axiosClient.put(
      `${BASE_URL}/${id}`,
      payload,
    ) as unknown as Promise<WorkSchedule>;
  },

  remove: (id: string): Promise<void> => {
    return axiosClient.delete(`${BASE_URL}/${id}`) as unknown as Promise<void>;
  },

  duplicateCreate: (
    payload: DuplicateCreateWorkScheduleRequest,
  ): Promise<DuplicateCreateResult> => {
    return axiosClient.post(
      `${BASE_URL}/duplicate-create`,
      payload,
    ) as unknown as Promise<DuplicateCreateResult>;
  },
};
