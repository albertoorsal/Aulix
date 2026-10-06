import { Badge } from "@/components/ui/badge";

export default function UserStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge variant={enabled ? "default" : "secondary"} className="w-fit">
      {enabled ? "Active" : "Disabled"}
    </Badge>
  );
}
