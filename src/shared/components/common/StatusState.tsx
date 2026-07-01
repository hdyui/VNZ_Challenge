export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-20 gap-4">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p>Đang tải dữ liệu...</p>
  </div>
);

export const ErrorState = ({
  message = "Đã có lỗi xảy ra",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) => (
  <div>
    <p>{message}</p>
    <button onClick={onRetry}>Thử lại</button>
  </div>
);

export const EmptyState = ({
  message = "Không có gì cả",
}: {
  message?: string;
}) => (
  <div>
    <p>{message}</p>
    <button>Không có gì cả</button>
  </div>
);
