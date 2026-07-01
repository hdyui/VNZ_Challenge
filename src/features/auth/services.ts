import apiClient from "@/lib/axios";
import type {
  AuthResponse,
  ChangePasswordRequest,
  CurrentUserResponse,
  UserDto,
} from "./type";

// authApi chứa các hàm gọi API lquan đến authentication như login, register, getMe,...
// mỗi hàm sẽ gọi apiClient để thực hiện request, sau đó normalize dữ liệu
// trả về (nếu cần), rồi trả về cho component sử dụng
// Ví dụ: BE trả về { message, result: { access_Token, refresh_Token } }
// thì FE sẽ nhận { accessToken, refreshToken } để dễ dùng hơn

export const authApi = {
  // Login: Normalize result → accessToken/refreshToken
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    ) as unknown as Promise<AuthResponse>;
  },

  async register(credentials: UserDto): Promise<AuthResponse> {
    return apiClient.post(
      "/auth/register",
      credentials,
    ) as unknown as Promise<AuthResponse>;

    // BE trả: { message, result: { access_Token, refresh_Token } }
    // FE nhận: { accessToken, refreshToken }
  },

  async getMe(): Promise<CurrentUserResponse> {
    return apiClient.get("/auth/me") as unknown as Promise<CurrentUserResponse>;
  },

  async changePassword(data: ChangePasswordRequest): Promise<any> {
    return apiClient.put(
      "/auth/change-password",
      data, // 2. TRUYỀN DATA VÀO apiClient.put ĐỂ GỬI LÊN SERVER
    );
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
