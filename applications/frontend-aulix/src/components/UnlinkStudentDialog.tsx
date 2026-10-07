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
import { fetchParentLinks, unlinkStudent } from "@/features/parents/parentSlice";
import { linkErrorMessage } from "@/features/parents/parentErrors";
import { studentName, type ParentStudentResponse } from "@/schemas/parent";

interface UnlinkStudentDialogProps {
  link: ParentStudentResponse;
  parentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UnlinkStudentDialog({
  link,
  parentName,
  open,
  onOpenChange,
}: UnlinkStudentDialogProps) {
  const dispatch = useAppDispatch();
  const [isUnlinking, setIsUnlinking] = useState(false);
  const name = studentName(link);

  async function handleUnlink() {
    setIsUnlinking(true);
    const result = await dispatch(
      unlinkStudent({ parentId: link.parentId, studentId: link.studentId }),
    );
    setIsUnlinking(false);

    if (unlinkStudent.fulfilled.match(result)) {
      toast.success(`${name} unlinked`);
      onOpenChange(false);
      return;
    }
    toast.error(linkErrorMessage(result.payload, name, "unlink"));
    if (result.payload?.code === "RESOURCE_NOT_FOUND") {
      dispatch(fetchParentLinks(link.parentId));
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlink student</DialogTitle>
          <DialogDescription>
            {parentName} will no longer see {name} in their portal. The student record is not
            affected, and you can link them again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isUnlinking}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleUnlink} disabled={isUnlinking}>
            Unlink
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
