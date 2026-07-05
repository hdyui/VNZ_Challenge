// src/features/publicNews/components/CommentItem.tsx
import { useState } from "react";
import {
  Trash2,
  EyeOff,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNewsComments } from "../hooks/usePublicNewsList";
import type { NewsComment } from "../types";

interface CommentItemProps {
  comment: NewsComment;
  newsId: string;
  isAdmin: boolean;
  canReply: boolean;
  isReply?: boolean;
  onReplyClick?: () => void;
}

const REPLIES_PAGE_SIZE = 10;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CommentItem = ({
  comment,
  newsId,
  isAdmin,
  canReply,
  isReply = false,
  onReplyClick,
}: CommentItemProps) => {
  // TODO: thay bằng state đến từ server (isHidden) khi BE có endpoint ẩn comment.
  const [locallyHidden, setLocallyHidden] = useState(false);

  // ─── Replies: chỉ comment gốc mới có thể mở rộng, và chỉ fetch khi mở ───────
  // BE trả replies qua chính GET /news/{newsId}/comments?ParentCommentId=...,
  // có phân trang riêng, KHÔNG nhúng sẵn trong comment gốc.
  const [showReplies, setShowReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isError: isRepliesError,
  } = useNewsComments(
    newsId,
    {
      parentCommentId: comment.id,
      page: repliesPage,
      pageSize: REPLIES_PAGE_SIZE,
    },
    // Chỉ gọi API khi người dùng thực sự mở phần trả lời ra.
    { enabled: !isReply && showReplies },
  );

  const repliesPagination = (repliesData as any)?.value;
  const replies: NewsComment[] = repliesPagination?.items ?? [];
  const repliesTotalPages: number = repliesPagination
    ? Math.ceil(repliesPagination.totalCount / repliesPagination.pageSize)
    : 0;

  const handleToggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const handleDelete = () => {
    if (!window.confirm("Xóa bình luận này? Hành động không thể hoàn tác.")) {
      return;
    }
    // ⚠️ Chưa có endpoint xóa comment trong tài liệu API.
    // Gọi publicApi.deleteComment(newsId, comment.id) khi BE bổ sung.
    console.warn("Chưa có endpoint xóa comment — cần bổ sung từ BE.");
  };

  const handleHide = () => {
    // ⚠️ Chưa có endpoint ẩn comment trong tài liệu API.
    // Gọi publicApi.hideComment(newsId, comment.id) khi BE bổ sung, sau đó
    // dựa vào response để set state thay vì toggle cục bộ như dưới đây.
    setLocallyHidden((prev) => !prev);
  };

  if (locallyHidden) {
    return (
      <div className={isReply ? "ml-10" : ""}>
        <p className="text-sm italic text-gray-400">
          Bình luận đã bị ẩn bởi quản trị viên.
        </p>
      </div>
    );
  }

  return (
    <div className={isReply ? "ml-10 pl-4 border-l-2 border-gray-100" : ""}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-800 text-sm">
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-1">
            {!isReply && canReply && onReplyClick && (
              <button
                onClick={onReplyClick}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CornerDownRight className="h-3 w-3" /> Trả lời
              </button>
            )}

            {/* Reply nested tối đa 1 cấp: chỉ comment gốc mới có nút xem trả lời */}
            {!isReply && (
              <button
                onClick={handleToggleReplies}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Ẩn trả lời
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> Xem trả lời
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              title="Ẩn bình luận"
              onClick={handleHide}
              className="text-gray-400 hover:text-yellow-600 transition-colors"
            >
              <EyeOff className="h-4 w-4" />
            </button>
            <button
              title="Xóa bình luận"
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Danh sách reply (chỉ hiện khi mở, chỉ ở comment gốc) ─── */}
      {!isReply && showReplies && (
        <div className="mt-4 space-y-4">
          {isLoadingReplies && (
            <p className="text-xs text-gray-400 ml-10">Đang tải trả lời...</p>
          )}

          {isRepliesError && (
            <p className="text-xs text-red-500 ml-10">
              Không thể tải trả lời. Vui lòng thử lại sau.
            </p>
          )}

          {!isLoadingReplies && !isRepliesError && replies.length === 0 && (
            <p className="text-xs text-gray-400 ml-10">Chưa có trả lời nào.</p>
          )}

          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              newsId={newsId}
              isAdmin={isAdmin}
              canReply={canReply}
              isReply
            />
          ))}

          {repliesTotalPages > 1 && (
            <div className="flex items-center gap-2 ml-10">
              <button
                onClick={() => setRepliesPage((p) => Math.max(p - 1, 1))}
                disabled={!repliesPagination?.hasPreviousPage}
                className="text-xs text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline"
              >
                Trang trước
              </button>
              <span className="text-xs text-gray-400">
                {repliesPagination?.pageIndex}/{repliesTotalPages}
              </span>
              <button
                onClick={() =>
                  setRepliesPage((p) =>
                    repliesPagination?.hasNextPage ? p + 1 : p,
                  )
                }
                disabled={!repliesPagination?.hasNextPage}
                className="text-xs text-blue-600 hover:underline disabled:text-gray-300 disabled:no-underline"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
