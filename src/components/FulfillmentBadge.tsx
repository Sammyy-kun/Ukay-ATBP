import { FulfillmentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const STYLES: Record<FulfillmentStatus, string> = {
  Pending: "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-100",
  Packed: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50",
  Delivered: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
};

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </Badge>
  );
}
