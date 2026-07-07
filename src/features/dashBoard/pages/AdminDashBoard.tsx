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
  Home,
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

// ─── Skeleton card (Tối giản hóa) ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-5 bg-slate-100 rounded w-1/3" />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AdminDashboardPage = () => {
  const { data, isLoading, isFetching, isError, refetch } = useDashboard();

  const stats = data?.stats;
  const recentNews = data?.recentNews ?? [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Chào buổi sáng"
      : hour < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Tổng quan hệ thống —{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-black transition-all shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Về Public</span>
            </Button>
          </Link> */}
          <Button
            variant="default"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 bg-slate-900 hover:bg-black text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isFetching ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>
      </div>

      {/* ── Stat Cards (Phong cách Đơn sắc - Monochrome) ─────────────────────── */}
      {isError ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600 font-medium shadow-sm">
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Tổng bài viết"
                value={stats?.totalNews ?? 0}
                icon={Newspaper}
                iconBg="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100"
                iconColor="text-gray-700"
                sub={`${stats?.publishedNews ?? 0} đã xuất bản`}
                subColor="text-gray-400"
              />
              <StatCard
                label="Bài viết nháp"
                value={stats?.draftNews ?? 0}
                icon={FilePen}
                iconBg="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100"
                iconColor="text-gray-700"
                sub="Chưa xuất bản"
                subColor="text-gray-400"
              />
              <StatCard
                label="Đã xuất bản"
                value={stats?.publishedNews ?? 0}
                icon={CheckCircle2}
                iconBg="bg-gradient-to-br from-gray-900 to-gray-700 shadow-sm"
                iconColor="text-white" // Tạo điểm nhấn nhẹ nhàng bằng màu đối lập
                sub="Bài viết công khai"
                subColor="text-gray-500"
              />
              <StatCard
                label="Nhân sự"
                value={stats?.totalEmployees ?? "0"}
                icon={Users}
                iconBg="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100"
                iconColor="text-gray-700"
                sub="Tổng nhân viên"
                subColor="text-gray-400"
              />
              <StatCard
                label="Tin tuyển dụng"
                value={stats?.totalRecruitments ?? "0"}
                icon={Briefcase}
                iconBg="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100"
                iconColor="text-gray-700"
                sub="Tổng chiến dịch"
                subColor="text-gray-400"
              />
              <StatCard
                label="Đang tuyển"
                value={stats?.activeRecruitments ?? "0"}
                icon={TrendingUp}
                iconBg="bg-gradient-to-br from-gray-900 to-gray-700 shadow-sm"
                iconColor="text-white" // Điểm nhấn
                sub="Đang mở"
                subColor="text-gray-500"
              />
            </>
          )}
        </div>
      )}

      {/* ── Thao tác nhanh (Hiệu ứng Nhảy & Gradient) ───────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/admin/news/create" className="block outline-none group">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center group-hover:from-black group-hover:to-gray-800 transition-colors shadow-md">
                <FilePen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base font-bold text-gray-800 group-hover:text-black transition-colors">
                  Viết bài mới
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Tạo tin tức nội bộ
                </span>
              </div>
            </div>
          </Link>

          <Link to="/admin/news" className="block outline-none group">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center group-hover:from-black group-hover:to-gray-800 transition-colors shadow-md">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base font-bold text-gray-800 group-hover:text-black transition-colors">
                  Quản lý tin tức
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Chỉnh sửa & xuất bản
                </span>
              </div>
            </div>
          </Link>

          <Link to="/admin/accounts" className="block outline-none group">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center group-hover:from-black group-hover:to-gray-800 transition-colors shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base font-bold text-gray-800 group-hover:text-black transition-colors">
                  Nhân sự
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Quản lý tài khoản
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Recent News (Thiết kế lại card) ─────────────────────────────────── */}
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-800">
            Bài viết mới nhất
          </CardTitle>
          <Link to="/admin/news">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-black hover:bg-gray-100 gap-1 text-xs font-medium transition-colors"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 pt-2 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-2xl"
                >
                  {/* Cục xám thay cho Ảnh */}
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    {/* Cục xám thay cho Tiêu đề */}
                    <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                    {/* Cục xám thay cho Ngày tháng */}
                    <div className="h-3 bg-gray-100 rounded-md w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RecentNewsList items={recentNews} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
