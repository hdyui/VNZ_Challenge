// ─── Recruitments ─────────────────────────────────────────────────────────────
export type RecruitmentLevel =
  | "all"
  | "Intern"
  | "Fresher"
  | "Junior"
  | "Middle"
  | "Senior";

export type RecruitmentStatus = "Open" | "Draft" | "Closed";

export type WorkingType =
  | "FullTime"
  | "PartTime"
  | "Remote"
  | "Hybrid"
  | "Freelance"
  | "Internship";

export interface Department {
  id: string;
  name: string;
  departmentCode: string;
}

export interface PublicRecruitmentItem {
  id: string;
  title: string;
  level: RecruitmentLevel;
  department: Department;
  status?: RecruitmentStatus | null;
  coverImageUrl?: string | null;
  location?: string | null;
  workingType?: WorkingType | null;
  hiringQuantity?: number | null;
  deadline?: string | null; // ISO datetime
  createdAt: string;
}

export interface PublicRecruitmentDetail {
  id: string;
  title: string;
  level: RecruitmentLevel;
  department: Department;
  status?: RecruitmentStatus | null;
  coverImageUrl?: string | null;
  contentHtml: string;
  contentJson?: string | null;
  location?: string | null;
  workingType?: WorkingType | null;
  hiringQuantity?: number | null;
  maxApplications?: number | null;
  deadline?: string | null; // ISO datetime
  viewCount?: number;
  createdAt: string;
}

export interface PublicRecruitmentQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  level?: RecruitmentLevel | "all" | "";
}

// ─── Recruitment CRUD payload (khớp đúng BE: POST/PUT /api/v1/recruitments) ────

export interface RecruitmentPayload {
  title: string;
  contentHtml: string;
  contentJson?: string | null;
  coverImageUrl: string;
  location: string;
  workingType: WorkingType;
  hiringQuantity: number;
  maxApplications: number;
  deadline: string; // ISO datetime, vd "2026-07-04T15:18:34.814Z"
  status: RecruitmentStatus;
  level: RecruitmentLevel;
  departmentId: string;
}

export type CreateRecruitmentPayload = RecruitmentPayload;

export interface UpdateRecruitmentPayload extends RecruitmentPayload {
  id: string;
}

// ─── Recruitment application (apply form) ──────────────────────────────────────

export interface RecruitmentApplicationPayload {
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  cvUrl?: string;
}
