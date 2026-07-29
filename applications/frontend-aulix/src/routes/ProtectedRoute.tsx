import { Navigate, Outlet, useLocation } from "react-router";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { useAppSelector } from "../store/hooks";


export default function ProtectedRoute() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from : location}} />;
    }

    return <Outlet/>;
}