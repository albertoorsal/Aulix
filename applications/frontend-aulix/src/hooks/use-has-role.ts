import { selectRoles } from "@/features/auth/authSlice";
import { useAppSelector } from "@/store/hooks";

// True when the signed-in user has at least one of the given roles (same rule as RoleRoute).
export function useHasAnyRole(allowed: string[]): boolean {
  const roles = useAppSelector(selectRoles);
  return allowed.some((role) => roles.includes(role));
}
