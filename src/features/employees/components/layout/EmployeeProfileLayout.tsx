import { Outlet, Link } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useLogoutMutation } from "@/features/auth/hooks/useAuth";

const EmployeeLayout = () => {
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/employee/profile"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <UserCircle className="w-6 h-6" />
            <span>Khu vực nhân viên</span>
          </Link>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => logout()}
            disabled={isPending}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </span>
          </Button>
        </div>
      </header>

      {/* Nội dung trang con */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
