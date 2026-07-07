import axiosClient from "@/lib/axios";
import type {
  CreateShiftRequest,
  PagedResult,
  Shift,
  ShiftQuery,
  UpdateShiftRequest,
} from "./type";
import type { ApiResponse } from "../news";

// LƯU Ý: baseURL của axiosClient đã là ".../api/v1", nên ở đây
// KHÔNG được lặp lại tiền tố "/api" nữa (trước đây là "/api/shifts" -> sai).
const BASE_URL = "/shifts";

// LƯU Ý: apiClient (axios.ts) đã cấu hình response interceptor tự "mở gói":
//   nếu body.value !== undefined thì trả thẳng body.value, không phải AxiosResponse.
// => KHÔNG destructure { data } ở đây nữa, kết quả trả về từ axiosClient
// chính là dữ liệu thật (PagedResult<Shift> / Shift / void).
export const shiftServices = {
  getAll: (query?: ShiftQuery): Promise<PagedResult<Shift>> => {
    return axiosClient.get(BASE_URL, {
      params: {
        SearchTerm: query?.searchTerm,
        PageIndex: query?.pageIndex,
        PageSize: query?.pageSize,
      },
    }) as unknown as Promise<PagedResult<Shift>>;
  },

  create: (payload: CreateShiftRequest): Promise<ApiResponse<Shift>> => {
    return axiosClient.post(BASE_URL, payload) as unknown as Promise<
      ApiResponse<Shift>
    >;
  },

  update: (
    id: string,
    payload: UpdateShiftRequest,
  ): Promise<ApiResponse<Shift>> => {
    return axiosClient.put(`${BASE_URL}/${id}`, payload) as unknown as Promise<
      ApiResponse<Shift>
    >;
  },

  remove: (id: string): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`${BASE_URL}/${id}`) as unknown as Promise<
      ApiResponse<void>
    >;
  },
};
