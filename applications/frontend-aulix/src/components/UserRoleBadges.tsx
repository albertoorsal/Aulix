import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/schemas/user";

// Roles in a stable order (ADMIN first) rather than the backend's unordered set.
function sortRoles(roles: string[]): string[] {
  const rank = (role: string) => {
    const index = (ROLES as readonly string[]).indexOf(role);
    return index === -1 ? ROLES.length : index;
  };
  return [...roles].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export default function UserRoleBadges({ roles }: { roles: string[] }) {
  if (roles.length === 0) {
    return <span className="text-xs text-muted-foreground">No roles</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {sortRoles(roles).map((role) => (
        <Badge key={role} variant="outline" className="capitalize">
          {role.toLowerCase()}
        </Badge>
      ))}
    </div>
  );
}
