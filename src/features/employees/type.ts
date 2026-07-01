// Dùng cho cả GET /users/{userId} và kết quả trả về của GET /auth/me (phần user)
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  phone: string;
  address: string | null;
  hobby: string | null;
  quote: string | null;
  avatarImg: string | null;
  coverImg: string | null;
  account: AccountDetail[];
  departments?: DepartmentBrief[]; // Lấy từ API detail user
}

export interface DepartmentBrief {
  id: string;
  name: string;
  departmentCode: string;
  joinedAt: string;
}

// Response đầy đủ cho GET /users/{userId}
export interface UserDetailResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  phone: string;
  address: string | null;
  hobby: string | null;
  quote: string | null;
  avatarImg: string | null;
  coverImg: string | null;
  account: AccountDetail;
  departments: DepartmentBrief[];
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  hobby?: string | null;
  quote?: string | null;
  avatarImg?: string | null;
  coverImg?: string | null;
}

// src/features/accounts/type.ts

export type AccountRole = "Admin" | "Employee";
export type AccountStatus = "Active" | "Inactive";

// Thông tin user rút gọn trả về trong list
export interface UserShort {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

// Cấu trúc 1 item trong danh sách Accounts
export interface AccountListItem {
  id: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  user: UserShort;
  createdAt: string;
  updatedAt: string | null;
}

// Cấu trúc chi tiết của Account (Dùng cho API Get By Id)
export interface AccountDetail {
  id: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
}
