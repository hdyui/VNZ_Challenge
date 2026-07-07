// src/features/dashboard/components/RecentNewsList.tsx
import { Link } from "react-router-dom";
import { NewsStatusBadge } from "@/features/news/components/NewsStatusBadge";
import type { DashboardRecentNews } from "../types";
import { FileText, ArrowRight, Clock, User } from "lucide-react";

interface RecentNewsListProps {
  items: DashboardRecentNews[];
}

export const RecentNewsList = ({ items }: RecentNewsListProps) => {
  // Trạng thái trống (Empty State) - Thiết kế lại cho tinh tế hơn
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-2">
        <div className="p-3 bg-white rounded-full shadow-sm">
          <FileText className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium">Chưa có bài viết nào.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      {items.map((news) => (
        <Link
          key={news.id}
          to={`/admin/news/${news.id}`}
          className="group outline-none block"
        >
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50/80 transition-all duration-300 ease-out border border-transparent hover:border-gray-100">
            {/* ── Ảnh Thumbnail (Hiệu ứng Zoom & Grayscale) ── */}
            <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative shadow-sm flex items-center justify-center">
              {news.coverImg ? (
                <img
                  src={news.coverImg}
                  alt={news.title}
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 ease-out"
                />
              ) : (
                <FileText className="w-5 h-5 text-gray-300" />
              )}
            </div>

            {/* ── Nội dung: Tiêu đề + Tác giả + Ngày ── */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-black truncate transition-colors duration-300">
                {news.title}
              </h4>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide">
                <span className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {news.author?.fullName || "Ẩn danh"}
                  </span>
                </span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {/* ── Cột Phải: Badge Component có sẵn + Icon trượt ── */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Giữ nguyên NewsStatusBadge của bác */}
              <div className="scale-90 sm:scale-100 origin-right transition-transform duration-300">
                <NewsStatusBadge status={news.status} />
              </div>

              {/* Mũi tên chỉ hiện ra & trượt khi Hover (ẩn trên mobile cho gọn) */}
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 shadow-sm transition-all duration-300 ease-out">
                <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
