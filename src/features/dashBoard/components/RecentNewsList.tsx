// src/features/dashboard/components/RecentNewsList.tsx
import { Link } from "react-router-dom";
import { NewsStatusBadge } from "@/features/news/components/NewsStatusBadge";
import type { DashboardRecentNews } from "../types";
import { FileText } from "lucide-react";

interface RecentNewsListProps {
  items: DashboardRecentNews[];
}

export const RecentNewsList = ({ items }: RecentNewsListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <FileText className="w-8 h-8" />
        <p className="text-sm">Chưa có bài viết nào.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((news) => (
        <li key={news.id} className="flex items-center gap-4 py-3">
          {/* Ảnh bìa */}
          <div className="flex-shrink-0">
            {news.coverImg ? (
              <img
                src={news.coverImg}
                alt={news.title}
                className="w-14 h-10 rounded-md object-cover border border-gray-100"
              />
            ) : (
              <div className="w-14 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
                <FileText className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Tiêu đề + tác giả */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/news/${news.id}`}
              className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-1"
            >
              {news.title}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">
              {news.author.fullName || "—"} ·{" "}
              {new Date(news.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Badge */}
          <div className="flex-shrink-0">
            <NewsStatusBadge status={news.status} />
          </div>
        </li>
      ))}
    </ul>
  );
};
