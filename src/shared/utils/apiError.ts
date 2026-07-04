// src/shared/utils/apiError.ts

/**
 * Nhận diện lỗi rate-limit / spam trả về từ BE để hiển thị thông báo phù hợp.
 * Áp dụng cho mọi action có thể bị BE chặn do thao tác quá nhanh (comment, reply...).
 */
export const isRateLimitError = (error: unknown): boolean => {
  const err = error as any;
  const status = err?.response?.status;
  const message: string = (
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    ""
  )
    .toString()
    .toLowerCase();

  return status === 429 || message.includes("spam");
};
