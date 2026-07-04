// src/features/news/pages/NewsListPage.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { useNewsList, useDeleteNews } from "../hooks/useNews";
import { NewsStatusBadge } from "../components/NewsStatusBadge";
import type { NewsListItem, NewsStatus } from "../type";
import {
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

const LIMIT = 10;

const STATUS_OPTIONS: { label: string; value: NewsStatus | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Nháp", value: "draft" },
  { label: "Đã xuất bản", value: "published" },
  { label: "Lưu trữ", value: "archived" },
];

const parseStatus = (value: string | null): NewsStatus | "all" => {
  const valid = STATUS_OPTIONS.map((o) => o.value);
  return (valid as string[]).includes(value ?? "")
    ? (value as NewsStatus | "all")
    : "all";
};

export const NewsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const status = parseStatus(searchParams.get("status"));

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const { data, isLoading } = useNewsList({
    page,
    pageSize: LIMIT,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    mutate: deleteNews,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteNews();

  const resetToFirstPage = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleStatusChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all") next.delete("status");
      else next.set("status", val);
      next.set("page", "1");
      return next;
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      deleteNews(id);
    }
  };

  const columns: ColumnDef<NewsListItem>[] = [
    {
      header: "Ảnh bìa",
      cell: (item) =>
        item.coverImg ? (
          <img
            src={item.coverImg}
            alt={item.title}
            className="h-10 w-16 rounded object-cover border border-gray-100"
          />
        ) : (
          <div className="h-10 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        ),
    },
    {
      header: "Tiêu đề",
      cell: (item) => (
        <span className="font-medium text-gray-800 line-clamp-2">
          {item.title}
        </span>
      ),
    },
    {
      header: "Người đăng",
      cell: (item) => (
        <span className="text-sm text-gray-600">{item.author.fullName}</span>
      ),
    },
    {
      header: "Trạng thái",
      cell: (item) => <NewsStatusBadge status={item.status} />,
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
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate(`/admin/news/update/${item.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate(`/admin/news/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => {
              handleDelete(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Tin tức
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách tất cả bài viết trên hệ thống
          </p>
        </div>
        <Link to="/admin/news/create">
          <Button className="bg-blue-600 hover:bg-blue-900 w-40 h-9">
            <Plus className="h-4 w-4" />
            Viết bài mới
          </Button>
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="grid gap-3 rounded-xl p-1 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề..."
              className="h-11 rounded-xl border-gray-200 bg-slate-50 pl-11 pr-4 text-sm shadow-sm transition focus:bg-white focus:border-blue-300"
            />
          </div>
          {searchInput ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchInput("")}
              className="h-11 min-w-[104px] rounded-xl border-blue-200 bg-blue-50 px-4 text-blue-700 shadow-sm transition hover:bg-blue-100 hover:text-blue-800"
            >
              Xóa
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-1.5 shadow-sm">
          <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-gray-600">
            <SlidersHorizontal className="size-4 text-gray-500" />
            Trạng thái
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Chưa có bài viết nào.
            </div>
          ) : (
            <DataTable data={items} columns={columns} />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && <UrlPagination totalPages={pagination.totalPages} />}
    </div>
  );
};
