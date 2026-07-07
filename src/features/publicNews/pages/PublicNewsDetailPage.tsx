// src/pages/PublicNewsDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import {
  usePublicNewsDetail,
  useNewsViewDetail,
} from "../hooks/usePublicNewsList";
import CommentSection from "../components/CommentSection";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, CalendarDays, Eye } from "lucide-react";
import { useCurrentUserRole } from "@/features/auth/hooks/useCurrentUserRole";
import { canViewNewsType } from "@/features/publicNews/types";
import {
  NewsStatusBadge,
  NewsTypeBadge,
} from "@/features/publicNews/components/NewsBadge";

const PublicNewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Gọi API lấy thông tin news
  const { data, isLoading, isError } = usePublicNewsDetail(slug ?? "");

  const rawData = data as any;
  const fetchedNews = rawData?.value ?? null;

  // Chặn Applicant/khách xem tin Internal nếu lỡ có link trực tiếp tới slug đó
  const role = useCurrentUserRole();
  const news =
    fetchedNews && canViewNewsType(role, fetchedNews.type) ? fetchedNews : null;

  // Gọi API lấy view count độc lập
  const { data: viewData } = useNewsViewDetail(news?.id);

  // Logic lấy viewCount từ endpoint /views, fallback về dữ liệu cũ nếu chưa tải xong
  const currentViewCount = viewData?.value.publicViewCount;

  if (isError) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-500 text-lg font-medium">
          Không thể tải bài viết. Vui lòng thử lại sau.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-lg transition-colors"
        >
          <Link to="/news">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Skeleton className="h-4 w-32 rounded-full bg-slate-200" />
        <Skeleton className="h-10 w-3/4 rounded-xl bg-slate-200" />
        <Skeleton className="h-4 w-48 rounded-full bg-slate-200" />
        <Skeleton className="w-full h-72 rounded-2xl bg-slate-200" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-full rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-5/6 rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-full rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-4/6 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500 text-lg">Bài viết không tồn tại.</p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-lg transition-colors"
        >
          <Link to="/news">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          className="px-0 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
        >
          <Link to="/news">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Tin tức doanh nghiệp
          </Link>
        </Button>
      </div>

      {/* Badges: trạng thái & loại tin */}
      <div className="flex flex-wrap gap-2 mb-4">
        <NewsStatusBadge status={news.status} />
        <NewsTypeBadge type={news.type} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight text-slate-900 mb-4">
        {news.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 font-mono tabular-nums">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {news.publishedAt
            ? new Date(news.publishedAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Chưa đăng"}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {Number(currentViewCount).toLocaleString("vi-VN")} lượt xem
        </span>
      </div>

      <Separator className="mb-8 border-slate-200" />

      {/* Cover Image */}
      {news.coverImg && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/60">
          <img
            src={news.coverImg}
            alt={news.title}
            className="w-full object-cover max-h-[420px]"
          />
        </div>
      )}

      {/* Content */}
      <article
        className="prose prose-slate max-w-none
          prose-headings:font-semibold prose-headings:text-slate-900
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-img:rounded-2xl prose-img:shadow-sm
          prose-a:text-[#0F6B66] hover:prose-a:text-[#0B4F4B] prose-a:transition-colors prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: news.contentHtml }}
      />

      <Separator className="my-10 border-slate-200" />

      {/* Comment section */}
      <CommentSection newsId={news.id} />

      <Separator className="my-10 border-slate-200" />

      {/* Back button */}
      <div className="flex justify-start">
        <Button
          asChild
          variant="outline"
          className="rounded-lg transition-colors hover:bg-slate-50 text-slate-700"
        >
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
