import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubject, fetchSubjectMembers } from "@/features/subjects/subjectSlice";
import SubjectFormDialog from "@/components/SubjectFormDialog";
import DeleteSubjectDialog from "@/components/DeleteSubjectDialog";
import SubjectMembersPanel from "@/components/SubjectMembersPanel";
import SubjectStatusBadge from "@/components/SubjectStatusBadge";
import { useHasAnyRole } from "@/hooks/use-has-role";
import { SUBJECT_EDIT_ROLES } from "@/schemas/subject";

// subject-service answers a malformed id with a 500 (no type-mismatch handler), so don't send one.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SubjectDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const canEdit = useHasAnyRole(SUBJECT_EDIT_ROLES);

  const { current, currentStatus, currentError, teachers, students } = useAppSelector(
    (state) => state.subjects,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const validId = UUID_PATTERN.test(id);

  useEffect(() => {
    if (!validId) return;
    dispatch(fetchSubject(id));
    dispatch(fetchSubjectMembers({ subjectId: id, kind: "teacher" }));
    dispatch(fetchSubjectMembers({ subjectId: id, kind: "student" }));
  }, [dispatch, id, validId]);

  // Only trust `current` once it's the subject in the URL (it may still hold the previous one).
  const subject = current?.id === id ? current : null;

  const breadcrumbs = [
    { label: "Subjects", href: "/subjects" },
    { label: subject?.code ?? "Details" },
  ];

  if (!validId || (currentStatus === "failed" && !subject)) {
    const notFound = !validId || currentError?.code === "RESOURCE_NOT_FOUND";
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium">
              {notFound ? "This subject doesn't exist or was deleted." : currentError?.message}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/subjects">
                  <ArrowLeft className="size-4" />
                  Back to subjects
                </Link>
              </Button>
              {!notFound && <Button onClick={() => dispatch(fetchSubject(id))}>Retry</Button>}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to="/subjects">
            <ArrowLeft className="size-4" />
            Subjects
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          {subject ? (
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{subject.code}</span>
                <SubjectStatusBadge status={subject.status} />
              </div>
              <CardTitle className="text-2xl">{subject.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {subject.creditHours} credit {subject.creditHours === 1 ? "hour" : "hours"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}

          {canEdit && subject && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        {subject?.description && (
          <CardContent>
            <p className="whitespace-pre-line text-sm">{subject.description}</p>
          </CardContent>
        )}
      </Card>

      <Card className="flex-1">
        <CardContent>
          <Tabs defaultValue="teachers" className="gap-4">
            <TabsList>
              <TabsTrigger value="teachers">
                Teachers
                {teachers.status !== "loading" && (
                  <span className="text-muted-foreground">({teachers.items.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="students">
                Students
                {students.status !== "loading" && (
                  <span className="text-muted-foreground">({students.items.length})</span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="teachers">
              <SubjectMembersPanel subjectId={id} kind="teacher" canEdit={canEdit} />
            </TabsContent>
            <TabsContent value="students">
              <SubjectMembersPanel subjectId={id} kind="student" canEdit={canEdit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {canEdit && subject && (
        <>
          <SubjectFormDialog
            mode="edit"
            subject={subject}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <DeleteSubjectDialog
            subject={subject}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDeleted={() => navigate("/subjects", { replace: true })}
          />
        </>
      )}
    </DashboardLayout>
  );
}
