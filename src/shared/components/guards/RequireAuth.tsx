import { useAuthStore } from "@/features/auth/store";
import type { RequireAuthProps, UserRole } from "@/shared/types";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role) as UserRole | null;
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === "Admin") return <Navigate to="/admin" replace />;
    if (role === "Employee") return <Navigate to="/employee" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
