// src/features/publicNews/components/NewsBadges.tsx
import type { NewsStatus, NewsType } from "../types";

const STATUS_CONFIG: Record<NewsStatus, { label: string; className: string }> =
  {
    Published: {
      label: "Đã đăng",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Draft: {
      label: "Bản nháp",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    Archived: {
      label: "Đã lưu trữ",
      className: "bg-slate-100 text-slate-500 border-slate-200",
    },
  };

const TYPE_CONFIG: Record<NewsType, { label: string; className: string }> = {
  Public: {
    label: "Công khai",
    className: "bg-[#0F6B66]/10 text-[#0F6B66] border-[#0F6B66]/20",
  },
  Internal: {
    label: "Nội bộ",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
};

const badgeBaseClass =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap";

export const NewsStatusBadge = ({ status }: { status: NewsStatus }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Draft;
  return (
    <span className={`${badgeBaseClass} ${config.className}`}>
      {config.label}
    </span>
  );
};

export const NewsTypeBadge = ({ type }: { type: NewsType }) => {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.Public;
  return (
    <span className={`${badgeBaseClass} ${config.className}`}>
      {config.label}
    </span>
  );
};
