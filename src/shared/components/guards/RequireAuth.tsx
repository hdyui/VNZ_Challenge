import { useAuthStore } from "@/features/auth/store";
import type { RequireAuthProps, UserRole } from "@/shared/types";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
  // ⚠️ QUAN TRỌNG: Chỉ check hydration status, KHÔNG check token validity
  // Lý do: Nếu token bị modify (debug), axios interceptor sẽ catch 401 + refresh tự động
  // Không nên block render ở đây vì sẽ không cho axios cơ hội xử lý token

  const isHydrated = (useAuthStore.getState() as any)._hydrated ?? false;
  const role = useAuthStore((state) => state.role) as UserRole | null;
  const location = useLocation();

  // Nếu store chưa hydrate từ localStorage, đợi
  if (!isHydrated) {
    console.log("[RequireAuth] Store chưa hydrate, hiển thị loading...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Sau khi hydrate, chỉ check role nếu có filter
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log("[RequireAuth] Role không được phép:", role, "- redirect");
    if (role === "Admin") return <Navigate to="/admin" replace />;
    if (role === "Employee") return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }

  // ✅ Cho phép render, axios sẽ handle token errors khi call API
  console.log("[RequireAuth] Passed, rendering protected routes");
  return <Outlet />;
};

export default RequireAuth;
