import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Hoặc 'next/link' nếu bạn dùng Next.js
import { usePublicNewsList } from "@/features/publicNews/hooks/usePublicNewsList"; // Điều chỉnh lại đường dẫn import nếu cần
import { useDebounce } from "@/shared/hooks/useDebounce"; // Giả sử bạn có 1 custom hook để debounce search

const PublicNewsPage = () => {
  // ─── States ──────────────────────────────────────────────────────────────────
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9); // Số item trên mỗi trang
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Debounce search để tránh call API liên tục khi user đang gõ phím
  // Nếu chưa có hook này, bạn có thể truyền thẳng searchTerm vào API hoặc tự viết logic setTimeout
  const debouncedSearch = useDebounce(searchTerm, 500);

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = usePublicNewsList({
    page,
    limit,
    search: debouncedSearch,
  });
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const newsList = data?.value?.items || [];
  const totalPages = data?.value
    ? Math.ceil(data.value.totalCount / data.value.pageSize)
    : 0;

  const pagination = data?.value
    ? {
        page: data.value.pageIndex,
        totalPages,
      }
    : null;
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
        <h1 className="text-3xl font-bold text-gray-800">
          Tin tức doanh nghiệp
        </h1>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài viết..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ─── News Grid ─── */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Không tìm thấy bài viết nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link to={`/news/${news.slug}`}>
                {/* Fallback image nếu coverImg bị null */}
                <img
                  src={
                    news.coverImg ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={news.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {news.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(news.publishedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <span className="text-blue-600 font-medium hover:underline">
                    Đọc tiếp &rarr;
                  </span>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              !data?.value?.hasPreviousPage
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Trước
          </button>

          <span className="text-sm font-medium px-4">
            Trang {data?.value?.pageIndex} / {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((old) => (data?.value?.hasNextPage ? old + 1 : old))
            }
            disabled={!data?.value?.hasNextPage}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              !data?.value?.hasNextPage
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
