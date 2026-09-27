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
import { deleteSubject } from "@/features/subjects/subjectSlice";
import { subjectErrorMessage } from "@/features/subjects/subjectErrors";
import type { SubjectResponse } from "@/schemas/subject";

interface DeleteSubjectDialogProps {
  subject: SubjectResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export default function DeleteSubjectDialog({
  subject,
  open,
  onOpenChange,
  onDeleted,
}: DeleteSubjectDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteSubject(subject.id));
    setIsDeleting(false);

    if (deleteSubject.fulfilled.match(result)) {
      toast.success("Subject deleted");
      onOpenChange(false);
      onDeleted?.();
    } else {
      toast.error(subjectErrorMessage(result.payload, "delete"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete subject</DialogTitle>
          <DialogDescription>
            This will permanently remove {subject.code} ({subject.name}). Subjects with assigned
            teachers or enrolled students can't be deleted. Consider archiving it instead. This
            action cannot be undone.
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
