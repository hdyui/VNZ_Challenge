// src/features/recruitment/schema.ts
import { z } from "zod";
import type { PublicRecruitmentDetail, RecruitmentPayload } from "./type";

export const RECRUITMENT_LEVELS = [
  "Intern",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
] as const;

export const RECRUITMENT_STATUSES = ["Open", "Draft", "Closed"] as const;

export const WORKING_TYPES = [
  "FullTime",
  "PartTime",
  "Remote",
  "Hybrid",
  "Freelance",
  "Internship",
] as const;

export const WORKING_TYPE_LABELS: Record<
  (typeof WORKING_TYPES)[number],
  string
> = {
  FullTime: "Toàn thời gian",
  PartTime: "Bán thời gian",
  Remote: "Từ xa",
  Hybrid: "Kết hợp (Hybrid)",
  Freelance: "Tự do (Freelance)",
  Internship: "Thực tập",
};

export const RecruitmentFormSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề là bắt buộc."),
  departmentId: z.string().trim().min(1, "Phòng ban là bắt buộc."),
  level: z.enum(RECRUITMENT_LEVELS, "Cấp bậc là bắt buộc."),
  status: z.enum(RECRUITMENT_STATUSES, "Trạng thái là bắt buộc."),
  workingType: z.enum(WORKING_TYPES, "Loại hình làm việc là bắt buộc."),
  location: z.string().trim().min(1, "Địa điểm làm việc là bắt buộc."),
  coverImageUrl: z.string().trim().min(1, "Ảnh bìa là bắt buộc."),
  // Giữ dạng string vì <input type="number"> trả về string — convert sang
  // number ở bước toRecruitmentPayload(). Tránh dùng z.coerce ở đây vì nó làm
  // input/output type của schema khác nhau, gây lỗi generic với useForm<T>.
  hiringQuantity: z
    .string()
    .trim()
    .min(1, "Số lượng tuyển là bắt buộc.")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: "Số lượng tuyển phải là số nguyên lớn hơn 0.",
    }),
  maxApplications: z
    .string()
    .trim()
    .min(1, "Số lượng hồ sơ tối đa là bắt buộc.")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: "Số lượng hồ sơ tối đa phải là số nguyên lớn hơn 0.",
    }),
  // Giá trị lấy trực tiếp từ <input type="datetime-local">, convert sang ISO khi submit
  deadline: z.string().min(1, "Hạn nộp hồ sơ là bắt buộc."),
  contentHtml: z.string().trim().min(1, "Nội dung là bắt buộc."),
  contentJson: z.string().optional(),
});

export type RecruitmentFormSchemaType = z.infer<typeof RecruitmentFormSchema>;

export const EMPTY_RECRUITMENT_FORM: RecruitmentFormSchemaType = {
  title: "",
  departmentId: "",
  level: "Intern",
  status: "Draft",
  workingType: "FullTime",
  location: "",
  coverImageUrl: "",
  hiringQuantity: "1",
  maxApplications: "1",
  deadline: "",
  contentHtml: "",
  contentJson: undefined,
};

// ─── Datetime helpers ───────────────────────────────────────────────────────
// <input type="datetime-local"> làm việc với "yyyy-MM-ddThh:mm" (giờ local, không timezone).

export const isoToDatetimeLocal = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const datetimeLocalToIso = (value: string): string =>
  value ? new Date(value).toISOString() : "";

// ─── PublicRecruitmentDetail (API) → RecruitmentFormSchemaType (form) ────────

export const toRecruitmentFormValues = (
  detail: PublicRecruitmentDetail,
): RecruitmentFormSchemaType => {
  const departmentId =
    typeof detail.department === "object"
      ? (detail.department as { id: string })?.id
      : (detail.department as unknown as string);

  return {
    title: detail.title ?? "",
    departmentId: departmentId ?? "",
    level: (detail.level as (typeof RECRUITMENT_LEVELS)[number]) || "Intern",
    status: (detail.status as (typeof RECRUITMENT_STATUSES)[number]) || "Draft",
    workingType:
      (detail.workingType as (typeof WORKING_TYPES)[number]) || "FullTime",
    location: detail.location ?? "",
    coverImageUrl: detail.coverImageUrl ?? "",
    hiringQuantity: String(detail.hiringQuantity ?? 1),
    maxApplications: String(detail.maxApplications ?? 1),
    deadline: isoToDatetimeLocal(detail.deadline),
    contentHtml: detail.contentHtml ?? "",
    contentJson: detail.contentJson ?? undefined,
  };
};

// ─── RecruitmentFormSchemaType (form) → RecruitmentPayload (gửi lên API) ─────

export const toRecruitmentPayload = (
  data: RecruitmentFormSchemaType,
): RecruitmentPayload => ({
  title: data.title,
  contentHtml: data.contentHtml,
  contentJson: data.contentJson,
  coverImageUrl: data.coverImageUrl,
  location: data.location,
  workingType: data.workingType,
  hiringQuantity: Number(data.hiringQuantity),
  maxApplications: Number(data.maxApplications),
  deadline: datetimeLocalToIso(data.deadline),
  status: data.status,
  level: data.level,
  departmentId: data.departmentId,
});

// ─── Apply Form Schema (Dành cho Candidate nộp đơn) ───────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const ApplyFormSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên là bắt buộc."),
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Email không hợp lệ."),
  phone: z.string().trim().min(1, "Số điện thoại là bắt buộc."),
  address: z.string().optional(),
  cvFile: z
    .any()
    .refine((file) => file, "Vui lòng tải lên CV của bạn.")
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      "Kích thước file tối đa 5MB.",
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Hệ thống chỉ chấp nhận định dạng PDF (.pdf).",
    ),
});

export type ApplyFormSchemaType = z.infer<typeof ApplyFormSchema>;
