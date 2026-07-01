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
// Bản đồ map với bảng User (Thông tin cá nhân)
// export interface UserProfile {
//   id: string; // UserId
//   email: string;
//   departmentId?: string | null;
//   firstName: string;
//   lastName: string;
//   phone?: string | null;
//   position?: string | null;
//   avatarUrl?: string | null;
// }
export interface ChangePasswordRequest {
  currentPassword: string; // Trong docs của BE là currentPassword nhé bác
  newPassword: string;
  confirmPassword: string;
}
export interface UserDto {
  fullName: string;
  email: string;
  password: string;
}

// Interface cho kết quả trả về của GET /api/v1/auth/me
export interface CurrentUserResponse {
  accountId: string;
  email: string;
  role: UserRole;
  status: string;
  user: UserProfileDetail;
}

// Interface chi tiết cho cục "user" bên trong
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
