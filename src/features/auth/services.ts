import apiClient from "@/lib/axios";
import type {
  AuthResponse,
  ChangePasswordRequest,
  CurrentUserResponse,
  UserDto,
} from "./type";

export const authApi = {
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
  },

  async getMe(): Promise<CurrentUserResponse> {
    return apiClient.get("/auth/me") as unknown as Promise<CurrentUserResponse>;
  },

  async changePassword(data: ChangePasswordRequest): Promise<any> {
    return apiClient.put("/auth/change-password", data);
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
