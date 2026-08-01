import { PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const STYLES: Record<PaymentStatus, string> = {
  Unpaid: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  Paid: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  Refunded: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </Badge>
  );
}
