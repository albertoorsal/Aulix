import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchParent, fetchParentLinks } from "@/features/parents/parentSlice";
import ParentFormDialog from "@/components/ParentFormDialog";
import DeleteParentDialog from "@/components/DeleteParentDialog";
import ParentLinksPanel from "@/components/ParentLinksPanel";
import { parentName } from "@/schemas/parent";

// parent-service answers a malformed id with a 500 (no type-mismatch handler), so don't send one.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ParentDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current, currentStatus, currentError } = useAppSelector((state) => state.parents);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const validId = UUID_PATTERN.test(id);

  useEffect(() => {
    if (!validId) return;
    dispatch(fetchParent(id));
    dispatch(fetchParentLinks(id));
  }, [dispatch, id, validId]);

  // Only trust `current` once it's the parent in the URL (it may still hold the previous one).
  const parent = current?.id === id ? current : null;
  const name = parent ? parentName(parent) : "Details";

  const breadcrumbs = [{ label: "Parents", href: "/parents" }, { label: name }];

  if (!validId || (currentStatus === "failed" && !parent)) {
    const notFound = !validId || currentError?.code === "RESOURCE_NOT_FOUND";
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium">
              {notFound ? "This parent doesn't exist or was deleted." : currentError?.message}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/parents">
                  <ArrowLeft className="size-4" />
                  Back to parents
                </Link>
              </Button>
              {!notFound && <Button onClick={() => dispatch(fetchParent(id))}>Retry</Button>}
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
          <Link to="/parents">
            <ArrowLeft className="size-4" />
            Parents
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          {parent ? (
            <div className="flex min-w-0 flex-col gap-2">
              <CardTitle className="text-2xl">{name}</CardTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {parent.email ?? "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {parent.phone ?? "No phone"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          )}

          {parent && (
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
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Children</CardTitle>
        </CardHeader>
        <CardContent>
          <ParentLinksPanel parentId={id} parentName={name} />
        </CardContent>
      </Card>

      {parent && (
        <>
          <ParentFormDialog
            mode="edit"
            parent={parent}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <DeleteParentDialog
            parent={parent}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDeleted={() => navigate("/parents", { replace: true })}
          />
        </>
      )}
    </DashboardLayout>
  );
}
