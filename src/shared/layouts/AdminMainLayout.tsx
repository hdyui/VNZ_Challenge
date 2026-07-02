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
} from "lucide-react";
import { useLogoutMutation, useUser } from "@/features/auth/hooks/useAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  {
    to: "/admin/accounts",
    label: "Employee Accounts",
    icon: Users,
    end: false,
  },
  {
    to: "/admin/departments", // <-- Thêm menu Departments vào đây
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
];

const AdminMainLayout = () => {
  const token = useAuthStore((state) => !!state.accessToken);
  const useHandleLogout = useLogoutMutation();

  // GỌI API GET ME Ở ĐÂY
  //const [error, setError] = useState<string | null>(null);
  const {
    data: user,
    isLoading, // true = lần đầu fetch, chưa có data, true khi đang fetch
    isError, // true = fetch bị lõi
    error, // trả về OB nếu có lỗi
    refetch, // Func để re-fetch
    isFetching, // true = đang fetch ( dù có hay không data )
  } = useUser();
  console.log(user);
  const handleLogout = async () => {
    useHandleLogout.mutate();
  };

  // Hàm render Avatar (Có ảnh thì hiện ảnh, không thì lấy chữ cái đầu)
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
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b">
          <NavLink to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
              V
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-slate-800">
              VNZ Company
            </span>
          </NavLink>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                to={item.to}
                key={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 ${
                    isActive ? "bg-primary/10 font-medium text-primary" : ""
                  }`
                }
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-r">
          {token ? (
            <div className="flex items-center justify-between">
              <Link
                to="/admin/profile"
                className="flex items-center gap-3 hover:bg-slate-100 p-2 -ml-2 rounded-lg transition-colors cursor-pointer w-full overflow-hidden"
              >
                <div className="w-9 h-9 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {isLoading ? "..." : renderAvatar()}
                </div>
                <div className="flex flex-col w-full overflow-hidden pr-2">
                  <div
                    className="text-sm font-medium truncate"
                    title={fullName}
                  >
                    {isLoading ? "Loading..." : fullName || "Admin"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.user?.position || user?.role}
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <NavLink to="/login">
              <Button className="w-full">Login</Button>
            </NavLink>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center px-4 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-2 gap-2 w-1/3">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                placeholder="Search employees, news..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Button variant="ghost" className="p-2">
                <Bell className="w-5 h-5" />
              </Button>

              {/* THÔNG TIN USER GÓC TRÊN TOPBAR */}
              {token ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-sm text-gray-800 font-medium">
                    {isLoading ? "Loading..." : fullName || "Admin"}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <NavLink to="/login">
                  <Button variant="ghost">Login</Button>
                </NavLink>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t p-4 text-sm text-center text-gray-500">
          <div className="justify-center flex items-center gap-2 text-[13px] text-slate-400">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
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
