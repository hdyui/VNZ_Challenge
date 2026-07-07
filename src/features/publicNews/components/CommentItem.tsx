import { useState } from "react";
import {
  Trash2,
  EyeOff,
  Eye,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useNewsComments,
  useHideComment,
  useUnhideComment,
  useDeleteComment,
} from "../hooks/usePublicNewsList";
import type { NewsComment } from "../types";

// BE hiện có vài chỗ đặt tên field tác giả không đồng nhất giữa các bản build
// (accountName / authorName / userName / author.name). Hàm này resolve theo
// thứ tự ưu tiên để UI luôn hiện được tên người bình luận thay vì bị trống.
// Field thực tế trả về từ GET /comments hiện tại là `accountName`.
export const resolveAuthorName = (comment: any): string =>
  comment?.accountName ??
  comment?.authorName ??
  comment?.userName ??
  comment?.author?.name ??
  comment?.createdBy?.name ??
  "Ẩn danh";

// Tương tự cho avatar: field thực tế là `accountAvatar`.
export const resolveAuthorAvatar = (comment: any): string | undefined =>
  comment?.accountAvatar ??
  comment?.authorAvatar ??
  comment?.avatarUrl ??
  comment?.author?.avatar;

interface CommentItemProps {
  comment: NewsComment;
  newsId: string;
  isAdmin: boolean;
  canReply: boolean;
  isReply?: boolean;
  // Nhận tên người đang được trả lời (root hoặc 1 reply) -> cho phép flatten:
  // reply-lại-reply vẫn gửi lên như reply của comment gốc, chỉ khác @tên hiển thị.
  onReplyClick?: (targetAuthorName: string) => void;
}

const REPLIES_PAGE_SIZE = 10;

// Reply được lưu kèm tiền tố "@Tên: " ở đầu content (xem
// CommentSection.handleSubmit). Dấu ":" là ranh giới rõ ràng nên tách ra để
// hiển thị phần tên nổi bật hơn phần nội dung.
const MENTION_PREFIX_REGEX = /^(@[^:]+):\s*/;

const renderReplyContent = (content: string) => {
  const match = content.match(MENTION_PREFIX_REGEX);
  if (!match) return content;

  const mention = match[1];
  const rest = content.slice(match[0].length);
  return (
    <>
      <span className="font-medium text-[#0F6B66]">{mention}</span> {rest}
    </>
  );
};

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
  const [showReplies, setShowReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isError: isRepliesError,
  } = useNewsComments(
    newsId,
    {
      parentCommentId: comment?.id,
      page: repliesPage,
      pageSize: REPLIES_PAGE_SIZE,
      includeHidden: isAdmin,
    },
    { enabled: !isReply && showReplies && !!comment?.id },
  );

  const repliesPagination = (repliesData as any)?.value;
  // Sắp xếp reply từ sớm nhất -> trễ nhất trong phạm vi trang hiện tại.
  // filter(Boolean) để phòng BE trả về phần tử rỗng/null trong mảng phân trang.
  const replies: NewsComment[] = [...(repliesPagination?.items ?? [])]
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  const repliesTotalPages: number = repliesPagination
    ? Math.ceil(repliesPagination.totalCount / repliesPagination.pageSize)
    : 0;

  const hideComment = useHideComment(newsId);
  const unhideComment = useUnhideComment(newsId);
  const deleteComment = useDeleteComment(newsId);

  const handleToggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const handleDelete = () => {
    if (!window.confirm("Xóa bình luận này? Hành động không thể hoàn tác.")) {
      return;
    }
    deleteComment.mutate(comment.id, {
      onError: () => window.alert("Xóa bình luận thất bại, vui lòng thử lại."),
    });
  };

  // BE đã có cả endpoint hide và unhide -> cho phép admin bật/tắt trạng thái ẩn.
  const handleToggleHide = () => {
    if (comment.isHidden) {
      if (!window.confirm("Bỏ ẩn bình luận này?")) return;
      unhideComment.mutate(comment.id, {
        onError: () =>
          window.alert("Bỏ ẩn bình luận thất bại, vui lòng thử lại."),
      });
      return;
    }

    if (!window.confirm("Ẩn bình luận này khỏi người dùng khác?")) {
      return;
    }
    hideComment.mutate(comment.id, {
      onError: () => window.alert("Ẩn bình luận thất bại, vui lòng thử lại."),
    });
  };

  const authorName = resolveAuthorName(comment);
  const authorAvatar = resolveAuthorAvatar(comment);
  // BE trả sẵn replyCount trong từng comment gốc -> dùng luôn để hiện số lượng
  // mà không cần gọi API replies trước. Nếu field này thiếu (BE cũ), fallback
  // sang totalCount lấy được sau khi user đã mở replies ra.
  const replyCount: number =
    (comment as any)?.replyCount ?? repliesPagination?.totalCount ?? 0;
  const isBusy =
    hideComment.isPending || unhideComment.isPending || deleteComment.isPending;

  // Phòng thủ: nếu vì lý do gì đó (dữ liệu phân trang lỗi/race condition)
  // comment bị undefined, không render gì thay vì crash toàn trang.
  if (!comment) {
    return null;
  }

  // Non-admin không nên thấy nội dung bình luận đã ẩn (BE cũng nên tự lọc,
  // nhưng phòng khi BE vẫn trả về, FE che nội dung lại cho chắc).
  if (comment.isHidden && !isAdmin) {
    return (
      <div className={isReply ? "ml-10" : ""}>
        <p className="text-sm italic text-slate-400">
          Bình luận đã bị ẩn bởi quản trị viên.
        </p>
      </div>
    );
  }

  return (
    <div className={isReply ? "ml-10 pl-4 border-l-2 border-slate-200" : ""}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex gap-3">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 text-sm">
                {authorName}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isHidden && isAdmin && (
                <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-semibold">
                  Đã ẩn
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 mt-1 whitespace-pre-line break-words">
              {isReply ? renderReplyContent(comment.content) : comment.content}
            </p>

            <div className="flex items-center gap-4 mt-1">
              {canReply && onReplyClick && (
                <button
                  onClick={() => onReplyClick(authorName)}
                  className="text-xs text-slate-500 hover:text-[#0F6B66] transition-colors flex items-center gap-1 font-medium"
                >
                  <CornerDownRight className="h-3 w-3" /> Trả lời
                </button>
              )}

              {!isReply && replyCount > 0 && (
                <button
                  onClick={handleToggleReplies}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 font-medium"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="h-3 w-3" /> Ẩn trả lời ({replyCount}
                      )
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" /> Xem trả lời (
                      {replyCount})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              title={comment.isHidden ? "Bỏ ẩn bình luận" : "Ẩn bình luận"}
              onClick={handleToggleHide}
              disabled={isBusy}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              {comment.isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              title="Xóa bình luận"
              onClick={handleDelete}
              disabled={isBusy}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Danh sách reply ─── */}
      {!isReply && showReplies && (
        <div className="mt-4 space-y-4">
          {isLoadingReplies && (
            <p className="text-xs text-slate-400 ml-10">Đang tải trả lời...</p>
          )}

          {isRepliesError && (
            <p className="text-xs text-red-500 ml-10">
              Không thể tải trả lời. Vui lòng thử lại sau.
            </p>
          )}

          {!isLoadingReplies && !isRepliesError && replies.length === 0 && (
            <p className="text-xs text-slate-400 ml-10">Chưa có trả lời nào.</p>
          )}

          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              newsId={newsId}
              isAdmin={isAdmin}
              canReply={canReply}
              onReplyClick={onReplyClick}
              isReply
            />
          ))}

          {repliesTotalPages > 1 && (
            <div className="flex items-center gap-2 ml-10">
              <button
                onClick={() => setRepliesPage((p) => Math.max(p - 1, 1))}
                disabled={!repliesPagination?.hasPreviousPage}
                className="text-xs text-[#0F6B66] hover:text-[#0B4F4B] transition-colors disabled:text-slate-300 disabled:no-underline font-medium"
              >
                Trang trước
              </button>
              <span className="text-xs text-slate-500 tabular-nums">
                {repliesPagination?.pageIndex}/{repliesTotalPages}
              </span>
              <button
                onClick={() =>
                  setRepliesPage((p) =>
                    repliesPagination?.hasNextPage ? p + 1 : p,
                  )
                }
                disabled={!repliesPagination?.hasNextPage}
                className="text-xs text-[#0F6B66] hover:text-[#0B4F4B] transition-colors disabled:text-slate-300 disabled:no-underline font-medium"
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
