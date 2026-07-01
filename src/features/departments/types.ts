// src/features/departments/type.ts

// 1. Cấu trúc 1 item trong danh sách phòng ban
export interface DepartmentListItem {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

// 2. Cấu trúc 1 User nằm trong phòng ban
export interface DepartmentMember {
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  joinedAt: string;
}

// 1. Cấu trúc 1 item trong danh sách phòng ban
export interface DepartmentListItem {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

// 2. Cấu trúc 1 User nằm trong phòng ban (Đã thêm)
export interface DepartmentMember {
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  joinedAt: string;
}

// 3. Cấu trúc Chi tiết phòng ban (Có mảng members)
export interface DepartmentDetail {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  isActive: boolean;
  members: DepartmentMember[];
  createdAt: string;
  updatedAt: string | null;
}
