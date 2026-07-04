// src/features/publicNews/components/CommentSection.tsx
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentUserRole } from "@/features/auth/hooks/useCurrentUserRole";
import { isRateLimitError } from "@/shared/utils/apiError";
import { useNewsComments, useCreateComment } from "../hooks/usePublicNewsList";
import CommentItem, { type CommentWithReplies } from "./CommentItem";
import type { NewsComment } from "../types";

interface CommentSectionProps {
  newsId: string;
}

/**
 * Dựng cây comment 1 cấp từ danh sách phẳng (dựa theo parentCommentId).
 * Nếu 1 reply lại trỏ parentCommentId vào 1 reply khác (tức muốn tạo cấp 2),
 * ta đẩy nó lên làm comment gốc để đảm bảo UI chỉ nested tối đa 1 cấp.
 */
function buildCommentTree(comments: NewsComment[]): CommentWithReplies[] {
  const byId = new Map<string, CommentWithReplies>();
  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }));

  const roots: CommentWithReplies[] = [];

  byId.forEach((comment) => {
    if (!comment.parentCommentId) {
      roots.push(comment);
      return;
    }
    const parent = byId.get(comment.parentCommentId);
    if (parent && !parent.parentCommentId) {
      parent.replies!.push(comment);
    } else {
      // Cha không tồn tại hoặc cha cũng là 1 reply -> không nested tiếp, coi như gốc
      roots.push(comment);
    }
  });

  return roots;
}

const CommentSection = ({ newsId }: CommentSectionProps) => {
  const role = useCurrentUserRole();
  const isAdmin = role === "admin";
  const canComment = role !== "anonymous"; // Applicant/Employee/Admin đều thấy form

  const { data, isLoading, isError } = useNewsComments(newsId);
  const createComment = useCreateComment(newsId);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rawComments: NewsComment[] = (data as any)?.value ?? [];
  const tree = buildCommentTree(rawComments);

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
        Bình luận{rawComments.length > 0 ? ` (${rawComments.length})` : ""}
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

      {!isLoading && !isError && tree.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}

      <div className="space-y-6">
        {tree.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isAdmin={isAdmin}
            canReply={canComment}
            onReplyClick={() =>
              setReplyTo({ id: comment.id, authorName: comment.authorName })
            }
          />
        ))}
      </div>
    </section>
  );
};

export default CommentSection;
