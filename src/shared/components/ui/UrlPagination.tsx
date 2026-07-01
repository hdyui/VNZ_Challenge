import { useSearchParams } from "react-router-dom";
import { Button } from "./button"; // Tận dụng UI button sẵn có của dự án

interface PaginationProps {
  totalPages: number;
}

export const UrlPagination = ({ totalPages }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy current page từ URL, mặc định là 1 nếu không có
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Giữ nguyên các params khác, chỉ update param 'page'
      searchParams.set("page", newPage.toString());
      setSearchParams(searchParams);
    }
  };

  if (totalPages < 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Trước
      </Button>

      <span className="text-sm font-medium px-4">
        Trang {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau
      </Button>
    </div>
  );
};
