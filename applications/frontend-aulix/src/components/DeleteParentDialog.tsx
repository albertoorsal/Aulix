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
import { deleteParent } from "@/features/parents/parentSlice";
import { parentErrorMessage } from "@/features/parents/parentErrors";
import { parentName, type ParentResponse } from "@/schemas/parent";

interface DeleteParentDialogProps {
  parent: ParentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export default function DeleteParentDialog({
  parent,
  open,
  onOpenChange,
  onDeleted,
}: DeleteParentDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteParent(parent.id));
    setIsDeleting(false);

    if (deleteParent.fulfilled.match(result)) {
      toast.success("Parent deleted");
      onOpenChange(false);
      onDeleted?.();
    } else {
      toast.error(parentErrorMessage(result.payload, "delete"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete parent</DialogTitle>
          <DialogDescription>
            This will permanently remove {parentName(parent)}, their sign-in account and their
            links to {parent.childCount === 1 ? "1 student" : `${parent.childCount} students`}.
            The student records themselves are not affected. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
