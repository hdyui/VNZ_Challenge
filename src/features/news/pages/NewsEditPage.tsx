// src/features/news/pages/NewsEditPage.tsx
import { useParams, Link } from "react-router-dom";
import { NewsForm } from "../components/NewsForm";
import { useNewsDetail, useUpdateNews } from "../hooks/useNews";
import type { NewsFormSchemaType } from "../schema";

export const NewsEditPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useNewsDetail(id!);
  const { mutate: updateNews, isPending } = useUpdateNews(id!);

  const handleUpdate = (formData: NewsFormSchemaType) => {
    updateNews({
      title: formData.title,
      coverImg: formData.coverImg,
      contentHtml: formData.contentHtml,
      contentJson: formData.contentJson,
      status: formData.status,
    });
  };

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
    <div className="py-4 animate-in fade-in duration-300">
      <NewsForm
        initialData={{
          title: news.title,
          coverImg: news.coverImg ?? "",
          contentHtml: news.contentHtml,
          contentJson: news.contentJson ?? undefined,
          status: news.status,
        }}
        onSubmit={handleUpdate}
        isLoading={isPending}
        isEdit
      />
    </div>
  );
};
