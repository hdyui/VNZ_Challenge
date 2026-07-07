import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
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
  const isAdmin = role === "Admin";
  const canComment = role !== "Anonymous";

  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useNewsComments(newsId, {
    page,
    pageSize: PAGE_SIZE,
    includeHidden: isAdmin,
  });
  const createComment = useCreateComment(newsId);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Bấm "Trả lời" ở một comment -> tự đưa con trỏ vào ô nhập để gõ luôn.
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  const pagination = (data as any)?.value;
  // Sắp xếp bình luận gốc từ sớm nhất -> trễ nhất trong phạm vi trang hiện tại.
  const rootComments = [...(pagination?.items ?? [])]
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  const totalCount: number = pagination?.totalCount ?? 0;
  // totalCount ở trên chỉ đếm comment gốc (root) trong toàn bộ danh sách.
  // Để hiện tổng số bình luận thực tế (gốc + trả lời), cộng thêm replyCount
  // của từng comment gốc đang hiển thị ở trang hiện tại.
  // Lưu ý: nếu có nhiều trang comment gốc, số này chỉ chính xác cho các
  // comment gốc đã tải (trang hiện tại) — nếu BE có field tổng số bao gồm
  // cả reply (vd. totalCommentCount) thì nên dùng field đó thay thế.
  const totalCommentCount: number =
    totalCount +
    rootComments.reduce((sum: number, c: any) => sum + (c.replyCount ?? 0), 0);
  const totalPages: number = pagination
    ? Math.ceil(pagination.totalCount / pagination.pageSize)
    : 0;

  const submitComment = () => {
    const trimmed = content.trim();
    if (!trimmed || createComment.isPending) return;

    // Khi đang trả lời, gắn "@Tên: " vào đầu nội dung để hiển thị rõ đang
    // phản hồi ai (BE lưu luôn trong content). Dùng dấu ":" làm ranh giới rõ
    // ràng giữa tên (có thể chứa khoảng trắng) và nội dung tin nhắn.
    const finalContent = replyTo
      ? `@${replyTo.authorName}: ${trimmed}`
      : trimmed;

    setErrorMsg(null);
    createComment.mutate(
      { content: finalContent, parentCommentId: replyTo?.id ?? null },
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitComment();
  };

  // Enter để gửi bình luận, Shift+Enter để xuống dòng.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        Bình luận{totalCommentCount > 0 ? ` (${totalCommentCount})` : ""}
      </h2>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl bg-slate-200" />
          <Skeleton className="h-14 w-full rounded-2xl bg-slate-200" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          Không thể tải bình luận. Vui lòng thử lại sau.
        </p>
      )}

      {!isLoading && !isError && rootComments.length === 0 && (
        <p className="text-sm text-slate-500">
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
            onReplyClick={(targetAuthorName: string) =>
              setReplyTo({
                id: comment.id, // luôn là id comment gốc, kể cả khi reply 1 reply
                authorName: targetAuthorName,
              })
            }
          />
        ))}
      </div>
      <div className="mt-5">
        {canComment ? (
          <form onSubmit={handleSubmit} className="mb-8">
            {replyTo && (
              <div className="flex items-center justify-between text-sm bg-[#0F6B66]/10 text-[#0F6B66] rounded-lg px-3 py-2 mb-2 transition-colors">
                <span>
                  Đang trả lời{" "}
                  <b className="font-semibold">{replyTo.authorName}</b>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="underline hover:text-[#0B4F4B]"
                >
                  Hủy
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyTo ? "Viết phản hồi..." : "Viết bình luận của bạn..."
              }
              rows={3}
              disabled={createComment.isPending}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[#0F6B66] focus:ring-4 focus:ring-[#0F6B66]/20 transition-all resize-none disabled:bg-slate-50"
            />
            {errorMsg && (
              <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Nhấn Enter để gửi, Shift + Enter để xuống dòng.
            </p>
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                disabled={createComment.isPending || !content.trim()}
                className="rounded-lg bg-[#0F6B66] hover:bg-[#0B4F4B] text-white transition-colors"
              >
                {createComment.isPending ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500 mb-8">
            Vui lòng đăng nhập để tham gia bình luận.
          </p>
        )}
      </div>

      {/* ─── Pagination cho comment gốc ─── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={!pagination?.hasPreviousPage}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !pagination?.hasPreviousPage
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Trước
          </button>

          <span className="text-sm font-medium px-4 text-slate-700 tabular-nums">
            Trang {pagination?.pageIndex} / {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((old) => (pagination?.hasNextPage ? old + 1 : old))
            }
            disabled={!pagination?.hasNextPage}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !pagination?.hasNextPage
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
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
