import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { searchTeachers } from "@/features/teachers/teacherSlice";
import AddTeacher from "@/components/AddTeacher";
import EditTeacher from "@/components/EditTeacher";
import DeleteTeacherDialog from "@/components/DeleteTeacherDialog";
import type { TeacherResponse } from "@/schemas/teacher";

export default function Teacher() {
  const dispatch = useAppDispatch();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<TeacherResponse | null>(
    null,
  );
  const [deletingTeacher, setDeletingTeacher] =
    useState<TeacherResponse | null>(null);
  const {
    teachers,
    status,
    initialized,
    error,
    page,
    totalPages,
    totalElements,
  } = useAppSelector((state) => state.teachers);

  function goToPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return;
    dispatch(searchTeachers({ search: searchKeyword, page: nextPage }));
  }

  useEffect(() => {
    dispatch(searchTeachers({ search: searchKeyword, page: 0 }));
  }, []);

  const isLoading = status === "loading";

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(searchTeachers({ search: searchKeyword, page: 0 }));
  }

  return (
    <DashboardLayout breadcrumb="Teacher">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Teacher</h1>
      </div>

      <div className="flex items-center justify-between gap-3">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 max-w-sm items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search teachers..."
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isLoading}>
            Search
          </Button>
        </form>
        <AddTeacher />
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            <span>#Number</span>
            <span>Teacher Type</span>
            <span className="text-right">Actions</span>
          </div>

          {isLoading || !initialized ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
              </div>
            ))
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">{error}</p>
          ) : teachers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No teachers found.
            </p>
          ) : (
            teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {teacher.email}
                  </span>
                </div>

                <span className="text-sm text-muted-foreground">
                  {teacher.employeeNumber}
                </span>

                <Badge variant="outline" className="w-fit capitalize">
                  {teacher.teacherType.toLowerCase()}
                </Badge>

                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => setEditingTeacher(teacher)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeletingTeacher(teacher)}
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
                Page {page + 1} of {totalPages} &middot; {totalElements}{" "}
                teachers
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

      {editingTeacher && (
        <EditTeacher
          teacher={editingTeacher}
          open={editingTeacher !== null}
          onOpenChange={(open) => {
            if (!open) setEditingTeacher(null);
          }}
        />
      )}

      {deletingTeacher && (
        <DeleteTeacherDialog
          teacher={deletingTeacher}
          open={deletingTeacher !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingTeacher(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
