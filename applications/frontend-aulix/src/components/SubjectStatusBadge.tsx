import { Badge } from "@/components/ui/badge";
import type { SubjectStatus } from "@/schemas/subject";

const VARIANT: Record<SubjectStatus, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  ARCHIVED: "outline",
};

export default function SubjectStatusBadge({ status }: { status: SubjectStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="w-fit capitalize">
      {status.toLowerCase()}
    </Badge>
  );
}
