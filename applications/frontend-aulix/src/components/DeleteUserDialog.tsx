import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { deleteUser } from "@/features/users/userSlice";
import { userErrorMessage } from "@/features/users/userErrors";
import type { UserResponse } from "@/schemas/user";

interface DeleteUserDialogProps {
  user: UserResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export default function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: DeleteUserDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteUser(user.id));
    setIsDeleting(false);

    if (deleteUser.fulfilled.match(result)) {
      toast.success("User deleted");
      onOpenChange(false);
      onDeleted?.();
    } else {
      toast.error(userErrorMessage(result.payload, "delete"));
    }
  }

  // Student/staff/teacher records point at their login account; deleting only the account
  // would leave them without one, so those should be removed from their own module.
  const linkedRoles = user.roles.filter((r) => r === "STUDENT" || r === "STAFF" || r === "TEACHER");
  const linkedRoleNames = linkedRoles.map((r) => r.toLowerCase()).join(" / ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription>
            This will permanently remove the login account of {user.firstName} {user.lastName} (
            {user.email}). This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {linkedRoles.length > 0 && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            This account has the {linkedRoleNames} role. If it belongs to a {linkedRoleNames}{" "}
            record, delete that record from its own page instead, or disable this account.
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
