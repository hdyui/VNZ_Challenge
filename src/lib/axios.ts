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
    const state = useAuthStore.getState();
    const accessToken = state.accessToken;
    const isHydrated = (state as any)._hydrated ?? false;

    // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    //   isHydrated,
    //   hasToken: !!accessToken,
    //   tokenPreview: accessToken?.substring(0, 20),
    // });

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // console.log(`  ✅ Token attached`);
    } else if (!isHydrated) {
      console.warn(`  ⚠️ Store not hydrated yet, checking localStorage...`);
      // Fallback: try to get token directly from localStorage
      try {
        const stored = localStorage.getItem("VNZ_Challenge");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.accessToken) {
            config.headers.Authorization = `Bearer ${parsed.state.accessToken}`;
            // console.log(`  ✅ Token found in localStorage`);
          }
        }
      } catch (e) {
        console.warn(`  ❌ Failed to parse localStorage`);
      }
    } else {
      console.warn(`  ❌ NO TOKEN FOUND`);
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
    const body = response;
    //if (body?.value !== undefined) return body.value;
    if (body?.data !== undefined) return body.data;
    //console.log("body response + `${body}`");
    return body;
  },
  async (error) => {
    const originalRequest = error.config; // lấy api trước đó đã gọi để có thể retry nếu cần

    const notAuthReqs = !originalRequest.url?.includes("/auth/");
    const is401 = error.response?.status === 401;
    const notRetriedYet = !originalRequest._retry;

    console.error(
      `[API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - Status: ${error.response?.status}`,
      error.response?.data,
    );

    // const status = error.response?.status; // lấy status code để xử lý theo từng trường hợp
    // VD: nếu lỗi 401 Unauthorized, có thể do token hết hạn
    if (is401 && notAuthReqs && notRetriedYet) {
      // console.log(
      //   `[Refresh Token] Attempting to refresh token for ${originalRequest.url}`,
      // );
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
          `${env.API_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // gửi cookie nếu cần
          },
        );

        const newToken: string =
          res.data?.data?.accessToken ??
          res.data?.accessToken ??
          res.data?.value?.accessToken;

        if (!newToken) {
          throw new Error(
            "Không nhận được token mới từ server. Response: " +
              JSON.stringify(res.data),
          );
        }
        // Cập nhật token mới vào auth store
        useAuthStore.getState().setAuth({
          accessToken: newToken,
          role: useAuthStore.getState().role,
        });

        processQueue(null, newToken);

        // Update header Authorization của request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // 2. Retry lại request gốc với token mới
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng fail → Logout luôn
        console.error(
          "Refresh token failed:",
          (refreshError as any).response?.data ?? (refreshError as any).message,
        );
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        //window.location.href = "/login"; // Redirect cứng về login
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
