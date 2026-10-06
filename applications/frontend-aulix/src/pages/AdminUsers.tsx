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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { searchUsers } from "@/features/users/userSlice";
import { useEnableUser } from "@/hooks/use-enable-user";
import UserStatusBadge from "@/components/UserStatusBadge";
import UserRoleBadges from "@/components/UserRoleBadges";
import UserFormDialog from "@/components/UserFormDialog";
import UserRolesDialog from "@/components/UserRolesDialog";
import DisableUserDialog from "@/components/DisableUserDialog";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import { ROLES, type UserResponse } from "@/schemas/user";

// Radix Select can't use "" as an item value, so "all" stands in for "no filter".
const ALL = "all";

const ROW = "grid grid-cols-[2fr_1.5fr_auto_auto] items-center gap-4";

export default function AdminUsers() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const enableUser = useEnableUser();
  const currentUserId = useAppSelector(selectUser)?.id;

  const {
    users,
    status,
    initialized,
    error,
    search,
    roleFilter,
    enabledFilter,
    page,
    totalPages,
    totalElements,
  } = useAppSelector((state) => state.users);

  // Start from the last-used filters so coming back from a detail page keeps them.
  const [initialQuery] = useState({ search, role: roleFilter, enabled: enabledFilter });
  const [searchKeyword, setSearchKeyword] = useState(search);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [rolesUser, setRolesUser] = useState<UserResponse | null>(null);
  const [disablingUser, setDisablingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    dispatch(searchUsers({ ...initialQuery, page: 0 }));
  }, [dispatch, initialQuery]);

  const isLoading = status === "loading";
  const hasFilters = Boolean(search || roleFilter || enabledFilter !== null);

  function reload(nextPage = page) {
    dispatch(searchUsers({ search, role: roleFilter, enabled: enabledFilter, page: nextPage }));
  }

  function goToPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return;
    reload(nextPage);
  }

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(
      searchUsers({ search: searchKeyword.trim(), role: roleFilter, enabled: enabledFilter, page: 0 }),
    );
  }

  function handleRoleChange(value: string) {
    dispatch(
      searchUsers({
        search: searchKeyword.trim(),
        role: value === ALL ? null : value,
        enabled: enabledFilter,
        page: 0,
      }),
    );
  }

  function handleStatusChange(value: string) {
    dispatch(
      searchUsers({
        search: searchKeyword.trim(),
        role: roleFilter,
        enabled: value === ALL ? null : value === "enabled",
        page: 0,
      }),
    );
  }

  async function handleEnable(user: UserResponse) {
    await enableUser(user);
    // The row may no longer match a "Disabled" filter.
    if (enabledFilter !== null) reload();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex max-w-sm flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-8"
              aria-label="Search users"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isLoading}>
            Search
          </Button>
        </form>

        <Select value={roleFilter ?? ALL} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-36" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role} className="capitalize">
                {role.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={enabledFilter === null ? ALL : enabledFilter ? "enabled" : "disabled"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="enabled">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className={`${ROW} border-b pb-2 text-xs font-medium text-muted-foreground`}>
            <span>User</span>
            <span>Roles</span>
            <span className="w-20">Status</span>
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
                <Skeleton className="h-5 w-24 rounded-full" />
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
          ) : users.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {hasFilters ? "No users match these filters." : "No users yet."}
            </p>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <div key={user.id} className={ROW}>
                  <div className="flex min-w-0 flex-col">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {user.firstName} {user.lastName}
                      {isSelf && <span className="font-normal text-muted-foreground"> (you)</span>}
                    </Link>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>

                  <UserRoleBadges roles={user.roles} />

                  <div className="w-20">
                    <UserStatusBadge enabled={user.enabled} />
                  </div>

                  <div className="flex w-8 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions for {user.email}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => navigate(`/admin/users/${user.id}`)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setRolesUser(user)}>
                          Manage roles
                        </DropdownMenuItem>
                        {/* You can't disable or delete your own account (also enforced by the backend). */}
                        {(!user.enabled || !isSelf) && <DropdownMenuSeparator />}
                        {!user.enabled ? (
                          <DropdownMenuItem onSelect={() => handleEnable(user)}>
                            Enable
                          </DropdownMenuItem>
                        ) : (
                          !isSelf && (
                            <DropdownMenuItem onSelect={() => setDisablingUser(user)}>
                              Disable
                            </DropdownMenuItem>
                          )
                        )}
                        {!isSelf && (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeletingUser(user)}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}

          {!isLoading && initialized && totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} &middot; {totalElements} users
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

      {editingUser && (
        <UserFormDialog
          user={editingUser}
          open={editingUser !== null}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
          // The new name or email may no longer match the search.
          onSaved={() => reload()}
        />
      )}

      {rolesUser && (
        <UserRolesDialog
          // Read from the store so the dialog reflects each change as it's made.
          user={users.find((u) => u.id === rolesUser.id) ?? rolesUser}
          open={rolesUser !== null}
          onOpenChange={(open) => {
            if (open) return;
            setRolesUser(null);
            // The user may no longer match the role filter.
            if (roleFilter) reload();
          }}
        />
      )}

      {disablingUser && (
        <DisableUserDialog
          user={disablingUser}
          open={disablingUser !== null}
          onOpenChange={(open) => {
            if (!open) setDisablingUser(null);
          }}
          onDisabled={() => {
            if (enabledFilter !== null) reload();
          }}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={deletingUser !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingUser(null);
          }}
          // Refill the page (or step back if it was the last row on it).
          onDeleted={() => reload(users.length === 1 && page > 0 ? page - 1 : page)}
        />
      )}
    </>
  );
}
