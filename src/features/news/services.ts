// src/features/news/services.ts
import apiClient from "@/lib/axios";
import type {
  ApiResponse,
  CreateNewsDto,
  NewsDetail,
  NewsListItem,
  NewsQueryParams,
  PaginatedResponse,
  RawApiListResponse,
  UpdateNewsDto,
  UploadImageResult,
} from "./type";
import { normalizeStatus, denormalizeStatus } from "./type";

// ─── Helper: map raw list response → internal PaginatedResponse ──────────────
function mapListResponse(
  raw: RawApiListResponse<any>,
): ApiResponse<PaginatedResponse<NewsListItem>> {
  const { items, pageIndex, pageSize, totalCount } = raw.value;

  const normalizedItems: NewsListItem[] = items.map((item: any) => ({
    ...item,
    status: normalizeStatus(item.status), // "Published" → "published"
  }));

  return {
    statusCode: raw.isSuccess ? 200 : 400,
    message: raw.error ?? "",
    data: {
      items: normalizedItems,
      pagination: {
        page: pageIndex,
        limit: pageSize,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    },
  };
}

// ─── Helper: map raw detail response ─────────────────────────────────────────
function mapDetailResponse(raw: any): ApiResponse<NewsDetail> {
  // Hỗ trợ cả hai dạng wrapper: { value: {...} } hoặc { data: {...} }
  const item = raw.value ?? raw.data ?? raw;
  return {
    statusCode:
      raw.isSuccess !== undefined
        ? raw.isSuccess
          ? 200
          : 400
        : (raw.statusCode ?? 200),
    message: raw.error ?? raw.message ?? "",
    data: {
      ...item,
      status: normalizeStatus(item.status),
    },
  };
}

// ─── Helper: build multipart/form-data cho create/update (backend nhận PascalCase) ──
function buildNewsFormData(
  dto: Partial<CreateNewsDto> | Partial<UpdateNewsDto>,
): FormData {
  const fd = new FormData();

  if (dto.title !== undefined) fd.append("Title", dto.title);
  if (dto.slug !== undefined) fd.append("Slug", dto.slug);

  // CoverImg: chỉ gửi lên khi là File mới chọn (Swagger khai báo string($binary)).
  // Nếu coverImg là string (ảnh cũ, không đổi) thì bỏ qua field này để backend giữ nguyên ảnh hiện tại.
  if (dto.coverImg instanceof File) {
    fd.append("CoverImg", dto.coverImg);
  }

  if (dto.contentHtml !== undefined) fd.append("ContentHtml", dto.contentHtml);
  if (dto.contentJson !== undefined) {
    fd.append("ContentJson", JSON.stringify(dto.contentJson));
  }
  if (dto.status !== undefined)
    fd.append("Status", denormalizeStatus(dto.status));

  return fd;
}

export const newsApi = {
  // ─── GET /news ──────────────────────────────────────────────────────────────
  async getList(
    params?: NewsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<NewsListItem>>> {
    const raw = await (apiClient.get("/public/news", {
      params,
    }) as unknown as Promise<RawApiListResponse<any>>);
    return mapListResponse(raw);
  },

  // ─── GET /news/:id ───────────────────────────────────────────────────────────
  async getById(id: string): Promise<ApiResponse<NewsDetail>> {
    const raw = await (apiClient.get(`/news/${id}`) as unknown as Promise<any>);
    return mapDetailResponse(raw);
  },

  // ─── POST /news ──────────────────────────────────────────────────────────────
  async create(
    dto: CreateNewsDto,
  ): Promise<
    ApiResponse<
      Pick<NewsDetail, "id" | "title" | "slug" | "status" | "createdAt">
    >
  > {
    const formData = buildNewsFormData(dto);
    const raw = await (apiClient.post("/news", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as unknown as Promise<any>);
    const item = raw.value ?? raw.data ?? raw;
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: { ...item, status: normalizeStatus(item.status) },
    };
  },

  // ─── PUT /news/:id ───────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdateNewsDto,
  ): Promise<
    ApiResponse<Pick<NewsDetail, "id" | "title" | "status" | "updatedAt">>
  > {
    const formData = buildNewsFormData(dto);
    const raw = await (apiClient.put(`/news/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as unknown as Promise<any>);
    const item = raw.value ?? raw.data ?? raw;
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: { ...item, status: normalizeStatus(item.status) },
    };
  },

  // ─── DELETE /news/:id (Soft Delete) ──────────────────────────────────────────
  async remove(id: string): Promise<ApiResponse<null>> {
    const raw = await (apiClient.delete(
      `/news/${id}`,
    ) as unknown as Promise<any>);
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: null,
    };
  },

  // ─── POST /news/:id/images ───────────────────────────────────────────────────
  async uploadImages(
    id: string,
    files: File[],
  ): Promise<
    ApiResponse<
      { id: string; newsId: string; urlImage: string; isActive: boolean }[]
    >
  > {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const raw = await (apiClient.post(`/news/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as unknown as Promise<any>);

    const data = raw.value ?? raw.data ?? raw;
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: Array.isArray(data) ? data : [],
    };
  },

  // ─── POST /auth/uploads (upload 1 ảnh, dùng cho ảnh bìa) ──────────────────────
  async uploadImage(file: File): Promise<ApiResponse<UploadImageResult>> {
    const formData = new FormData();
    // ⚠️ Nếu backend expect field name khác "file" (vd "image"), đổi lại tại đây
    formData.append("file", file);

    const raw = await (apiClient.post("/auth/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }) as unknown as Promise<any>);

    const item = raw.value ?? raw.data ?? raw;
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: item,
    };
  },

  // ─── DELETE /news/:newsId/images/:imageId ────────────────────────────────────
  async removeImage(
    newsId: string,
    imageId: string,
  ): Promise<ApiResponse<null>> {
    const raw = await (apiClient.delete(
      `/news/${newsId}/images/${imageId}`,
    ) as unknown as Promise<any>);
    return {
      statusCode:
        raw.isSuccess !== undefined
          ? raw.isSuccess
            ? 200
            : 400
          : (raw.statusCode ?? 200),
      message: raw.error ?? raw.message ?? "",
      data: null,
    };
  },
};
