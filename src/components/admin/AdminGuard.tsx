import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

const AdminGuard = () => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminGuard;
