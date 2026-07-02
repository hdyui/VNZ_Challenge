export interface DepartmentListItem {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

export interface DepartmentMember {
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  joinedAt: string;
}

export interface DepartmentListItem {
  id: string;
  name: string;
  description: string;
  departmentCode: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

export interface DepartmentMember {
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  joinedAt: string;
}

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
