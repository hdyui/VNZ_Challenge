// ─── News ─────────────────────────────────────────────────────────────────────
export interface PublicNewsItem {
  id: string;
  title: string;
  slug: string;
  coverImg: string | null;
  publishedAt: string;
}

export interface PublicNewsDetail {
  id: string;
  title: string;
  slug: string;
  coverImg: string | null;
  contentHtml: string;
  publishedAt: string;
}

export interface PublicNewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
// ─── Recruitments ─────────────────────────────────────────────────────────────
export type RecruitmentLevel =
  | "all"
  | "Intern"
  | "Fresher"
  | "Junior"
  | "Middle"
  | "Senior";

export interface PublicRecruitmentItem {
  id: string;
  title: string;
  level: RecruitmentLevel;
  department: string;
  createdAt: string;
}

export interface PublicRecruitmentDetail {
  id: string;
  title: string;
  level: RecruitmentLevel;
  department: string;
  jobDescription: string;
  referenceInfo: string | null;
  createdAt: string;
}

export interface PublicRecruitmentQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  level?: RecruitmentLevel | "" | "all";
}
