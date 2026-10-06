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
import { setUserEnabled } from "@/features/users/userSlice";
import { userErrorMessage } from "@/features/users/userErrors";
import type { UserResponse } from "@/schemas/user";

interface DisableUserDialogProps {
  user: UserResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisabled?: () => void;
}

export default function DisableUserDialog({
  user,
  open,
  onOpenChange,
  onDisabled,
}: DisableUserDialogProps) {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);

  async function handleDisable() {
    setIsSaving(true);
    const result = await dispatch(setUserEnabled({ id: user.id, enabled: false }));
    setIsSaving(false);

    if (setUserEnabled.fulfilled.match(result)) {
      toast.success(`${user.firstName} ${user.lastName} disabled`);
      onOpenChange(false);
      onDisabled?.();
    } else {
      toast.error(userErrorMessage(result.payload, "disable"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable user</DialogTitle>
          <DialogDescription>
            {user.firstName} {user.lastName} ({user.email}) won't be able to sign in. An open
            session ends when its access token expires, within 30 minutes. You can enable the
            account again at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDisable} disabled={isSaving}>
            Disable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
