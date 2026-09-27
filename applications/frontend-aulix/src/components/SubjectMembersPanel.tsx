import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Loader2, Plus, RotateCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSubjectMember,
  fetchSubjectMembers,
  removeSubjectMember,
} from "@/features/subjects/subjectSlice";
import { memberErrorMessage } from "@/features/subjects/subjectErrors";
import PersonPickerDialog from "@/components/PersonPickerDialog";
import type { MemberKind, SubjectMember } from "@/schemas/subject";

interface SubjectMembersPanelProps {
  subjectId: string;
  kind: MemberKind;
  canEdit: boolean;
}

export default function SubjectMembersPanel({ subjectId, kind, canEdit }: SubjectMembersPanelProps) {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) =>
    kind === "teacher" ? state.subjects.teachers : state.subjects.students,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const assignedIds = useMemo(
    () => new Set(members.items.map((m) => m.personId)),
    [members.items],
  );

  const plural = kind === "teacher" ? "teachers" : "students";
  const isLoading = members.status === "loading" && members.items.length === 0;

  async function handleAdd(member: SubjectMember) {
    const result = await dispatch(addSubjectMember({ subjectId, kind, member }));
    if (addSubjectMember.fulfilled.match(result)) {
      toast.success(
        kind === "teacher" ? `${member.name} assigned` : `${member.name} enrolled`,
      );
      return;
    }
    toast.error(memberErrorMessage(result.payload, kind, member.name, "add"));
    // A duplicate means our list is stale (someone else added them); resync it.
    if (result.payload?.code === "RESOURCE_ALREADY_EXISTS") {
      dispatch(fetchSubjectMembers({ subjectId, kind }));
    }
  }

  async function handleRemove(member: SubjectMember) {
    setRemovingId(member.personId);
    const result = await dispatch(
      removeSubjectMember({ subjectId, kind, personId: member.personId }),
    );
    setRemovingId(null);
    if (removeSubjectMember.fulfilled.match(result)) {
      toast.success(`${member.name} removed`);
      return;
    }
    toast.error(memberErrorMessage(result.payload, kind, member.name, "remove"));
    if (result.payload?.code === "RESOURCE_NOT_FOUND") {
      dispatch(fetchSubjectMembers({ subjectId, kind }));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {members.status === "loading" && members.items.length === 0
            ? `Loading ${plural}...`
            : `${members.items.length} ${members.items.length === 1 ? kind : plural}`}
        </p>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" />
            {kind === "teacher" ? "Assign teacher" : "Enroll student"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[2fr_1fr_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
        <span>Name</span>
        <span>#Number</span>
        <span className="text-right">{canEdit ? "Actions" : ""}</span>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto] items-center gap-4">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </div>
        ))
      ) : members.status === "failed" ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-center text-sm text-destructive">{members.error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchSubjectMembers({ subjectId, kind }))}
          >
            <RotateCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : members.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {kind === "teacher"
            ? "No teachers assigned to this subject yet."
            : "No students enrolled in this subject yet."}
        </p>
      ) : (
        members.items.map((member) => (
          <div
            key={member.personId}
            className="grid grid-cols-[2fr_1fr_auto] items-center gap-4"
          >
            <div className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {!member.resolved && (
                  <AlertTriangle
                    className="size-3.5 text-amber-500"
                    aria-label="Record unavailable"
                  />
                )}
                {member.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {member.resolved
                  ? member.email
                  : "This record could not be loaded (it may have been deleted)."}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{member.number ?? "—"}</span>
            <div className="flex justify-end">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(member)}
                  disabled={removingId !== null}
                  aria-label={`Remove ${member.name}`}
                  title={`Remove ${member.name}`}
                >
                  {removingId === member.personId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))
      )}

      {canEdit && (
        <PersonPickerDialog
          kind={kind}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          assignedIds={assignedIds}
          onPick={handleAdd}
        />
      )}
    </div>
  );
}
