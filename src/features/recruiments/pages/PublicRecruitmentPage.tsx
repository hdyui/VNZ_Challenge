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
  Sparkles,
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
  Fresher: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Junior: "bg-sky-50 text-sky-700 border-sky-200",
  Middle: "bg-violet-50 text-violet-700 border-violet-200",
  Senior:
    "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

const RecruitmentCardSkeleton = () => (
  <div className="rounded-3xl border border-slate-100/80 bg-white/70 backdrop-blur-sm p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
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
    className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-100/80 bg-white/80 backdrop-blur-sm p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F6B66]/25 hover:shadow-[0_20px_45px_-15px_rgba(15,107,102,0.35)] space-y-4"
  >
    {/* Signature accent bar: teal */}
    <span className="absolute inset-x-0 top-0 h-[3px] bg-[#0F6B66] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    {/* Ambient glow */}
    <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#0F6B66]/0 blur-2xl transition-colors duration-300 group-hover:bg-[#0F6B66]/10" />

    {/* Title + level badge */}
    <div className="relative flex items-start justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-900 group-hover:text-[#0F6B66] transition-colors leading-snug line-clamp-2">
        {title}
      </h2>
      <span
        className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_COLOR[level]}`}
      >
        {level}
      </span>
    </div>

    {/* Meta */}
    <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
      <span className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-slate-400" />
        {departmentName}
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
        {format(new Date(createdAt), "dd/MM/yyyy")}
      </span>
    </div>

    {/* CTA */}
    <div className="relative pt-1">
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6B66]/10 px-4 py-2 text-sm font-medium text-[#0F6B66] transition-all duration-300 group-hover:bg-[#0F6B66] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#0F6B66]/25">
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
    pageIndex: page,
    pageSize: DEFAULT_LIMIT,
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0F6B66]/5 via-white to-white">
      {/* Ambient decorative mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#0F6B66]/10 blur-3xl" />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-slate-300/15 blur-3xl" />
        <div className="absolute top-40 left-0 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F6B66]/20 bg-[#0F6B66]/5 px-4 py-1.5 text-xs font-medium text-[#0F6B66] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Chúng tôi đang tuyển dụng!
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0F6B66] to-[#0B4F4B] sm:text-5xl">
            Gia nhập đội ngũ của chúng tôi
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-500 leading-relaxed">
            Khám phá các vị trí đang mở ở tất cả phòng ban. Tìm vai trò phù hợp
            với kỹ năng của bạn và cùng chúng tôi phát triển.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên vị trí..."
                className="h-12 pl-9 pr-9 border-slate-200 rounded-xl bg-white/90 shadow-sm focus-visible:ring-[#0F6B66]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
      <main className="relative mx-auto max-w-5xl px-4 py-10 space-y-8">
        {/* Filters + count row */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-white/80 backdrop-blur-sm p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {isLoading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <>
                <span className="font-semibold text-slate-900">{total}</span> vị
                trí đang mở
                {hasActiveFilters && (
                  <span className="text-slate-400"> phù hợp với bộ lọc</span>
                )}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400 shrink-0" />
              <Select value={level} onValueChange={handleLevelChange}>
                <SelectTrigger className="w-40 border-slate-200 rounded-xl bg-white">
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
                className="gap-1.5 text-slate-500 hover:text-slate-800"
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm py-24 space-y-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F6B66]/10">
              <BriefcaseBusiness className="h-6 w-6 text-[#0F6B66]/40" />
            </div>
            <p className="text-base font-medium text-slate-700">
              Không tìm thấy vị trí nào
            </p>
            <p className="text-sm text-slate-400">
              Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-slate-200"
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
              className="border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm hover:border-[#0F6B66]/30 hover:text-[#0F6B66]"
            >
              Trước
            </Button>

            <span className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              Trang {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm hover:border-[#0F6B66]/30 hover:text-[#0F6B66]"
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
