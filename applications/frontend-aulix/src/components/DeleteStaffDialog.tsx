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
import { deleteStaff } from "../features/staffs/staffSlice";
import type { StaffResponse } from "@/schemas/staff";

interface DeleteStaffDialogProps {
  staff: StaffResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteStaffDialog({
  staff,
  open,
  onOpenChange,
}: DeleteStaffDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteStaff(staff.id));
    setIsDeleting(false);

    if (deleteStaff.fulfilled.match(result)) {
      toast.success("Staff deleted successfully");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) || "Failed to delete staff");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Staff</DialogTitle>
          <DialogDescription>
            This will permanently remove {staff.firstName} {staff.lastName}
            's staff record and account. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
