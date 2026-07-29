import { selectUser } from "../features/auth/authSlice"
import { useAppSelector } from "../store/hooks"

export function Dashboard() {
    const user = useAppSelector(selectUser);

    return (
        <div>
            <p>Welcome back <b>{user?.email}</b></p>
            <p>Roles: <b>{user?.roles.join(", ") || "none"}</b></p>
            <p>Session expires: <b>{user?.expiresAt}</b></p>
        </div>
    );
}