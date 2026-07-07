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

// ─── Helper: build JSON body cho create/update ───────────────────────────────
// LƯU Ý QUAN TRỌNG: BE (CreateNewsRequest) hiện KHÔNG còn field kiểu IFormFile
// nào cả — CoverImg giờ là string (URL ảnh đã upload sẵn qua /news/uploads).
// Vì action không nhận file, ASP.NET Core sẽ bind tham số theo [FromBody]
// (JSON), KHÔNG phải [FromForm]/multipart. Trước đây FE gửi FormData
// (Content-Type: multipart/form-data) trong khi BE chỉ chấp nhận
// application/json → BE trả lỗi "415 Unsupported Media Type". Do đó phải gửi
// JSON thuần (application/json), không dùng FormData nữa.
function buildNewsRequestBody(
  dto: Partial<CreateNewsDto> | Partial<UpdateNewsDto>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (dto.title !== undefined) body.title = dto.title;
  if (dto.slug !== undefined) body.slug = dto.slug;

  // CoverImg bắt buộc phải là string URL (đã upload sẵn qua /news/uploads).
  if (typeof dto.coverImg === "string") {
    body.coverImg = dto.coverImg;
  }

  if (dto.contentHtml !== undefined) body.contentHtml = dto.contentHtml;
  // dto.contentJson đã là string JSON (được stringify sẵn ở NewsForm.submit),
  // giữ nguyên dạng string, KHÔNG parse/stringify lại — BE nhận ContentJson
  // là string.
  if (dto.contentJson !== undefined) body.contentJson = dto.contentJson;

  // BE bắt buộc field Type (Public | Internal).
  if (dto.type !== undefined) body.type = dto.type;
  if (dto.status !== undefined) body.status = denormalizeStatus(dto.status);

  return body;
}

export const newsApi = {
  // ─── GET /news ──────────────────────────────────────────────────────────────
  async getList(
    params?: NewsQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<NewsListItem>>> {
    const raw = await (apiClient.get("/news/public", {
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
    const body = buildNewsRequestBody(dto);
    // Gửi JSON (application/json) — action Create ở BE bind theo [FromBody],
    // gửi multipart/form-data ở đây sẽ bị BE trả về 415 Unsupported Media Type.
    const raw = await (apiClient.post(
      "/news",
      body,
    ) as unknown as Promise<any>);
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
    const body = buildNewsRequestBody(dto);
    // Cùng lý do như create(): gửi JSON thay vì multipart/form-data.
    const raw = await (apiClient.put(
      `/news/${id}`,
      body,
    ) as unknown as Promise<any>);
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

    const raw = await (apiClient.post(
      `/news/${id}/images`,
      formData,
    ) as unknown as Promise<any>);

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

  // ─── POST /news/uploads (upload 1 ảnh — dùng cho ảnh bìa & ảnh chèn trong nội dung) ──
  // folder: tuỳ chọn, dùng để BE phân loại/tổ chức thư mục lưu trữ
  // (vd "news-covers" cho ảnh bìa, "news-content" cho ảnh chèn nội dung).
  async uploadImage(
    file: File,
    folder?: string,
  ): Promise<ApiResponse<UploadImageResult>> {
    const formData = new FormData();
    formData.append("File", file);
    if (folder) formData.append("Folder", folder);

    const raw = await (apiClient.post(
      "/news/uploads",
      formData,
    ) as unknown as Promise<any>);

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
