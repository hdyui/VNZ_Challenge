// ─── Recruitments ─────────────────────────────────────────────────────────────
export type RecruitmentLevel =
  | "all"
  | "Intern"
  | "Fresher"
  | "Junior"
  | "Middle"
  | "Senior";

export type RecruitmentStatus = "Open" | "Draft" | "Closed";

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
  createdAt: string;
}

export interface PublicRecruitmentDetail {
  id: string;
  title: string;
  level: RecruitmentLevel;
  department: Department;
  status?: RecruitmentStatus | null;
  jobDescription: string;
  referenceInfo: string | null;
  createdAt: string;
}

export interface PublicRecruitmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: RecruitmentLevel | "all" | "";
}

// ─── Recruitment CRUD payloads ─────────────────────────────────────────────────

export interface RecruitmentPayload {
  title: string;
  departmentId: string;
  level: RecruitmentLevel;
  status: RecruitmentStatus;
  jobDescription: string;
  referenceInfo?: string;
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
