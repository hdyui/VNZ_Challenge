// src/shared/layouts/MainLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { LayoutDashboard, LogOut, Menu, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";

const NAV_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/about", label: "Giới thiệu" },
  { to: "/news", label: "Tin tức" },
  { to: "/recruitments", label: "Tuyển dụng" },
];

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
      V
    </div>
    <span className="font-semibold text-[15px] tracking-tight text-slate-800">
      VNZ Company
    </span>
  </Link>
);

const MainLayout = () => {
  const { pathname } = useLocation();

  const isAuthed = useAuthStore((state) => !!state.accessToken);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const getAuthButtonProps = () => {
    if (!isAuthed) {
      return {
        to: "/login",
        label: "Đăng nhập",
        icon: <UserCircle className="w-4 h-4 mr-2" />,
      };
    }

    if (role === "Admin") {
      return {
        to: "/admin",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
      };
    }

    // ─── THÊM NHÁNH CHO APPLICANT Ở ĐÂY ───
    if (role === "Applicant") {
      return {
        to: "/applicant/applications",
        label: "Hồ sơ của tôi",
        icon: <UserCircle className="w-4 h-4 mr-2" />,
      };
    }

    // Mặc định cho Employee
    return {
      to: "/employee",
      label: "Hồ sơ của tôi", // Hoặc Đổi thành "Trang nhân viên" tùy bác
      icon: <UserCircle className="w-4 h-4 mr-2" />,
    };
  };

  const authBtn = getAuthButtonProps();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Logo />

          {/* Desktop Nav */}
          <NavigationMenu className="hidden sm:flex flex-1 justify-center">
            <NavigationMenuList className="gap-1">
              {NAV_LINKS.map((link) => (
                <NavigationMenuItem key={link.to}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={link.to}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-sm bg-transparent",
                        pathname === link.to
                          ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50"
                          : "text-slate-500 hover:text-slate-800",
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop login / Dashboard button */}
            <Button asChild variant="default" size="sm">
              <Link to={authBtn.to}>
                {authBtn.icon} {authBtn.label}
              </Link>
            </Button>

            {/* --- NÚT ĐĂNG XUẤT (Desktop) --- */}
            {isAuthed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Đăng xuất</span>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 pt-8">
                <SheetHeader className="mb-6">
                  <SheetTitle asChild>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "text-sm px-3 py-2 rounded-md transition-colors",
                        pathname === link.to
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Separator className="my-4" />

                {/* Mobile login / Dashboard button */}
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link to={authBtn.to}>
                    {authBtn.icon} {authBtn.label}
                  </Link>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              V
            </div>
            <span>© 2026 VNZ Company. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
