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
import { deleteTeacher } from "../features/teachers/teacherSlice";
import type { TeacherResponse } from "@/schemas/teacher";

interface DeleteTeacherDialogProps {
  teacher: TeacherResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteTeacherDialog({
  teacher,
  open,
  onOpenChange,
}: DeleteTeacherDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteTeacher(teacher.id));
    setIsDeleting(false);

    if (deleteTeacher.fulfilled.match(result)) {
      toast.success("Teacher deleted successfully");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) || "Failed to delete teacher");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>
            This will permanently remove {teacher.firstName} {teacher.lastName}
            's teacher record and account. This action cannot be undone.
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
