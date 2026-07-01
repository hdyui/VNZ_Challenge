// src/features/news/type.ts

// API trả về status viết hoa: "Draft" | "Published" | "Archived"
export type NewsStatusRaw = "Draft" | "Published" | "Archived";

// Dùng nội bộ (lowercase) cho schema, badge, filter
export type NewsStatus = "draft" | "published" | "archived";

// Helper: normalize status từ API về lowercase
export const normalizeStatus = (s: string): NewsStatus =>
  s.toLowerCase() as NewsStatus;

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
export interface CreateNewsDto {
  title: string;
  coverImg?: string;
  contentHtml: string;
  contentJson?: object;
  status: NewsStatus;
  imageUrls?: string[];
}

// ─── Update payload (PUT /news/:id) ──────────────────────────────────────────
export interface UpdateNewsDto {
  title?: string;
  coverImg?: string;
  contentHtml?: string;
  contentJson?: object;
  status?: NewsStatus;
}

// ─── Query params (GET /news) ─────────────────────────────────────────────────
export interface NewsQueryParams {
  page?: number;
  limit?: number;
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
