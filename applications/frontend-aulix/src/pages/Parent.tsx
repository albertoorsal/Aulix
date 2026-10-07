import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchParents } from "@/features/parents/parentSlice";
import ParentFormDialog from "@/components/ParentFormDialog";
import DeleteParentDialog from "@/components/DeleteParentDialog";
import { parentName, type ParentResponse } from "@/schemas/parent";

const ROW = "grid grid-cols-[2fr_1fr_auto_auto] items-center gap-4";

export default function Parent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { parents, status, initialized, error, search, page, totalPages, totalElements } =
    useAppSelector((state) => state.parents);

  // Start from the last-used search so coming back from a detail page keeps it.
  const [initialSearch] = useState(search);
  const [searchKeyword, setSearchKeyword] = useState(search);
  const [addOpen, setAddOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentResponse | null>(null);
  const [deletingParent, setDeletingParent] = useState<ParentResponse | null>(null);

  useEffect(() => {
    dispatch(searchParents({ search: initialSearch, page: 0 }));
  }, [dispatch, initialSearch]);

  const isLoading = status === "loading";

  function reload(nextPage = page) {
    dispatch(searchParents({ search, page: nextPage }));
  }

  function goToPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return;
    reload(nextPage);
  }

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(searchParents({ search: searchKeyword.trim(), page: 0 }));
  }

  return (
    <DashboardLayout breadcrumb="Parents">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Parents</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex max-w-sm flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-8"
              aria-label="Search parents"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isLoading}>
            Search
          </Button>
        </form>

        <Button variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add parent
        </Button>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>All Parents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className={`${ROW} border-b pb-2 text-xs font-medium text-muted-foreground`}>
            <span>Name</span>
            <span>Phone</span>
            <span className="w-20 text-right">Children</span>
            <span className="w-8 text-right">
              <span className="sr-only">Actions</span>
            </span>
          </div>

          {isLoading || !initialized ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={ROW}>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="ml-auto h-3.5 w-6" />
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
          ) : parents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {search ? "No parents match this search." : "No parents yet."}
            </p>
          ) : (
            parents.map((parent) => (
              <div key={parent.id} className={ROW}>
                <div className="flex min-w-0 flex-col">
                  <Link
                    to={`/parents/${parent.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {parentName(parent)}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground">
                    {parent.email ?? "—"}
                  </span>
                </div>

                <span className="truncate text-sm text-muted-foreground">
                  {parent.phone ?? "—"}
                </span>

                <span className="w-20 text-right text-sm text-muted-foreground">
                  {parent.childCount}
                </span>

                <div className="flex w-8 justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions for {parentName(parent)}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => navigate(`/parents/${parent.id}`)}>
                        View children
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setEditingParent(parent)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeletingParent(parent)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}

          {!isLoading && initialized && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} &middot; {totalElements} parents
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

      <ParentFormDialog
        mode="create"
        open={addOpen}
        onOpenChange={setAddOpen}
        // Go straight to the new parent so their children can be linked.
        onSaved={(parent) => navigate(`/parents/${parent.id}`)}
      />

      {editingParent && (
        <ParentFormDialog
          mode="edit"
          parent={editingParent}
          open={editingParent !== null}
          onOpenChange={(open) => {
            if (!open) setEditingParent(null);
          }}
        />
      )}

      {deletingParent && (
        <DeleteParentDialog
          parent={deletingParent}
          open={deletingParent !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingParent(null);
          }}
          // Refill the page (or step back if it was the last row on it).
          onDeleted={() => reload(parents.length === 1 && page > 0 ? page - 1 : page)}
        />
      )}
    </DashboardLayout>
  );
}
