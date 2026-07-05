// src/features/publicNews/components/CommentSection.tsx
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentUserRole } from "@/features/auth/hooks/useCurrentUserRole";
import { isRateLimitError } from "@/shared/utils/apiError";
import { useNewsComments, useCreateComment } from "../hooks/usePublicNewsList";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  newsId: string;
}

const PAGE_SIZE = 10;

const CommentSection = ({ newsId }: CommentSectionProps) => {
  const role = useCurrentUserRole();
  const isAdmin = role === "admin";
  const canComment = role !== "anonymous"; // Applicant/Employee/Admin đều thấy form

  const [page, setPage] = useState(1);

  // Chỉ lấy comment GỐC (không truyền parentCommentId). Replies được từng
  // CommentItem tự fetch riêng khi người dùng bấm "Xem trả lời", vì BE trả
  // replies qua chính endpoint này với query ParentCommentId, phân trang riêng.
  const { data, isLoading, isError } = useNewsComments(newsId, {
    page,
    pageSize: PAGE_SIZE,
  });
  const createComment = useCreateComment(newsId);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pagination = (data as any)?.value;
  const rootComments = pagination?.items ?? [];
  const totalCount: number = pagination?.totalCount ?? 0;
  const totalPages: number = pagination
    ? Math.ceil(pagination.totalCount / pagination.pageSize)
    : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setErrorMsg(null);
    createComment.mutate(
      { content: trimmed, parentCommentId: replyTo?.id ?? null },
      {
        onSuccess: () => {
          setContent("");
          setReplyTo(null);
        },
        onError: (error) => {
          setErrorMsg(
            isRateLimitError(error)
              ? "Bạn đang thao tác quá nhanh, vui lòng thử lại sau"
              : "Gửi bình luận thất bại, vui lòng thử lại.",
          );
        },
      },
    );
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Bình luận{totalCount > 0 ? ` (${totalCount})` : ""}
      </h2>

      {canComment ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="flex items-center justify-between text-sm bg-blue-50 text-blue-700 rounded-md px-3 py-2 mb-2">
              <span>
                Đang trả lời <b>{replyTo.authorName}</b>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="underline"
              >
                Hủy
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyTo ? "Viết phản hồi..." : "Viết bình luận của bạn..."
            }
            rows={3}
            disabled={createComment.isPending}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50"
          />
          {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              disabled={createComment.isPending || !content.trim()}
            >
              {createComment.isPending ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-8">
          Vui lòng đăng nhập để tham gia bình luận.
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          Không thể tải bình luận. Vui lòng thử lại sau.
        </p>
      )}

      {!isLoading && !isError && rootComments.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}

      <div className="space-y-6">
        {rootComments.map((comment: any) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            newsId={newsId}
            isAdmin={isAdmin}
            canReply={canComment}
            onReplyClick={() =>
              setReplyTo({ id: comment.id, authorName: comment.authorName })
            }
          />
        ))}
      </div>

      {/* ─── Pagination cho comment gốc ─── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={!pagination?.hasPreviousPage}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              !pagination?.hasPreviousPage
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Trước
          </button>

          <span className="text-sm font-medium px-4">
            Trang {pagination?.pageIndex} / {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((old) => (pagination?.hasNextPage ? old + 1 : old))
            }
            disabled={!pagination?.hasNextPage}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              !pagination?.hasNextPage
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
};

export default CommentSection;
