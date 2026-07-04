// src/features/publicNews/components/CommentItem.tsx
import { useState } from "react";
import { Trash2, EyeOff, CornerDownRight } from "lucide-react";
import type { NewsComment } from "../types";

export interface CommentWithReplies extends NewsComment {
  replies?: NewsComment[];
}

interface CommentItemProps {
  comment: CommentWithReplies;
  isAdmin: boolean;
  canReply: boolean;
  isReply?: boolean;
  onReplyClick?: () => void;
}

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
  isAdmin,
  canReply,
  isReply = false,
  onReplyClick,
}: CommentItemProps) => {
  // TODO: thay bằng state đến từ server (isHidden) khi BE có endpoint ẩn comment.
  const [locallyHidden, setLocallyHidden] = useState(false);

  const handleDelete = () => {
    if (!window.confirm("Xóa bình luận này? Hành động không thể hoàn tác.")) {
      return;
    }
    // ⚠️ Chưa có endpoint xóa comment trong tài liệu API (12.1/12.2).
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

          {!isReply && canReply && onReplyClick && (
            <button
              onClick={onReplyClick}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              <CornerDownRight className="h-3 w-3" /> Trả lời
            </button>
          )}
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

      {/* Reply nested 1 cấp: chỉ render replies ở comment gốc, không đệ quy sâu hơn */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isAdmin={isAdmin}
              canReply={canReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
