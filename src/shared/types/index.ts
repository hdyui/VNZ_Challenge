export type UserRole = "Admin" | "Employee";
export type AccountStatus = "Active" | "Inactive";

export interface RequireAuthProps {
  allowedRoles?: UserRole[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}
