import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/shared/components/ui/button";
import {
  Home,
  Users,
  Newspaper,
  Briefcase,
  Building2,
  Bell,
  LogOut,
  Menu,
  Search,
  User,
  Clock,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import { useLogoutMutation, useUser } from "@/features/auth/hooks/useAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/accounts", label: "Accounts", icon: Users, end: false },
  {
    to: "/admin/departments",
    label: "Departments",
    icon: Building2,
    end: false,
  },
  { to: "/admin/news", label: "News", icon: Newspaper, end: false },
  {
    to: "/admin/recruitments",
    label: "Recruiting",
    icon: Briefcase,
    end: false,
  },
  {
    to: "/admin/shifts",
    label: "Shifts",
    icon: Clock,
    end: false,
  },
  {
    to: "/admin/schedules",
    label: "Work Schedules",
    icon: CalendarClock,
    end: false,
  },
];

const AdminMainLayout = () => {
  const token = useAuthStore((state) => !!state.accessToken);
  const useHandleLogout = useLogoutMutation();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUser();
  // console.log(user);
  const handleLogout = async () => {
    useHandleLogout.mutate();
  };

  const renderAvatar = () => {
    if (user?.user?.avatarImg) {
      return (
        <img
          src={user.user.avatarImg}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    return user?.user?.firstName?.charAt(0) || "U";
  };

  const fullName =
    `${user?.user?.lastName || ""} ${user?.user?.firstName || ""}`.trim();

  return (
    <div className="min-h-screen flex bg-gray-50/50 text-gray-900 font-sans">
      {/* ── Sidebar (Tối giản & Sang trọng) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-20 flex items-center px-6 border-b border-gray-50/80">
          <NavLink to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white text-sm font-black shadow-md group-hover:scale-105 transition-transform duration-300">
              V
            </div>
            <span className="font-extrabold text-[16px] tracking-tight text-gray-900">
              VNZ Company
            </span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                to={item.to}
                key={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out font-medium text-[14px] ${
                    isActive
                      ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md shadow-gray-900/10"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                  }`
                }
              >
                <Icon
                  className={`w-5 h-5 ${/* Ẩn bớt độ đậm của icon nếu không active */ ""}`}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Thông tin User cuối Sidebar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          {token ? (
            <div className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <Link
                to="/admin/profile"
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-colors cursor-pointer w-full overflow-hidden"
              >
                <div className="w-9 h-9 bg-gradient-to-tr from-gray-200 to-gray-100 text-gray-700 font-bold rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {isLoading ? "..." : renderAvatar()}
                </div>
                <div className="flex flex-col w-full overflow-hidden pr-1">
                  <div
                    className="text-sm font-bold text-gray-800 truncate"
                    title={fullName}
                  >
                    {isLoading ? "Loading..." : fullName || "Admin"}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium truncate uppercase tracking-wider mt-0.5">
                    {user?.user?.position || user?.role}
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 rounded-xl mr-1"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <NavLink to="/login">
              <Button className="w-full bg-gray-900 text-white hover:bg-black rounded-xl">
                Login
              </Button>
            </NavLink>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Topbar ── */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" className="p-2 rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/">
              <Button variant="ghost" className="p-2" title="Về trang chủ">
                <ExternalLink className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 gap-3 w-1/3 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-300 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                placeholder="Tìm kiếm nhân viên, tin tức..."
                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Link to="/">
                <Button
                  variant="outline"
                  className="hidden sm:flex items-center gap-2 text-gray-600"
                >
                  <ExternalLink className="w-4 h-4" />
                  Về trang chủ
                </Button>
              </Link>

              <Button variant="ghost" className="p-2">
                <Bell className="w-5 h-5" />
              </Button>

              {token ? (
                <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                  <div className="hidden sm:block text-sm text-gray-800 font-bold">
                    {isLoading ? "..." : fullName || "Admin"}
                  </div>
                </div>
              ) : (
                <NavLink to="/login">
                  <Button
                    variant="outline"
                    className="rounded-xl font-medium border-gray-200 hover:bg-gray-50"
                  >
                    Login
                  </Button>
                </NavLink>
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="bg-transparent py-4 text-center">
          <div className="justify-center flex items-center gap-2 text-[12px] font-medium text-gray-400">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-gray-500 to-gray-400 flex items-center justify-center text-white text-[9px] font-bold">
              V
            </div>
            <span>© 2026 VNZ Company. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminMainLayout;
