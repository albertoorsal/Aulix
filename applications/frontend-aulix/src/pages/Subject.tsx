import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { searchSubjects } from "@/features/subjects/subjectSlice";
import SubjectFormDialog from "@/components/SubjectFormDialog";
import DeleteSubjectDialog from "@/components/DeleteSubjectDialog";
import SubjectStatusBadge from "@/components/SubjectStatusBadge";
import { useHasAnyRole } from "@/hooks/use-has-role";
import {
  SUBJECT_EDIT_ROLES,
  SUBJECT_STATUSES,
  type SubjectResponse,
  type SubjectStatus,
} from "@/schemas/subject";

// Radix Select can't use "" as an item value, so "all" stands in for "no status filter".
const ALL_STATUSES = "all";

const ROW = "grid grid-cols-[1fr_2fr_auto_auto_auto] items-center gap-4";

export default function Subject() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const canEdit = useHasAnyRole(SUBJECT_EDIT_ROLES);

  const {
    subjects,
    status,
    initialized,
    error,
    search,
    statusFilter,
    page,
    totalPages,
    totalElements,
  } = useAppSelector((state) => state.subjects);

  // Start from the last-used filters so coming back from a detail page keeps them.
  const [initialQuery] = useState({ search, status: statusFilter });
  const [searchKeyword, setSearchKeyword] = useState(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectResponse | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectResponse | null>(null);

  useEffect(() => {
    dispatch(searchSubjects({ ...initialQuery, page: 0 }));
  }, [dispatch, initialQuery]);

  const isLoading = status === "loading";

  function reload(nextPage = page) {
    dispatch(searchSubjects({ search, status: statusFilter, page: nextPage }));
  }

  function goToPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return;
    reload(nextPage);
  }

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(searchSubjects({ search: searchKeyword.trim(), status: statusFilter, page: 0 }));
  }

  function handleStatusChange(value: string) {
    const nextStatus = value === ALL_STATUSES ? null : (value as SubjectStatus);
    dispatch(searchSubjects({ search: searchKeyword.trim(), status: nextStatus, page: 0 }));
  }

  return (
    <DashboardLayout breadcrumb="Subjects">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="flex max-w-sm flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by code or name..."
                className="pl-8"
                aria-label="Search subjects"
              />
            </div>
            <Button type="submit" variant="secondary" disabled={isLoading}>
              Search
            </Button>
          </form>

          <Select value={statusFilter ?? ALL_STATUSES} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {SUBJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add subject
          </Button>
        )}
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className={`${ROW} border-b pb-2 text-xs font-medium text-muted-foreground`}>
            <span>Code</span>
            <span>Name</span>
            <span className="w-16 text-right">Credits</span>
            <span className="w-20">Status</span>
            <span className="w-8 text-right">
              <span className="sr-only">Actions</span>
            </span>
          </div>

          {isLoading || !initialized ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={ROW}>
                <Skeleton className="h-3.5 w-20" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="ml-auto h-3.5 w-6" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
              </div>
            ))
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <p className="text-center text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => reload()}>
                Retry
              </Button>
            </div>
          ) : subjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {search || statusFilter
                ? "No subjects match these filters."
                : "No subjects yet."}
            </p>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className={ROW}>
                <Link
                  to={`/subjects/${subject.id}`}
                  className="font-mono text-sm font-medium hover:underline"
                >
                  {subject.code}
                </Link>

                <div className="flex min-w-0 flex-col">
                  <Link
                    to={`/subjects/${subject.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {subject.name}
                  </Link>
                  {subject.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {subject.description}
                    </span>
                  )}
                </div>

                <span className="w-16 text-right text-sm text-muted-foreground">
                  {subject.creditHours}
                </span>

                <div className="w-20">
                  <SubjectStatusBadge status={subject.status} />
                </div>

                <div className="flex w-8 justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions for {subject.code}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => navigate(`/subjects/${subject.id}`)}>
                        View details
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuItem onSelect={() => setEditingSubject(subject)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeletingSubject(subject)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}

          {!isLoading && initialized && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} &middot; {totalElements} subjects
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 0}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <SubjectFormDialog
          mode="create"
          open={addOpen}
          onOpenChange={setAddOpen}
          onSaved={() => reload(0)}
        />
      )}

      {editingSubject && (
        <SubjectFormDialog
          mode="edit"
          subject={editingSubject}
          open={editingSubject !== null}
          onOpenChange={(open) => {
            if (!open) setEditingSubject(null);
          }}
          // The status may have changed so the row no longer matches the active filter.
          onSaved={() => reload()}
        />
      )}

      {deletingSubject && (
        <DeleteSubjectDialog
          subject={deletingSubject}
          open={deletingSubject !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingSubject(null);
          }}
          // Refill the page (or step back if it was the last row on it).
          onDeleted={() => reload(subjects.length === 1 && page > 0 ? page - 1 : page)}
        />
      )}
    </DashboardLayout>
  );
}
