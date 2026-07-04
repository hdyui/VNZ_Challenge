// src/features/publicNews/pages/PublicNewsDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { usePublicNewsDetail } from "../hooks/usePublicNewsList";
import CommentSection from "../components/CommentSection";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, CalendarDays, Eye } from "lucide-react";

const PublicNewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = usePublicNewsDetail(slug ?? "");

  const rawData = data as any;
  // Sửa bug: fallback phải là null/undefined (không phải mảng rỗng),
  // để check `!news` bên dưới hoạt động đúng khi bài viết không tồn tại.
  const news = rawData?.value ?? null;

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-500 text-lg font-medium">
          Không thể tải bài viết. Vui lòng thử lại sau.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/news">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="w-full h-72 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  // ─── Not found ───────────────────────────────────────────────────────────────
  if (!news) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Bài viết không tồn tại.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/news">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="px-0 text-muted-foreground hover:text-foreground"
        >
          <Link to="/news">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Tin tức doanh nghiệp
          </Link>
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-4">
        {news.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {new Date(news.publishedAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {(news.viewCount ?? 0).toLocaleString("vi-VN")} lượt xem
        </span>
      </div>

      <Separator className="mb-8" />

      {/* Cover Image */}
      {news.coverImg && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-md">
          <img
            src={news.coverImg}
            alt={news.title}
            className="w-full object-cover max-h-[420px]"
          />
        </div>
      )}

      {/* Content (bao gồm cả ảnh chèn trong bài, khác với cover image) */}
      <article
        className="prose prose-gray max-w-none
          prose-headings:font-semibold prose-headings:text-gray-800
          prose-p:leading-relaxed prose-p:text-gray-700
          prose-img:rounded-lg prose-img:shadow-sm
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: news.contentHtml }}
      />

      <Separator className="my-10" />

      {/* Comment section */}
      <CommentSection newsId={news.id} />

      <Separator className="my-10" />

      {/* Back button */}
      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link to="/news">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách tin tức
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PublicNewsDetailPage;
