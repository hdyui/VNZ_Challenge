import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { UrlPagination } from "@/shared/components/ui/UrlPagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useDepartmentList, useDeleteDepartment } from "../hooks/useDepartment";
import { DepartmentStatusBadge } from "../components/DepartmentStatusBadge";
import { Loader2, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";
import type { DepartmentQueryParams } from "@/features/departments/types";
import type { DepartmentListItem } from "@/features/departments/types";
import type { AccountListItem } from "@/features/employees/type";
const LIMIT = 10;

export const DepartmentListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || "all";
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  // 2. GỌI API DỰA TRÊN URL
  const params: DepartmentQueryParams = {
    pageIndex: page,
    pageSize: LIMIT,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  };
  const { data, isLoading } = useDepartmentList(params);

  const {
    mutate: deleteDepartment,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteDepartment();
  const responseData = data as unknown as ApiResponse<
    PaginatedResponse<DepartmentListItem>
  >;
  const paginatedData =
    responseData?.value ||
    (data as unknown as PaginatedResponse<DepartmentListItem>);

  const items = paginatedData?.items || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  // 3. FIX LỖI ĐÁ VỀ TRANG 1 KHI RELOAD
  useEffect(() => {
    const currentUrlSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentUrlSearch) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        next.set("page", "1");
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleStatusChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all") {
        next.delete("isActive");
      } else {
        next.set("isActive", val);
      }
      next.set("page", "1");
      return next;
    });
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa phòng ban này? Hành động này sẽ thất bại nếu phòng ban vẫn còn user.",
      )
    ) {
      deleteDepartment(id);
    }
  };

  const columns: ColumnDef<DepartmentListItem>[] = [
    {
      header: "Mã PB",
      cell: (item) => (
        <span className="font-semibold text-gray-700">
          {item.departmentCode}
        </span>
      ),
    },
    {
      header: "Tên phòng ban",
      cell: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },

    {
      header: "Trạng thái",
      cell: (item) => <DepartmentStatusBadge isActive={item.isActive} />,
    },
    {
      header: "Ngày tạo",
      cell: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      header: "Thao tác",
      cell: (item) => (
        <div className="flex gap-3 items-center">
          <Link
            to={`/admin/departments/${item.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/admin/departments/update/${item.id}`}
            className="text-sm text-orange-500 hover:text-orange-700 font-medium transition-colors"
          >
            Sửa
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={isDeleting && deletingId === item.id}
            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Xóa phòng ban"
          >
            {isDeleting && deletingId === item.id ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Phòng ban
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách tất cả các phòng ban trong hệ thống
          </p>
        </div>
        <Link to="/admin/departments/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Thêm phòng ban
          </Button>
        </Link>
      </div>
      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm phòng ban..."
              className="h-11 rounded-xl border-gray-200 bg-slate-50 pl-11 pr-4 text-sm shadow-sm transition focus:bg-white focus:border-blue-300"
            />
          </div>
          {searchInput && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchInput("")}
              className="h-11 min-w-[104px] rounded-xl border-blue-200 bg-blue-50 px-4 text-blue-700 shadow-sm transition hover:bg-blue-100 hover:text-blue-800"
            >
              Xóa
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <SlidersHorizontal className="size-4 text-gray-500" />
            Trạng thái
          </div>
          <div className="w-full sm:w-auto">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-11 w-full rounded-xl border-gray-200 bg-white shadow-sm">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đang hoạt động</SelectItem>
                <SelectItem value="false">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Table */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Không có dữ liệu phòng ban.
            </div>
          ) : (
            <DataTable data={items} columns={columns} />
          )}
        </CardContent>
      </Card>
      {/* Pagination */}
      {!isLoading && <UrlPagination totalPages={totalPages} />}{" "}
    </div>
  );
};
