import { Navigate, Outlet } from "react-router-dom";
import { selectRoles } from "../features/auth/authSlice";
import { useAppSelector } from "../store/hooks";

interface RoleRouteProps {
  allow: string[]; // roles permitted, e.g. ["ADMIN"] or ["ADMIN", "MANAGER"]
}

// The user's roles come from /api/auth/verify (e.g. ["ADMIN"]). Access is
// granted if the user has at least one of the allowed roles.
export default function RoleRoute({ allow }: RoleRouteProps) {
    const roles = useAppSelector(selectRoles);
    const permitted = allow.some((role) => roles.includes(role));
    if (!permitted) return <Navigate to="/unauthorized" replace />;
    return <Outlet />;
}