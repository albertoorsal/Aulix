import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { changeUserRole } from "@/features/users/userSlice";
import { userErrorMessage } from "@/features/users/userErrors";
import { ROLE_DESCRIPTIONS, ROLES, type RoleName, type UserResponse } from "@/schemas/user";

interface UserRolesDialogProps {
  user: UserResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export default function UserRolesDialog({
  user,
  open,
  onOpenChange,
  onChanged,
}: UserRolesDialogProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const [pendingRole, setPendingRole] = useState<RoleName | null>(null);

  const isSelf = currentUser?.id === user.id;
  const fullName = `${user.firstName} ${user.lastName}`;

  async function toggleRole(role: RoleName, assign: boolean) {
    setPendingRole(role);
    const result = await dispatch(changeUserRole({ id: user.id, role, assign }));
    setPendingRole(null);

    if (changeUserRole.fulfilled.match(result)) {
      toast.success(
        assign
          ? `${role.toLowerCase()} role assigned to ${fullName}`
          : `${role.toLowerCase()} role removed from ${fullName}`,
      );
      onChanged?.();
    } else {
      toast.error(userErrorMessage(result.payload, assign ? "assign roles to" : "revoke roles from"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>
            Roles control what {fullName} can see and do. Changes apply the next time they sign
            in or their session refreshes.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col divide-y rounded-md border">
          {ROLES.map((role) => {
            const hasRole = user.roles.includes(role);
            // The backend refuses this too; it keeps at least one admin (you) around.
            const locked = isSelf && role === "ADMIN" && hasRole;
            return (
              <li key={role} className="flex items-center justify-between gap-4 p-3">
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium capitalize">{role.toLowerCase()}</span>
                  <span className="text-xs text-muted-foreground">
                    {locked ? "You can't remove your own admin role." : ROLE_DESCRIPTIONS[role]}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={hasRole ? "outline" : "secondary"}
                  disabled={locked || pendingRole !== null}
                  onClick={() => toggleRole(role, !hasRole)}
                  aria-label={`${hasRole ? "Remove" : "Assign"} ${role.toLowerCase()} role`}
                >
                  {pendingRole === role ? "Saving…" : hasRole ? "Remove" : "Assign"}
                </Button>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
