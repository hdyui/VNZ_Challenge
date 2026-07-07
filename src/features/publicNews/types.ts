// ─── News ─────────────────────────────────────────────────────────────────────
// API trả về status/type viết hoa (PascalCase), giữ nguyên để khỏi phải map qua lại.
export type NewsType = "Public" | "Internal";
export type NewsStatus = "Draft" | "Published" | "Archived";

export interface NewsAuthor {
  id: string;
  fullName: string;
}

export interface PublicNewsItem {
  id: string;
  title: string;
  slug: string;
  coverImg: string | null;
  type: NewsType;
  status: NewsStatus;
  author: NewsAuthor;
  publishedAt: string | null;
  createdAt?: string;
}

export interface PublicNewsDetail extends PublicNewsItem {
  contentHtml: string;
  viewCount: number;
}

export interface PublicNewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Lọc theo loại tin ở phía FE (BE hiện chưa nhận query này). */
  type?: NewsType | "all";
}

// ─── Phân quyền xem theo role ─────────────────────────────────────────────────
// Khớp với AppRole trong src/features/auth/hooks/useCurrentUserRole.ts
export type PublicRole = "Anonymous" | "Applicant" | "Employee" | "Admin";

/** Applicant (và khách chưa đăng nhập) chỉ được xem tin "Public".
 *  Employee/Admin xem được cả tin "Internal". */
export const getAllowedNewsTypes = (role: PublicRole): NewsType[] =>
  role === "Employee" || role === "Admin" ? ["Public", "Internal"] : ["Public"];

/** true nếu role hiện tại được phép xem 1 tin có type cho trước. */
export const canViewNewsType = (role: PublicRole, type: NewsType): boolean =>
  getAllowedNewsTypes(role).includes(type);

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
  /** BE trả về true nếu admin đã ẩn bình luận này. */
  isHidden?: boolean;
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
export interface NewsCommentsQueryParams {
  /** Truyền id của 1 comment gốc để lấy replies của nó; bỏ trống để lấy comment gốc. */
  parentCommentId?: string;
  /** true để BE trả về cả comment đã ẩn (dùng cho admin). */
  includeHidden?: boolean;
  page?: number;
  pageSize?: number;
}
