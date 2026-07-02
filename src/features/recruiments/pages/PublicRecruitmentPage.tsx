import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePublicRecruitmentList } from "../hooks/useRecruitment";
import type { PublicRecruitmentQueryParams, RecruitmentLevel } from "../type";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  BriefcaseBusiness,
  Building2,
  Search,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  X,
} from "lucide-react";
import { format } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 9;

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
  Fresher: "bg-green-50 text-green-700 border-green-200",
  Junior: "bg-blue-50 text-blue-700 border-blue-200",
  Middle: "bg-violet-50 text-violet-700 border-violet-200",
  Senior: "bg-amber-50 text-amber-700 border-amber-200",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

const RecruitmentCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
    <div className="flex items-start justify-between gap-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-9 w-28 rounded-lg" />
  </div>
);

// ─── Recruitment card ─────────────────────────────────────────────────────────

interface RecruitmentCardProps {
  title: string;
  departmentName: string;
  level: RecruitmentLevel;
  createdAt: string;
  onClick: () => void;
}

const RecruitmentCard = ({
  title,
  departmentName,
  level,
  createdAt,
  onClick,
}: RecruitmentCardProps) => (
  <article
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg space-y-4"
  >
    {/* Accent bar */}
    <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

    {/* Title + level badge */}
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-2">
        {title}
      </h2>
      <span
        className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOR[level]}`}
      >
        {level}
      </span>
    </div>

    {/* Meta */}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
      <span className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-gray-400" />
        {departmentName}
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
        {format(new Date(createdAt), "dd/MM/yyyy")}
      </span>
    </div>

    {/* CTA */}
    <div className="pt-1">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
        Xem chi tiết
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  </article>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseLevel = (value: string | null): RecruitmentLevel | "all" => {
  const valid = LEVEL_OPTIONS.map((o) => o.value);
  return (valid as string[]).includes(value ?? "")
    ? (value as RecruitmentLevel | "all")
    : "all";
};

const parsePage = (value: string | null): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const PublicRecruitmentPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State derived from URL (source of truth) ────────────────────────────────
  const page = parsePage(searchParams.get("page"));
  const level = parseLevel(searchParams.get("level"));
  const search = searchParams.get("search") ?? "";

  const params: PublicRecruitmentQueryParams = {
    page,
    limit: DEFAULT_LIMIT,
    search,
    level,
  };

  const { data, isLoading } = usePublicRecruitmentList(params);

  const recruitments = data?.value?.items ?? [];
  const total = data?.value?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_LIMIT));

  // ── Search input with live debounce, synced back to the URL ────────────────
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput.trim(), 400);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Keep input in sync if user navigates back/forward with browser buttons
    setSearchInput(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleLevelChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "all") next.delete("level");
      else next.set("level", value);
      next.set("page", "1");
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasActiveFilters = !!search || level !== "all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-white">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Chúng tôi đang tuyển dụng!
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Gia nhập đội ngũ của chúng tôi
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-500 leading-relaxed">
            Khám phá các vị trí đang mở ở tất cả phòng ban. Tìm vai trò phù hợp
            với kỹ năng của bạn và cùng chúng tôi phát triển.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên vị trí..."
                className="h-11 pl-9 pr-9 border-gray-200 rounded-xl focus-visible:ring-indigo-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        {/* Filters + count row */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <>
                <span className="font-semibold text-gray-900">{total}</span> vị
                trí đang mở
                {hasActiveFilters && (
                  <span className="text-gray-400"> phù hợp với bộ lọc</span>
                )}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400 shrink-0" />
              <Select value={level} onValueChange={handleLevelChange}>
                <SelectTrigger className="w-40 border-gray-200 rounded-xl">
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

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1.5 text-gray-500 hover:text-gray-800"
              >
                <X className="h-3.5 w-3.5" />
                Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecruitmentCardSkeleton key={i} />
            ))}
          </div>
        ) : recruitments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-24 space-y-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
              <BriefcaseBusiness className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-700">
              Không tìm thấy vị trí nào
            </p>
            <p className="text-sm text-gray-400">
              Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-gray-200"
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recruitments.map((item) => (
              <RecruitmentCard
                key={item.id}
                title={item.title}
                departmentName={item.department.name}
                level={item.level}
                createdAt={item.createdAt}
                onClick={() => navigate(`/recruitments/${item.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination — always visible */}
        {!isLoading && (
          <div className="flex items-center justify-center space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="border-gray-200 rounded-xl"
            >
              Trước
            </Button>

            <span className="text-sm font-medium px-4">
              Trang {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="border-gray-200 rounded-xl"
            >
              Sau
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicRecruitmentPage;
