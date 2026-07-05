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
import { Loader2, Search, Trash2, Edit } from "lucide-react";

import { useAccountList, useDeleteAccount } from "../hooks/useAccount";
import type { AccountListItem } from "../type";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/types";
import type { AccountQueryParams } from "@/features/employees/type";

const LIMIT = 10;

export const AccountListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const role = searchParams.get("role") || "all";
  const status = searchParams.get("status") || "all";

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const params: AccountQueryParams = {
    pageIndex: page,
    pageSize: LIMIT,
    search: debouncedSearch || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  };

  const { data, isLoading } = useAccountList(params);
  const {
    mutate: deleteAccount,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteAccount();

  // Ép kiểu an toàn (bao trọn cả trường hợp Axios giữ vỏ 'value' hoặc đã lột sẵn)
  const responseData = data as unknown as ApiResponse<
    PaginatedResponse<AccountListItem>
  >;
  const paginatedData =
    responseData?.value ||
    (data as unknown as PaginatedResponse<AccountListItem>);

  // const items = paginatedData?.items || [];
  const items = paginatedData?.items || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  console.log(items);

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

  const handleFilterChange = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all") next.delete(key);
      else next.set(key, val);
      next.set("page", "1");
      return next;
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bác có chắc chắn muốn xóa/khóa tài khoản này không?")) {
      deleteAccount(id);
    }
  };

  const columns: ColumnDef<AccountListItem>[] = [
    {
      header: "Nhân viên",
      cell: (item) => (
        <div>
          <p className="font-medium text-gray-800">
            {item.user?.lastName ?? ""} {item.user?.firstName ?? ""}
          </p>
          <p className="text-xs text-gray-500">{item.user?.position ?? ""}</p>
        </div>
      ),
    },
    { header: "Email", cell: (item) => <span>{item.email}</span> },
    {
      header: "Vai trò",
      cell: (item) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${item.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
        >
          {item.role}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      cell: (item) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full 
             ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            `}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Thao tác",
      cell: (item) => (
        <div className="flex gap-3 items-center">
          <Link
            to={`/admin/accounts/update/${item.id}`}
            className="text-sm text-orange-500 hover:text-orange-700 flex items-center gap-1"
          >
            <Edit size={15} /> Sửa
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={isDeleting && deletingId === item.id}
            className="text-red-500 hover:text-red-700 disabled:opacity-40"
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Tài khoản
          </h1>
          <p className="text-sm text-gray-500">
            Danh sách tài khoản nhân viên hệ thống
          </p>
        </div>
        <Link to="/admin/accounts/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Tạo tài khoản
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm email..."
            className="pl-10"
          />
        </div>
        <Select
          value={role}
          onValueChange={(val) => handleFilterChange("role", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(val) => handleFilterChange("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">Đang tải...</div>
          ) : (
            <DataTable data={items} columns={columns} />
          )}
        </CardContent>
      </Card>

      {!isLoading && <UrlPagination totalPages={totalPages} />}
    </div>
  );
};
