import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useDeleteRecruitment,
  usePublicRecruitmentList,
} from "../hooks/useRecruitment";
import type { PublicRecruitmentQueryParams, RecruitmentLevel } from "../type";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { UrlPagination } from "@/shared/components/ui/UrlPagination";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Search,
  Plus,
  BriefcaseBusiness,
  Edit,
  Eye,
  SlidersHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const LIMIT = 10;

const LEVEL_OPTIONS: { label: string; value: RecruitmentLevel | "all" }[] = [
  { label: "Tất cả cấp bậc", value: "all" },
  { label: "Intern", value: "Intern" },
  { label: "Fresher", value: "Fresher" },
  { label: "Junior", value: "Junior" },
  { label: "Middle", value: "Middle" },
  { label: "Senior", value: "Senior" },
];

const LEVEL_COLOR: Record<RecruitmentLevel, string> = {
  all: "bg-slate-100 text-slate-700 border-slate-200",
  Intern: "bg-slate-100 text-slate-700 border-slate-200",
  Fresher: "bg-green-100 text-green-700 border-green-200",
  Junior: "bg-blue-100 text-blue-700 border-blue-200",
  Middle: "bg-violet-100 text-violet-700 border-violet-200",
  Senior: "bg-amber-100 text-amber-700 border-amber-200",
};

const getStatusBadgeClass = (status?: string | null) => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("open") || normalized.includes("active")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (normalized.includes("draft") || normalized.includes("pending")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (normalized.includes("close") || normalized.includes("inactive")) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};

const parseLevel = (value: string | null): RecruitmentLevel | "all" => {
  const valid = LEVEL_OPTIONS.map((o) => o.value);
  return (valid as string[]).includes(value ?? "")
    ? (value as RecruitmentLevel | "all")
    : "all";
};

const RecruitmentPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const level = parseLevel(searchParams.get("level"));

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const params: PublicRecruitmentQueryParams = {
    pageIndex: page,
    pageSize: LIMIT,
    search: debouncedSearch || undefined,
    level,
  };

  const { data, isLoading } = usePublicRecruitmentList(params);
  const { mutate: deleteRecruitment, isPending: isDeleting } =
    useDeleteRecruitment();

  const recruitments = data?.value?.items ?? [];
  const total = data?.value?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    const currentUrlSearch = searchParams.get("search") || "";

    // Chỉ reset về trang 1 khi người dùng THỰC SỰ gõ thay đổi từ khóa
    if (debouncedSearch !== currentUrlSearch) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedSearch) next.set("search", debouncedSearch);
          else next.delete("search");
          next.set("page", "1");
          return next;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);
  const handleLevelChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === "all") next.delete("level");
      else next.set("level", val);
      next.set("page", "1");
      return next;
    });
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const pendingDeleteItem = recruitments.find(
    (item) => item.id === pendingDeleteId,
  );

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    setDeleteError(null);
    deleteRecruitment(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        // If we deleted the last item on a page beyond page 1, step back a page
        if (recruitments.length === 1 && page > 1) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set("page", String(page - 1));
          setSearchParams(nextParams);
        }
      },
      onError: () => {
        setDeleteError("Xóa thất bại, vui lòng thử lại.");
      },
    });
  };

  const columns: ColumnDef<(typeof recruitments)[number]>[] = [
    {
      header: "Tiêu đề",
      cell: (item) => (
        <span className="font-medium text-gray-800 line-clamp-2">
          {item.title}
        </span>
      ),
    },
    {
      header: "Phòng ban",
      cell: (item) => (
        <span className="text-sm text-gray-600">{item.department.name}</span>
      ),
    },
    {
      header: "Cấp bậc",
      cell: (item) => (
        <span
          className={`inline-flex w-16 justify-center items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOR[item.level]}`}
        >
          {item.level}
        </span>
      ),
    },
    {
      header: "Ngày đăng",
      cell: (item) => (
        <span className="text-sm text-gray-500">
          {format(new Date(item.createdAt), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      cell: (item) => (
        <span
          className={`inline-flex w-16 justify-center items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
        >
          {item.status ?? "Không rõ"}
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
            onClick={() => navigate(`/admin/recruitments/update/${item.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate(`/admin/recruitments/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => setPendingDeleteId(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Tuyển dụng
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các vị trí đang mở ở các phòng ban
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/admin/recruitments/create")}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 w-40 h-9"
        >
          <Plus className="h-4 w-4" />
          Vị trí mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className="grid gap-3 rounded-xl p-1 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề hoặc phòng ban..."
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
            Cấp bậc
          </div>
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm">
              <SelectValue placeholder="Tất cả cấp bậc" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((opt) => (
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
          ) : recruitments.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Không tìm thấy vị trí nào.
            </div>
          ) : (
            <DataTable data={recruitments} columns={columns} />
          )}
        </CardContent>
      </Card>

      {/* Pagination — luôn hiển thị khi đã có dữ liệu, kể cả khi chỉ có 1 trang */}
      {!isLoading && <UrlPagination totalPages={totalPages} />}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa vị trí này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn{" "}
              <strong>&ldquo;{pendingDeleteItem?.title}&rdquo;</strong>. Thao
              tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-gray-200"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Đồng ý xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecruitmentPage;
