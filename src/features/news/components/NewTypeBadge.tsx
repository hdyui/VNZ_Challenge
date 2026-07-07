// src/features/news/components/NewsStatusBadge.tsx
import type { NewsType } from "../type";

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  public: {
    label: "Công khai",
    className: "bg-green-100 text-green-700",
  },
  internal: {
    label: "Nội bộ",
    className: "bg-gray-100 text-gray-700",
  },
};

interface NewsTpyeBadgeProps {
  status: NewsType | string;
}

export const NewsTpyeBadge = ({ status }: NewsTpyeBadgeProps) => {
  const key = status?.toLowerCase();
  const config = TYPE_CONFIG[key] ?? TYPE_CONFIG.draft;
  return (
    <span
      className={`w-22 inline-flex justify-center px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
};
