import { useAuthStore } from "@/features/auth/store";
import axios from "axios";
import { env } from "./env";
import { toast } from "sonner";

// apiClient là một "phiên bản" HTTP Client đã được cấu hình sẵn các thông số mặc định
// như baseURL, headers, timeout,... để tái sử dụng trong toàn bộ ứng dụng khi gọi API

// Create instance
const apiClient = axios.create({
  baseURL: env.API_URL,
  withCredentials: true, // gửi - nhận cookie nếu có (dùng cho auth)
});

//Request Interceptor: Attach Token: tự động thêm token vào header Authorization nếu có
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken; // lấy token từ auth store
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

//Response Interceptor: Xử lý lỗi chung, ví dụ 401 Unauthorized thì có thể tự động logout
apiClient.interceptors.response.use(
  (response) => {
    // Phase 3: C1: return data trực tiếp
    // Component sẽ nhận được user thay vì { data: { user } }
    // Tuy nhiên, để linh hoạt, ta có thể trả về response.data
    // để giảm bớt số lần phải destructure ở component
    // nhưng vẫn giữ được khả năng truy cập các trường khác nếu cần
    const body = response;
    if (body?.value !== undefined) return body.value;
    if (body?.data !== undefined) return body.data;
    return body;
  },
  async (error) => {
    const originalRequest = error.config; // lấy api trước đó đã gọi để có thể retry nếu cần

    const notAuthReqs = !originalRequest.url?.includes("/auth/");
    const is401 = error.response?.status === 401;
    const notRetriedYet = !originalRequest._retry;

    // const status = error.response?.status; // lấy status code để xử lý theo từng trường hợp
    // VD: nếu lỗi 401 Unauthorized, có thể do token hết hạn
    if (is401 && notAuthReqs && notRetriedYet) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true; // đứng đầu hàng đợi khi lỗi
      isRefreshing = true;

      try {
        // const refreshToken = useAuthStore.getState().refreshToken;
        // if (!refreshToken) throw new Error("No refresh token");
        // 1. Gọi API xin token mới
        // ⚠️ Dùng axios thường để tránh dính interceptor của apiClient
        const res = await axios.post(
          `${env.API_URL}auth/refresh`,
          {},
          {
            withCredentials: true, // gửi cookie nếu cần
          },
        );

        const newToken: string =
          res.data?.data?.accessToken ?? res.data?.accessToken;

        // const { accessToken } = response.data; // giả sử BE trả về { data: { accessToken }
        // Cập nhật token mới vào auth store, chỉ cần cập nhật accessToken, refreshToken thường k đổi
        useAuthStore.getState().setAuth({
          accessToken: newToken,
          role: useAuthStore.getState().role,
        }); // cập nhật token mới vào store

        processQueue(null, newToken);

        // Update header Authorization của request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // 2. Retry lại request gốc với token mới
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng fail → Logout luôn
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        window.location.href = "/login"; // Redirect cứng về login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? "Đã có lỗi xảy ra";

    const isLogoutEndpoint = originalRequest.url?.includes("/auth/logout");

    if (!isLogoutEndpoint) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
