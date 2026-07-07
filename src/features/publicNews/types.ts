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
  viewCount: number;
}

export interface PublicNewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export type CommentAuthorRole = "applicant" | "employee" | "admin";

export interface NewsComment {
  id: string;
  newsId: string;
  parentCommentId: string | null;
  content: string;
  authorName: string;
  authorRole: CommentAuthorRole;
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentCommentId?: string | null;
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
