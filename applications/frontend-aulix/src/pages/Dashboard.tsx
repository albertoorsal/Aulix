import { useNavigate } from "react-router-dom";
import { logout, selectUser } from "../features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "../store/hooks"

export function Dashboard() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const navigate = useNavigate()

    async function handleLogout() {
        const result = await dispatch(logout());
        if (logout.fulfilled.match(result)) {
            navigate("/login", { replace: true })
        }
    }

    return (
        <div>
            <p>Welcome back <b>{user?.email}</b></p>
            <p>Roles: <b>{user?.roles.join(", ") || "none"}</b></p>
            <p>Session expires: <b>{user?.expiresAt}</b></p>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}