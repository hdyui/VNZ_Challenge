// src/features/news/type.ts

// API trả về status viết hoa: "Draft" | "Published" | "Archived"
export type NewsStatusRaw = "Draft" | "Published" | "Archived";

// Dùng nội bộ (lowercase) cho schema, badge, filter
export type NewsStatus = "draft" | "published" | "archived";

// Helper: normalize status từ API về lowercase
export const normalizeStatus = (s: string): NewsStatus =>
  s.toLowerCase() as NewsStatus;

// Helper: chuyển status lowercase (nội bộ) -> PascalCase (API mong đợi khi gửi lên)
export const denormalizeStatus = (s: NewsStatus): NewsStatusRaw =>
  (s.charAt(0).toUpperCase() + s.slice(1)) as NewsStatusRaw;

// ─── List item (từ GET /news) ───────────────────────────────────────────────
export interface NewsListItem {
  id: string;
  title: string;
  slug: string;
  coverImg: string | null;
  status: NewsStatus; // đã được normalize sau khi nhận từ API
  author: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  publishedAt: string | null;
}

// ─── Detail (từ GET /news/:id) ───────────────────────────────────────────────
export interface NewsImage {
  id: string;
  urlImage: string;
}

export interface NewsDetail extends NewsListItem {
  contentHtml: string;
  contentJson: object | null;
  images: NewsImage[];
  updatedAt: string;
}

// ─── Create payload (POST /news) ─────────────────────────────────────────────
// coverImg: File khi người dùng chọn ảnh mới để upload trực tiếp trong multipart form
export interface CreateNewsDto {
  title: string;
  slug?: string;
  coverImg: File | string;
  contentHtml: string;
  contentJson?: object;
  status: NewsStatus;
}

// ─── Update payload (PUT /news/:id) ──────────────────────────────────────────
// coverImg: File nếu đổi ảnh mới; nếu là string (ảnh cũ, không đổi) thì không gửi
// field CoverImg lên server để giữ nguyên ảnh hiện tại (xem buildNewsFormData trong services.ts)
export interface UpdateNewsDto {
  title?: string;
  slug?: string;
  coverImg?: File | string;
  contentHtml?: string;
  contentJson?: object;
  status?: NewsStatus;
}

// ─── Query params (GET /news) ─────────────────────────────────────────────────
export interface NewsQueryParams {
  pageIndex?: number; // Đổi thành pageIndex
  pageSize?: number; // Đổi thành pageSize
  search?: string;
  status?: NewsStatus | "";
  authorId?: string;
  sortBy?: "createdAt" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// ─── Pagination wrapper - khớp với response thực tế của API ──────────────────
export interface PaginationMeta {
  page: number; // mapped từ pageIndex
  limit: number; // mapped từ pageSize
  totalItems: number; // mapped từ totalCount
  totalPages: number; // computed: Math.ceil(totalCount / pageSize)
}

// ─── Raw API response shape (trực tiếp từ server) ────────────────────────────
export interface RawApiListResponse<T> {
  value: {
    items: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isSuccess: boolean;
  isFailed: boolean;
  error: string | null;
  traceId: string;
  timestampUtc: string;
}
export interface PaginationMeta {
  page: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailed: boolean;
  error: string | null;
  traceId: string;
}

// ─── Upload ảnh (POST /auth/uploads) ──────────────────────────────────────────
export interface UploadImageResult {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}
