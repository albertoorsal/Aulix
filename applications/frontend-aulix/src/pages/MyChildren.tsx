import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, BookOpen, RotateCw, Star } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchChildSubjects, fetchMyChildren } from "@/features/parents/parentSlice";
import { RELATIONSHIP_LABELS, studentName, type ParentStudentResponse } from "@/schemas/parent";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  // LocalDate from the backend ("2015-03-01"); parse as a calendar date, not UTC midnight.
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function ChildSubjects({ studentId }: { studentId: string }) {
  const dispatch = useAppDispatch();
  const subjects = useAppSelector((state) => state.parents.childSubjects[studentId]);

  useEffect(() => {
    dispatch(fetchChildSubjects(studentId));
  }, [dispatch, studentId]);

  if (!subjects || (subjects.status === "loading" && subjects.items.length === 0)) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-48" />
        ))}
      </div>
    );
  }

  if (subjects.status === "failed") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-destructive">{subjects.error}</p>
        <Button variant="outline" size="sm" onClick={() => dispatch(fetchChildSubjects(studentId))}>
          <RotateCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (subjects.items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enrolled in any subjects yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y">
      {subjects.items.map((subject) => (
        <li key={subject.id} className="flex items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{subject.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{subject.code}</span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {subject.creditHours} credit {subject.creditHours === 1 ? "hour" : "hours"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ChildCard({ link }: { link: ParentStudentResponse }) {
  const student = link.student;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            {!student && (
              <AlertTriangle className="size-4 text-amber-500" aria-label="Record unavailable" />
            )}
            {studentName(link)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {RELATIONSHIP_LABELS[link.relationship]}
            {link.primaryContact && " · primary contact"}
          </p>
        </div>
        {link.primaryContact && (
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3" />
            Primary contact
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {student ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Student number</dt>
              <dd className="font-medium">{student.studentNumber}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Grade</dt>
              <dd className="font-medium">{student.gradeLevel}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">
                {student.enrollmentStatus.toLowerCase().replace("_", " ")}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Date of birth</dt>
              <dd className="font-medium">{formatDate(student.dateOfBirth)}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            This student's details couldn't be loaded right now. Contact the school if this
            keeps happening.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="size-4" />
            Enrolled subjects
          </h3>
          <ChildSubjects studentId={link.studentId} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyChildren() {
  const dispatch = useAppDispatch();
  const { myProfile, myChildren, myChildrenStatus, myChildrenError, myChildrenInitialized } =
    useAppSelector((state) => state.parents);

  useEffect(() => {
    dispatch(fetchMyChildren());
  }, [dispatch]);

  const isLoading = myChildrenStatus === "loading" || !myChildrenInitialized;

  return (
    <DashboardLayout breadcrumb="My children">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My children</h1>
        {myProfile?.firstName && (
          <p className="text-sm text-muted-foreground">
            Welcome, {myProfile.firstName}. Here is what the school has on file for your children.
          </p>
        )}
      </div>

      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-56" />
            </CardContent>
          </Card>
        ))
      ) : myChildrenStatus === "failed" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10">
            <p className="text-center text-sm text-destructive">{myChildrenError}</p>
            <Button variant="outline" size="sm" onClick={() => dispatch(fetchMyChildren())}>
              <RotateCw className="size-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : myChildren.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No children are linked to your account yet. Contact the school office to have them
            added.
          </CardContent>
        </Card>
      ) : (
        myChildren.map((link) => <ChildCard key={link.studentId} link={link} />)
      )}
    </DashboardLayout>
  );
}
