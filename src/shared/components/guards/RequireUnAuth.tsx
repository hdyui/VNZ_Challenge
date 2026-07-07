import { useAuthStore } from "@/features/auth/store";
import type { UserRole } from "@/shared/types";
import { Navigate, Outlet } from "react-router-dom";

const RequireUnAuth = () => {
  const isAuthed = useAuthStore((state) => !!state.accessToken);
  const role = useAuthStore((state) => state.role) as UserRole | null;

  if (isAuthed) {
    if (role === "Admin") return <Navigate to="/admin" replace />;
    if (role === "Employee") return <Navigate to="/employee" replace />;
    if (role === "Applicant")
      return <Navigate to="/applicant/applications" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireUnAuth;
