import { ItemStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const STYLES: Record<ItemStatus, string> = {
  available: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  reserved: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  sold: "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-100",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STYLES[status]}`}
    >
      {status}
    </Badge>
  );
}
