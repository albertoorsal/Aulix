import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, MoreHorizontal, Plus, RotateCw, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchParentLinks } from "@/features/parents/parentSlice";
import LinkStudentDialog from "@/components/LinkStudentDialog";
import UnlinkStudentDialog from "@/components/UnlinkStudentDialog";
import {
  RELATIONSHIP_LABELS,
  studentName,
  type ParentStudentResponse,
} from "@/schemas/parent";

const ROW = "grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4";

interface ParentLinksPanelProps {
  parentId: string;
  parentName: string;
}

export default function ParentLinksPanel({ parentId, parentName }: ParentLinksPanelProps) {
  const dispatch = useAppDispatch();
  const links = useAppSelector((state) => state.parents.links);

  const [linkOpen, setLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ParentStudentResponse | null>(null);
  const [unlinking, setUnlinking] = useState<ParentStudentResponse | null>(null);

  const linkedIds = useMemo(() => new Set(links.items.map((l) => l.studentId)), [links.items]);
  const isLoading = links.status === "loading" && links.items.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading students..."
            : `${links.items.length} linked ${links.items.length === 1 ? "student" : "students"}`}
        </p>
        <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}>
          <Plus className="size-4" />
          Link student
        </Button>
      </div>

      <div className={`${ROW} border-b pb-2 text-xs font-medium text-muted-foreground`}>
        <span>Student</span>
        <span>Relationship</span>
        <span>Grade</span>
        <span className="w-8 text-right">
          <span className="sr-only">Actions</span>
        </span>
      </div>

      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={ROW}>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-8" />
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </div>
        ))
      ) : links.status === "failed" ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-center text-sm text-destructive">{links.error}</p>
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchParentLinks(parentId))}>
            <RotateCw className="size-4" />
            Retry
          </Button>
        </div>
      ) : links.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No students linked to this parent yet.
        </p>
      ) : (
        links.items.map((link) => (
          <div key={link.studentId} className={ROW}>
            <div className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {!link.student && (
                  <AlertTriangle
                    className="size-3.5 text-amber-500"
                    aria-label="Record unavailable"
                  />
                )}
                {studentName(link)}
                {link.primaryContact && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3" />
                    Primary
                  </Badge>
                )}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {link.student
                  ? link.student.studentNumber
                  : "This record could not be loaded (it may have been deleted)."}
              </span>
            </div>
            <span className="text-sm">{RELATIONSHIP_LABELS[link.relationship]}</span>
            <span className="text-sm text-muted-foreground">
              {link.student?.gradeLevel ?? "—"}
            </span>
            <div className="flex w-8 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions for {studentName(link)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditingLink(link)}>
                    Edit link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setUnlinking(link)}>
                    Unlink
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}

      <LinkStudentDialog
        parentId={parentId}
        linkedIds={linkedIds}
        open={linkOpen}
        onOpenChange={setLinkOpen}
      />

      {editingLink && (
        <LinkStudentDialog
          parentId={parentId}
          link={editingLink}
          linkedIds={linkedIds}
          open={editingLink !== null}
          onOpenChange={(open) => {
            if (!open) setEditingLink(null);
          }}
        />
      )}

      {unlinking && (
        <UnlinkStudentDialog
          link={unlinking}
          parentName={parentName}
          open={unlinking !== null}
          onOpenChange={(open) => {
            if (!open) setUnlinking(null);
          }}
        />
      )}
    </div>
  );
}
