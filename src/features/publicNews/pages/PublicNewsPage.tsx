// src/pages/PublicNewsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  usePublicNewsList,
  useNewsViews,
} from "@/features/publicNews/hooks/usePublicNewsList";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Eye } from "lucide-react"; // Import icon Eye
import { useCurrentUserRole } from "@/features/auth/hooks/useCurrentUserRole";
import { getAllowedNewsTypes } from "@/features/publicNews/types";
import type { NewsType } from "@/features/publicNews/types";
import {
  NewsStatusBadge,
  NewsTypeBadge,
} from "@/features/publicNews/components/NewsBadge";

const PublicNewsPage = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<NewsType | "all">("all");

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Role hiện tại (Anonymous/Applicant/Employee/Admin) quyết định được xem loại tin nào.
  const role = useCurrentUserRole();
  const allowedTypes = getAllowedNewsTypes(role);
  const canFilterByType = allowedTypes.length > 1; // chỉ Employee/Admin mới có bộ lọc này

  const { data, isLoading, isError } = usePublicNewsList({
    page,
    limit,
    search: debouncedSearch,
  });

  // Gọi API lấy danh sách views
  const { data: viewsData } = useNewsViews();
  console.log(`view ne: ${viewsData}`);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  // Lọc theo quyền của role trước (an toàn phía FE, phòng khi BE trả dư),
  // sau đó lọc tiếp theo lựa chọn của người dùng trong dropdown.
  const newsList = (data?.value?.items || [])
    .filter((news) => allowedTypes.includes(news.type))
    .filter((news) => typeFilter === "all" || news.type === typeFilter);
  const totalPages = data?.value
    ? Math.ceil(data.value.totalCount / data.value.pageSize)
    : 0;

  // Xử lý lấy view từ danh sách (tương thích nhiều định dạng trả về của BE)
  const getNewsViewCount = (newsId: string) => {
    const items = viewsData?.value?.items;
    if (!Array.isArray(items)) return 0;

    const item = items.find((v: any) => v.newsId === newsId);
    return item?.publicViewCount ?? 0;
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>Đã xảy ra lỗi khi tải danh sách tin tức. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ─── Header & Search ─── */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Tin tức doanh nghiệp
        </h1>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {/* Chỉ Employee/Admin mới thấy được tin Internal nên chỉ họ mới cần bộ lọc này */}
          {canFilterByType && (
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as NewsType | "all")
              }
              className="px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-[#0F6B66] focus:ring-4 focus:ring-[#0F6B66]/20 transition-all text-slate-700 shadow-sm shadow-slate-200/60 bg-white"
            >
              <option value="all">Tất cả loại tin</option>
              <option value="Public">Công khai</option>
              <option value="Internal">Nội bộ</option>
            </select>
          )}
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài viết..."
            className="w-full md:w-72 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-[#0F6B66] focus:ring-4 focus:ring-[#0F6B66]/20 transition-all text-slate-700 shadow-sm shadow-slate-200/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ─── News Grid ─── */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F6B66]"></div>
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          Không tìm thấy bài viết nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-2xl shadow-sm shadow-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-[#0F6B66]/15 transition-all duration-300 border border-slate-200 flex flex-col"
            >
              <Link
                to={`/news/${news.slug}`}
                className="group flex flex-col h-full"
              >
                <div className="overflow-hidden">
                  <img
                    src={
                      news.coverImg ||
                      "https://via.placeholder.com/400x250?text=No+Image"
                    }
                    alt={news.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <NewsStatusBadge status={news.status} />
                    {/* Chỉ hiện badge loại tin khi có thể có nhiều loại (Employee/Admin) */}
                    {canFilterByType && <NewsTypeBadge type={news.type} />}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#0F6B66] transition-colors">
                    {news.title}
                  </h2>

                  {/* Hiển thị Ngày đăng & Số lượt xem */}
                  <div className="flex justify-between items-center text-sm text-slate-500 mb-4 font-mono tabular-nums flex-1">
                    <span>
                      {news.publishedAt
                        ? new Date(news.publishedAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "Chưa đăng"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {getNewsViewCount(news.id).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex justify-end mt-auto pt-2">
                    <span className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-slate-500 group-hover:text-[#0F6B66] group-hover:bg-[#0F6B66]/10 transition-colors text-sm font-medium">
                      Đọc tiếp &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center mt-10 space-x-2">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={!data?.value?.hasPreviousPage}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !data?.value?.hasPreviousPage
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-[#0F6B66]"
            }`}
          >
            Trước
          </button>

          <span className="text-sm font-medium px-4 text-slate-700 font-mono tabular-nums">
            Trang {data?.value?.pageIndex} / {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((old) => (data?.value?.hasNextPage ? old + 1 : old))
            }
            disabled={!data?.value?.hasNextPage}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !data?.value?.hasNextPage
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-[#0F6B66]"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicNewsPage;
