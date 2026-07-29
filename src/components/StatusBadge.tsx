import { ItemStatus } from "@/lib/types";

const STYLES: Record<ItemStatus, string> = {
  available: "bg-green-50 text-green-700 border border-green-200",
  reserved: "bg-amber-50 text-amber-700 border border-amber-200",
  sold: "bg-neutral-100 text-neutral-500 border border-neutral-200",
};

const LABELS: Record<ItemStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
