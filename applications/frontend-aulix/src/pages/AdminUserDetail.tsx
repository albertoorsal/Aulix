import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Power, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { fetchUser } from "@/features/users/userSlice";
import { searchAuditLogs } from "@/features/users/auditSlice";
import { useEnableUser } from "@/hooks/use-enable-user";
import AuditLogList from "@/components/AuditLogList";
import UserStatusBadge from "@/components/UserStatusBadge";
import UserRoleBadges from "@/components/UserRoleBadges";
import UserFormDialog from "@/components/UserFormDialog";
import UserRolesDialog from "@/components/UserRolesDialog";
import DisableUserDialog from "@/components/DisableUserDialog";
import DeleteUserDialog from "@/components/DeleteUserDialog";

// auth-service answers a malformed id with a 500 (no type-mismatch handler), so don't send one.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminUserDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const enableUser = useEnableUser();
  const currentUserId = useAppSelector(selectUser)?.id;

  const { current, currentStatus, currentError } = useAppSelector((state) => state.users);
  const activity = useAppSelector((state) => state.audit.activity);

  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const validId = UUID_PATTERN.test(id);

  const loadActivity = useCallback(
    (page = 0) => dispatch(searchAuditLogs({ view: "activity", userId: id, page })),
    [dispatch, id],
  );

  useEffect(() => {
    if (!validId) return;
    dispatch(fetchUser(id));
    loadActivity();
  }, [dispatch, id, validId, loadActivity]);

  // Only trust `current` once it's the user in the URL (it may still hold the previous one).
  const user = current?.id === id ? current : null;
  const isSelf = id === currentUserId;
  const activityForUser = activity.userId === id;

  if (!validId || (currentStatus === "failed" && !user)) {
    const notFound = !validId || currentError?.code === "RESOURCE_NOT_FOUND";
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm font-medium">
            {notFound ? "This user doesn't exist or was deleted." : currentError?.message}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/users">
                <ArrowLeft className="size-4" />
                Back to users
              </Link>
            </Button>
            {!notFound && <Button onClick={() => dispatch(fetchUser(id))}>Retry</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="size-4" />
            Users
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          {user ? (
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <UserStatusBadge enabled={user.enabled} />
                {isSelf && <span className="text-xs text-muted-foreground">This is you</span>}
              </div>
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <UserRoleBadges roles={user.roles} />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          )}

          {user && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRolesOpen(true)}>
                <ShieldCheck className="size-4" />
                Manage roles
              </Button>
              {/* You can't disable or delete your own account (also enforced by the backend). */}
              {!user.enabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await enableUser(user);
                    loadActivity();
                  }}
                >
                  <Power className="size-4" />
                  Enable
                </Button>
              ) : (
                !isSelf && (
                  <Button variant="outline" size="sm" onClick={() => setDisableOpen(true)}>
                    <Power className="size-4" />
                    Disable
                  </Button>
                )
              )}
              {!isSelf && (
                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogList
            items={activityForUser ? activity.items : []}
            loading={!activityForUser || activity.status === "loading" || !activity.initialized}
            error={activity.error}
            page={activity.page}
            totalPages={activity.totalPages}
            totalElements={activity.totalElements}
            emptyMessage="No administrative changes recorded for this user yet."
            showTarget={false}
            onPageChange={(page) => loadActivity(page)}
            onRetry={() => loadActivity(activity.page)}
          />
        </CardContent>
      </Card>

      {user && (
        <>
          <UserFormDialog
            user={user}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSaved={() => loadActivity()}
          />
          <UserRolesDialog
            user={user}
            open={rolesOpen}
            onOpenChange={setRolesOpen}
            onChanged={() => loadActivity()}
          />
          <DisableUserDialog
            user={user}
            open={disableOpen}
            onOpenChange={setDisableOpen}
            onDisabled={() => loadActivity()}
          />
          <DeleteUserDialog
            user={user}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDeleted={() => navigate("/admin/users", { replace: true })}
          />
        </>
      )}
    </>
  );
}
