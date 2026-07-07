import type { UserRole } from "@/shared/types";

export interface AuthResponse {
  value: {
    accessToken: string;
  };
  isSuccess: boolean;
  isFailed: boolean;
  error: unknown | null;
  traceId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  Role: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface UserDto {
  fullName: string;
  email: string;
  password: string;
}

// Interface của GET /api/v1/auth/me
export interface CurrentUserResponse {
  accountId: string;
  email: string;
  role: UserRole;
  status: string;
  user: UserProfileDetail;
}

// Interface chi tiết cho "user" bên trong
export interface UserProfileDetail {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  address: string | null;
  hobby: string | null;
  quote: string | null;
  avatarImg: string | null;
  coverImg: string | null;
}
