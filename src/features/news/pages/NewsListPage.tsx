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
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { NewsTpyeBadge } from "../components/NewTypeBadge";

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
    isPending: isDeleting, // Logic preserved, even if unused in current UI
    variables: deletingId,
  } = useDeleteNews();

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
            className="h-10 w-16 rounded-md object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="h-10 w-16 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 text-xs border border-gray-100">
            Trống
          </div>
        ),
    },
    {
      header: "Tiêu đề",
      cell: (item) => (
        <span className="font-medium text-gray-900 line-clamp-2">
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
      header: "Loại tin",
      cell: (item) => <NewsTpyeBadge status={item.type} />,
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
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            onClick={() => navigate(`/admin/news/update/${item.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            onClick={() => navigate(`/admin/news/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Quản lý Tin tức
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách tất cả bài viết trên hệ thống
          </p>
        </div>
        <Link to="/admin/news/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-10 px-4 rounded-lg flex items-center gap-2 transition-all">
            <Plus className="h-4 w-4" />
            Viết bài mới
          </Button>
        </Link>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md flex items-center">
          <Search className="absolute left-3 text-gray-400 h-4 w-4" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề..."
            className="h-10 w-full pl-9 pr-10 border-gray-200 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all bg-white"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="sm:w-[200px]">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 rounded-lg border-gray-200 shadow-sm bg-white focus:ring-2 focus:ring-indigo-500/20">
              <div className="flex items-center gap-2 text-gray-600">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 shadow-lg">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-md"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-3">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Đang tải danh sách...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <Search className="h-8 w-8 text-gray-300 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Không tìm thấy bài viết nào
              </span>
              <span className="text-sm text-gray-500">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable data={items} columns={columns} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="pt-2">
          <UrlPagination totalPages={pagination.totalPages} />
        </div>
      )}
    </div>
  );
};
