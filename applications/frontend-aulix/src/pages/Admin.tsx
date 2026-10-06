import { DashboardLayout, type BreadcrumbEntry } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { History, Users } from "lucide-react";
import { NavLink, Outlet, useLocation, useParams } from "react-router";

const SECTIONS = [
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Audit log", to: "/admin/audit", icon: History },
];

// Layout for every /admin/* page. Reachable only through ProtectedRoute + RoleRoute(ADMIN_ROLES).
export default function Admin() {
  const { pathname } = useLocation();
  const { id } = useParams<{ id: string }>();
  const current = useAppSelector((state) => state.users.current);

  const breadcrumbs: BreadcrumbEntry[] = [{ label: "Admin", href: "/admin/users" }];
  if (pathname.startsWith("/admin/audit")) {
    breadcrumbs.push({ label: "Audit log" });
  } else if (id) {
    const name = current?.id === id ? `${current.firstName} ${current.lastName}` : "Details";
    breadcrumbs.push({ label: "Users", href: "/admin/users" }, { label: name });
  } else {
    breadcrumbs.push({ label: "Users" });
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, their roles, and review what changed.
          </p>
        </div>

        <nav
          aria-label="Admin sections"
          className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
        >
          {SECTIONS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground",
                  isActive && "bg-background text-foreground shadow-sm",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </DashboardLayout>
  );
}
