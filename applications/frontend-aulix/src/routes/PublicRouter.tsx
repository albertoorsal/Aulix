import { Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { useAppSelector } from "../store/hooks";

export default function PublicRoute() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
}