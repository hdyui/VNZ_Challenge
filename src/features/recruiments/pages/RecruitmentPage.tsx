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
  Sparkles,
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
  all: "bg-slate-50 text-slate-700 border border-slate-200",
  Intern: "bg-slate-100 text-slate-700 border border-slate-300",
  Fresher: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Junior: "bg-sky-50 text-sky-700 border border-sky-200",
  Middle: "bg-violet-50 text-violet-700 border border-violet-200",
  Senior: "bg-amber-50 text-amber-800 border border-amber-200",
};

const getStatusStyle = (status?: string | null) => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("open") || normalized.includes("active")) {
    return {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    };
  }

  if (normalized.includes("draft") || normalized.includes("pending")) {
    return {
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-500",
    };
  }

  if (normalized.includes("close") || normalized.includes("inactive")) {
    return {
      badge: "bg-red-50 text-red-600 border border-red-200",
      dot: "bg-red-600",
    };
  }

  return {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
  };
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

  const TH_STYLE =
    "text-[11px] uppercase font-semibold tracking-wider text-slate-500";

  const columns: ColumnDef<(typeof recruitments)[number]>[] = [
    {
      header: "Tiêu đề",
      headerClassName: TH_STYLE,
      cell: (item) => (
        <span className="font-semibold text-slate-900 line-clamp-2">
          {item.title}
        </span>
      ),
    },
    {
      header: "Phòng ban",
      headerClassName: TH_STYLE,
      cell: (item) => (
        <span className="text-sm text-slate-700 line-clamp-1">
          {item.department.name}
        </span>
      ),
    },
    {
      header: "Cấp bậc",
      headerClassName: `${TH_STYLE} text-center`,
      cellClassName: "text-center",
      cell: (item) => (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${LEVEL_COLOR[item.level]}`}
        >
          {item.level}
        </span>
      ),
    },
    {
      header: "Ngày đăng",
      headerClassName: `${TH_STYLE} text-right`,
      cellClassName: "text-right",
      cell: (item) => (
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {format(new Date(item.createdAt), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: `${TH_STYLE} text-center`,
      cellClassName: "text-center",
      cell: (item) => {
        const style = getStatusStyle(item.status);
        return (
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${style.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {item.status ?? "Không rõ"}
          </span>
        );
      },
    },
    {
      header: "Thao tác",
      headerClassName: `${TH_STYLE} text-right`,
      cellClassName: "text-right",
      cell: (item) => (
        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Sửa vị trí ${item.title}`}
            title="Sửa"
            className="h-9 w-9 rounded-lg text-slate-500 hover:text-[#0F6B66] hover:bg-[#0F6B66]/10 transition-colors"
            onClick={() => navigate(`/admin/recruitments/update/${item.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Xem vị trí ${item.title}`}
            title="Xem chi tiết"
            className="h-9 w-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => navigate(`/admin/recruitments/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Xóa vị trí ${item.title}`}
            title="Xóa"
            className="h-9 w-9 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-colors"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F6B66]/10 text-[#0F6B66]">
            <BriefcaseBusiness className="h-5 w-5" />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-[#0F6B66]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tuyển dụng
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý các vị trí đang mở ở các phòng ban
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/admin/recruitments/create")}
          className="gap-2 rounded-lg bg-[#0F6B66] hover:bg-[#0B4F4B] text-white w-40 h-9 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Vị trí mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <div className="grid gap-3 rounded-2xl p-1 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề hoặc phòng ban..."
              aria-label="Tìm kiếm theo tiêu đề hoặc phòng ban"
              className="h-11 rounded-full border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm transition-all focus:border-[#0F6B66] focus:ring-4 focus:ring-[#0F6B66]/20 focus:outline-none"
            />
          </div>
          {searchInput ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchInput("")}
              className="h-11 min-w-[104px] rounded-full border-slate-300 bg-white px-4 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Xóa
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm shadow-slate-200/60">
          <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700 pl-2">
            <SlidersHorizontal className="size-4 text-slate-500" />
            Cấp bậc
          </div>
          <Select value={level} onValueChange={handleLevelChange}>
            <SelectTrigger className="h-11 w-[140px] rounded-full border-slate-300 bg-white shadow-sm transition-all focus:border-[#0F6B66] focus:ring-4 focus:ring-[#0F6B66]/20 focus:outline-none">
              <SelectValue placeholder="Tất cả cấp bậc" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/60">
              {LEVEL_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm shadow-slate-200/60 border-slate-200 rounded-2xl overflow-hidden py-0 gap-0 bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-500">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#0F6B66]" />
                <span className="text-sm font-medium text-[#0F6B66]">
                  Đang tải dữ liệu...
                </span>
              </div>
              <div className="w-full max-w-md space-y-3 mt-4 px-6">
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : recruitments.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-2 text-slate-500">
              <BriefcaseBusiness className="h-8 w-8 text-slate-400" />
              <span className="text-sm">Không tìm thấy vị trí nào.</span>
            </div>
          ) : (
            <DataTable
              data={recruitments}
              columns={columns}
              className="[&_tr:hover]:bg-slate-50/60 transition-colors"
            />
          )}
        </CardContent>

        {!isLoading && recruitments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Hiển thị{" "}
              <span className="font-semibold text-slate-900">
                {recruitments.length}
              </span>{" "}
              / <span className="font-semibold text-slate-900">{total}</span> vị
              trí
            </p>
            <div className="[&_.pagination-btn]:rounded-full">
              <UrlPagination totalPages={totalPages} />
            </div>
          </div>
        )}
      </Card>

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
        <AlertDialogContent className="rounded-2xl sm:rounded-2xl border-slate-200 bg-white shadow-xl shadow-slate-900/10 backdrop-blur-[2px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">
              Xóa vị trí này?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Hành động này sẽ xóa vĩnh viễn{" "}
              <strong className="text-slate-700">
                &ldquo;{pendingDeleteItem?.title}&rdquo;
              </strong>
              . Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors gap-2 border-transparent"
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
