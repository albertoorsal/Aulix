import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import { AUDIT_ACTION_LABELS, type AuditAction, type AuditLogResponse } from "@/schemas/user";

const ACTION_VARIANT: Record<AuditAction, "default" | "secondary" | "outline" | "destructive"> = {
  ROLE_ASSIGNED: "default",
  ROLE_REVOKED: "secondary",
  USER_ENABLED: "default",
  USER_DISABLED: "secondary",
  USER_UPDATED: "outline",
  USER_DELETED: "destructive",
};

interface AuditLogListProps {
  items: AuditLogResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  emptyMessage: string;
  // Hide the "User" column when the list is already scoped to one user.
  showTarget?: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export default function AuditLogList({
  items,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  emptyMessage,
  showTarget = true,
  onPageChange,
  onRetry,
}: AuditLogListProps) {
  const row = showTarget
    ? "grid grid-cols-[9rem_8rem_1.5fr_1fr_1fr] items-center gap-4"
    : "grid grid-cols-[9rem_8rem_1fr_1fr] items-center gap-4";

  return (
    <div className="flex flex-col gap-3">
      {/* Columns would get too narrow on phones; scroll inside the card instead. */}
      <div className="overflow-x-auto">
        <div className="flex min-w-[40rem] flex-col gap-3">
          <div className={`${row} border-b pb-2 text-xs font-medium text-muted-foreground`}>
            <span>When</span>
            <span>Action</span>
            {showTarget && <span>User</span>}
            <span>Details</span>
            <span>By</span>
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={row}>
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-24 rounded-full" />
                {showTarget && <Skeleton className="h-3.5 w-40" />}
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <p className="text-center text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            items.map((entry) => (
              <div key={entry.id} className={row}>
                <time
                  dateTime={entry.createdAt}
                  className="text-sm text-muted-foreground"
                  title={entry.createdAt}
                >
                  {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                </time>
                <Badge variant={ACTION_VARIANT[entry.action]} className="w-fit">
                  {AUDIT_ACTION_LABELS[entry.action]}
                </Badge>
                {showTarget &&
                  (entry.action === "USER_DELETED" ? (
                    <span className="truncate text-sm">{entry.targetEmail}</span>
                  ) : (
                    <Link
                      to={`/admin/users/${entry.targetUserId}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {entry.targetEmail}
                    </Link>
                  ))}
                <span className="truncate text-sm" title={entry.details ?? undefined}>
                  {entry.details ?? <span className="text-muted-foreground">—</span>}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {entry.actorEmail ?? "System"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} &middot; {totalElements} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 0}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
