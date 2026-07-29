// A role-restricted page. Reachable only through ProtectedRoute + RoleRoute(["ADMIN"]).
export default function Admin() {
    return (
        <div className="container">
            <h2>Admin Panel</h2>
        </div>
    );
}