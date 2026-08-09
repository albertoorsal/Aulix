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
import { deleteStudent } from "../features/students/studentSlice";
import type { StudentResponse } from "@/schemas/student";

interface DeleteStudentDialogProps {
  student: StudentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteStudentDialog({
  student,
  open,
  onOpenChange,
}: DeleteStudentDialogProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await dispatch(deleteStudent(student.id));
    setIsDeleting(false);

    if (deleteStudent.fulfilled.match(result)) {
      toast.success("Student deleted successfully");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) || "Failed to delete student");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            This will permanently remove {student.firstName} {student.lastName}
            's student record and account. This action cannot be undone.
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
