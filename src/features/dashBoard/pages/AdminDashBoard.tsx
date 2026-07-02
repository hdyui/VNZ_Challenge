// src/features/dashboard/pages/AdminDashboardPage.tsx
import { Link } from "react-router-dom";
import {
  Newspaper,
  Users,
  Briefcase,
  CheckCircle2,
  FilePen,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useDashboard } from "../hooks/useDashboard";
import { StatCard } from "../components/StatCard";
import { RecentNewsList } from "../components/RecentNewsList";

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-6 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AdminDashboardPage = () => {
  const { data, isLoading, isFetching, isError, refetch } = useDashboard();

  const stats = data?.stats;
  const recentNews = data?.recentNews ?? [];

  // Lấy ngày hôm nay để hiển thị greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Đây là tổng quan hệ thống hôm nay —{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto text-gray-600 gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isFetching ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      {isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-500">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Tổng bài viết"
                value={stats?.totalNews ?? 0}
                icon={Newspaper}
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
                sub={`${stats?.publishedNews ?? 0} đã xuất bản`}
                subColor="text-blue-400"
              />
              <StatCard
                label="Bài viết nháp"
                value={stats?.draftNews ?? 0}
                icon={FilePen}
                iconBg="bg-amber-50"
                iconColor="text-amber-500"
                sub="Chưa xuất bản"
                subColor="text-amber-400"
              />
              <StatCard
                label="Đã xuất bản"
                value={stats?.publishedNews ?? 0}
                icon={CheckCircle2}
                iconBg="bg-green-50"
                iconColor="text-green-500"
                sub="Bài viết công khai"
                subColor="text-green-400"
              />
              <StatCard
                label="Nhân viên"
                value={stats?.totalEmployees ?? "—"}
                icon={Users}
                iconBg="bg-purple-50"
                iconColor="text-purple-500"
                sub="Chưa có API"
                subColor="text-gray-300"
              />
              <StatCard
                label="Tuyển dụng"
                value={stats?.totalRecruitments ?? "—"}
                icon={Briefcase}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-500"
                sub="Chưa có API"
                subColor="text-gray-300"
              />
              <StatCard
                label="Đang tuyển"
                value={stats?.activeRecruitments ?? "—"}
                icon={TrendingUp}
                iconBg="bg-rose-50"
                iconColor="text-rose-500"
                sub="Chưa có API"
                subColor="text-gray-300"
              />
            </>
          )}
        </div>
      )}

      {/* ── Recent News ─────────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">
            Bài viết mới nhất
          </CardTitle>
          <Link to="/admin/news">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 text-xs"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <ul className="divide-y divide-gray-100 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <div className="w-14 h-10 rounded-md bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="w-16 h-5 bg-gray-100 rounded-full flex-shrink-0" />
                </li>
              ))}
            </ul>
          ) : (
            <RecentNewsList items={recentNews} />
          )}
        </CardContent>
      </Card>

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link to="/admin/news/create">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FilePen className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                Viết bài mới
              </span>
            </div>
          </Link>
          <Link to="/admin/news">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Newspaper className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                Quản lý tin tức
              </span>
            </div>
          </Link>
          <Link to="/admin/accounts">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                Nhân viên
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
