import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { searchRequest as searchTeachersRequest } from "@/apis/teachers";
import { searchRequest as searchStudentsRequest } from "@/apis/students";
import { toErrorPayload } from "@/lib/api-error";
import type { MemberKind, SubjectMember } from "@/schemas/subject";

const RESULT_LIMIT = 10;
const DEBOUNCE_MS = 300;

interface PersonPickerDialogProps {
  kind: MemberKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedIds: Set<string>;
  // A successful pick shows up here through assignedIds, which flips the row to "Added".
  onPick: (member: SubjectMember) => Promise<void>;
}

async function searchPeople(kind: MemberKind, search: string): Promise<SubjectMember[]> {
  if (kind === "teacher") {
    const page = await searchTeachersRequest({ search, page: 0, size: RESULT_LIMIT });
    return page.content.map((t) => ({
      personId: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      number: t.employeeNumber,
      resolved: true,
    }));
  }
  const page = await searchStudentsRequest({ search, page: 0, size: RESULT_LIMIT });
  return page.content.map((s) => ({
    personId: s.id,
    name: `${s.firstName} ${s.lastName}`,
    email: s.email,
    number: s.studentNumber,
    resolved: true,
  }));
}

export default function PersonPickerDialog({
  kind,
  open,
  onOpenChange,
  assignedIds,
  onPick,
}: PersonPickerDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const label = kind === "teacher" ? "teacher" : "student";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const people = await searchPeople(kind, query.trim());
        if (!cancelled) setResults(people);
      } catch (err) {
        if (!cancelled) setError(toErrorPayload(err, `Could not search ${label}s`).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, kind, query, label]);

  async function handlePick(member: SubjectMember) {
    setPendingId(member.personId);
    await onPick(member);
    setPendingId(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{kind === "teacher" ? "Assign teacher" : "Enroll student"}</DialogTitle>
          <DialogDescription>
            Search by name, email or number. You can add several without closing this dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label}s...`}
            className="pl-8"
            aria-label={`Search ${label}s`}
          />
        </div>

        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto" aria-live="polite">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">{error}</p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No {label}s match "{query}".
            </p>
          ) : (
            results.map((person) => {
              const assigned = assignedIds.has(person.personId);
              const pending = pendingId === person.personId;
              return (
                <div
                  key={person.personId}
                  className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-accent/50"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{person.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {person.number} &middot; {person.email}
                    </span>
                  </div>
                  {assigned ? (
                    <span className="flex shrink-0 items-center gap-1 px-2 text-xs text-muted-foreground">
                      <Check className="size-3.5" />
                      Added
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={pendingId !== null}
                      onClick={() => handlePick(person)}
                    >
                      {pending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Add
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
