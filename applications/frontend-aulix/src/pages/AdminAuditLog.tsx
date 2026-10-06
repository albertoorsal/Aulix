import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchAuditLogs } from "@/features/users/auditSlice";
import AuditLogList from "@/components/AuditLogList";
import { AUDIT_ACTION_LABELS, AUDIT_ACTIONS, type AuditAction } from "@/schemas/user";

// Radix Select can't use "" as an item value, so "all" stands in for "no action filter".
const ALL_ACTIONS = "all";

export default function AdminAuditLog() {
  const dispatch = useAppDispatch();
  const log = useAppSelector((state) => state.audit.log);

  // Start from the last-used filters so coming back from a user's page keeps them.
  const [initialQuery] = useState({ search: log.search, action: log.action });
  const [searchKeyword, setSearchKeyword] = useState(log.search);

  useEffect(() => {
    dispatch(searchAuditLogs({ view: "log", ...initialQuery, page: 0 }));
  }, [dispatch, initialQuery]);

  function load(page: number, search = log.search, action = log.action) {
    dispatch(searchAuditLogs({ view: "log", search, action, page }));
  }

  function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    load(0, searchKeyword.trim());
  }

  function handleActionChange(value: string) {
    load(0, searchKeyword.trim(), value === ALL_ACTIONS ? null : (value as AuditAction));
  }

  const hasFilters = Boolean(log.search || log.action);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex max-w-sm flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by user email..."
              className="pl-8"
              aria-label="Search the audit log by user email"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={log.status === "loading"}>
            Search
          </Button>
        </form>

        <Select value={log.action ?? ALL_ACTIONS} onValueChange={handleActionChange}>
          <SelectTrigger className="w-44" aria-label="Filter by action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTIONS}>All actions</SelectItem>
            {AUDIT_ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {AUDIT_ACTION_LABELS[action]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogList
            items={log.items}
            loading={log.status === "loading" || !log.initialized}
            error={log.error}
            page={log.page}
            totalPages={log.totalPages}
            totalElements={log.totalElements}
            emptyMessage={
              hasFilters
                ? "No entries match these filters."
                : "No changes recorded yet. Role changes, enabling, disabling, edits and deletions of users appear here."
            }
            onPageChange={(page) => {
              if (page >= 0 && page < log.totalPages) load(page);
            }}
            onRetry={() => load(log.page)}
          />
        </CardContent>
      </Card>
    </>
  );
}
