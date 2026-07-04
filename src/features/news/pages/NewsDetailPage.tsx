// src/features/news/pages/NewsDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  useNewsDetail,
  useDeleteNewsImage,
  useUploadNewsImages,
} from "../hooks/useNews";
import { NewsStatusBadge } from "../components/NewsStatusBadge";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef } from "react";

export const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useNewsDetail(id!);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        Đang tải bài viết...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-500">
        <p>Không tìm thấy bài viết.</p>
        <Link
          to="/admin/news"
          className="text-blue-600 hover:underline text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const news = data.data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <Link
          to="/admin/news"
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2"
        >
          ← Quay lại danh sách
        </Link>
        <Link to={`/admin/news/update/${news.id}`}>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            Chỉnh sửa bài viết
          </Button>
        </Link>
      </div>

      {/* Bài viết */}
      <Card className="shadow-sm overflow-hidden border-gray-200">
        {/* Ảnh bìa */}
        {news.coverImg ? (
          <div className="w-full h-64 md:h-96 bg-gray-100">
            <img
              src={news.coverImg}
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Chưa có ảnh bìa
          </div>
        )}

        <CardContent className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
            <span>
              Tác giả: <strong>{news.author.fullName}</strong>
            </span>
            <span>•</span>
            <span>
              Tạo: {new Date(news.createdAt).toLocaleDateString("vi-VN")}
            </span>
            {news.updatedAt && (
              <>
                <span>•</span>
                <span>
                  Cập nhật:{" "}
                  {new Date(news.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </>
            )}
            <span>•</span>
            <NewsStatusBadge status={news.status} />
          </div>

          {/* Nội dung HTML */}
          <div
            className="prose prose-blue max-w-none text-gray-700 prose-headings:font-bold prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: news.contentHtml }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
