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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { searchRequest as searchStudentsRequest } from "@/apis/students";
import { toErrorPayload } from "@/lib/api-error";
import { useAppDispatch } from "@/store/hooks";
import { fetchParentLinks, linkStudent, updateLink } from "@/features/parents/parentSlice";
import { linkErrorMessage } from "@/features/parents/parentErrors";
import {
  RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  studentName,
  type ParentStudentResponse,
  type Relationship,
} from "@/schemas/parent";
import type { StudentResponse } from "@/schemas/student";

const RESULT_LIMIT = 10;
const DEBOUNCE_MS = 300;

interface LinkStudentDialogProps {
  parentId: string;
  // Edit mode: change the relationship / primary contact of an existing link.
  link?: ParentStudentResponse;
  linkedIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PickedStudent {
  id: string;
  name: string;
}

export default function LinkStudentDialog({
  parentId,
  link,
  linkedIds,
  open,
  onOpenChange,
}: LinkStudentDialogProps) {
  const dispatch = useAppDispatch();
  const isEdit = link !== undefined;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Edit dialogs are mounted per link, so the initial state is the link being edited.
  const [picked, setPicked] = useState<PickedStudent | null>(
    link ? { id: link.studentId, name: studentName(link) } : null,
  );
  const [relationship, setRelationship] = useState<Relationship | "">(link?.relationship ?? "");
  const [primaryContact, setPrimaryContact] = useState(link?.primaryContact ?? false);
  const [submitting, setSubmitting] = useState(false);

  // The "link student" dialog stays mounted, so start blank again whenever it closes.
  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen && !isEdit) {
      setQuery("");
      setPicked(null);
      setRelationship("");
      setPrimaryContact(false);
    }
  }

  useEffect(() => {
    if (!open || isEdit) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const page = await searchStudentsRequest({ search: query.trim(), page: 0, size: RESULT_LIMIT });
        if (!cancelled) setResults(page.content);
      } catch (err) {
        if (!cancelled) setSearchError(toErrorPayload(err, "Could not search students").message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, isEdit, query]);

  async function handleSubmit() {
    if (!picked || !relationship) return;
    setSubmitting(true);
    const args = { parentId, studentId: picked.id, body: { relationship, primaryContact } };
    const result = isEdit ? await dispatch(updateLink(args)) : await dispatch(linkStudent(args));
    setSubmitting(false);

    if (linkStudent.fulfilled.match(result) || updateLink.fulfilled.match(result)) {
      toast.success(isEdit ? "Link updated" : `${picked.name} linked`);
      handleOpenChange(false);
      return;
    }
    toast.error(linkErrorMessage(result.payload, picked.name, isEdit ? "update" : "link"));
    // Our list is stale (someone else linked/unlinked them); resync it.
    const code = result.payload?.code;
    if (code === "RESOURCE_ALREADY_EXISTS" || code === "RESOURCE_NOT_FOUND") {
      dispatch(fetchParentLinks(parentId));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit link" : "Link student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Change how ${picked?.name ?? "this student"} is related to this parent.`
              : "Find the student, then say how this parent is related to them."}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && !picked && (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students by name, email or number..."
                className="pl-8"
                aria-label="Search students"
              />
            </div>

            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto" aria-live="polite">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1 p-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))
              ) : searchError ? (
                <p className="py-6 text-center text-sm text-destructive">{searchError}</p>
              ) : results.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No students match "{query}".
                </p>
              ) : (
                results.map((student) => {
                  const name = `${student.firstName} ${student.lastName}`;
                  const linked = linkedIds.has(student.id);
                  return (
                    <button
                      key={student.id}
                      type="button"
                      disabled={linked}
                      onClick={() => setPicked({ id: student.id, name })}
                      className="flex items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {student.studentNumber} &middot; Grade {student.gradeLevel} &middot;{" "}
                          {student.email}
                        </span>
                      </span>
                      {linked && (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Check className="size-3.5" />
                          Linked
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {picked && (
          <FieldGroup className="py-2">
            {!isEdit && (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <span className="text-sm font-medium">{picked.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
                  Change
                </Button>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="relationship">Relationship</FieldLabel>
              <Select
                value={relationship}
                onValueChange={(value) => setRelationship(value as Relationship)}
              >
                <SelectTrigger id="relationship" className="w-full">
                  <SelectValue placeholder="Choose a relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RELATIONSHIP_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal">
              <input
                id="primaryContact"
                type="checkbox"
                checked={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.checked)}
                className="size-4 accent-primary"
              />
              <FieldContent>
                <FieldLabel htmlFor="primaryContact">Primary contact</FieldLabel>
                <FieldDescription>
                  The school calls this parent first. Replaces any other primary contact for
                  this student.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!picked || !relationship || submitting}>
            {isEdit ? "Save changes" : "Link student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
