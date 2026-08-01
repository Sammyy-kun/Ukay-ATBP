import { OrderWithDetails } from "@/lib/types";
import { PaymentBadge } from "@/components/PaymentBadge";
import { FulfillmentBadge } from "@/components/FulfillmentBadge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  Truck,
  CircleDot,
  Eye,
  XCircle,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface OrderCardProps {
  order: OrderWithDetails;
  onView: (order: OrderWithDetails) => void;
  onMarkPaid: (orderId: string) => void;
  onMarkRefunded: (orderId: string) => void;
  onAdvanceFulfillment: (orderId: string, nextStatus: string) => void;
}

export function OrderCard({
  order,
  onView,
  onMarkPaid,
  onMarkRefunded,
  onAdvanceFulfillment,
}: OrderCardProps) {
  const buyerName = order.buyer?.facebookName || "Unknown buyer";
  const buyerPhone = order.buyer?.phone;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50">
      <div className="flex items-start justify-between gap-3">
        {/* Left: buyer + item info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {buyerName}
            </p>
            {buyerPhone && (
              <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                {buyerPhone}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-neutral-500 truncate">
            {order.itemTitle || order.itemId}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.fulfillmentStatus} />
            {order.paymentMethod && (
              <span className="text-xs text-neutral-400">
                {order.paymentMethod}
              </span>
            )}
          </div>
        </div>

        {/* Right: price + time */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold tabular-nums text-neutral-900">
            ₱{order.salePrice.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {timeAgo(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onView(order)}
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>

        {order.paymentStatus === "Unpaid" && (
          <>
            <Button
              size="sm"
              className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={() => onMarkPaid(order.id)}
            >
              <CheckCircle size={14} className="mr-1" />
              Mark Paid
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onMarkRefunded(order.id)}
            >
              <XCircle size={14} className="mr-1" />
              Refund
            </Button>
          </>
        )}

        {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Pending" && (
          <Button
            size="sm"
            className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={() => onAdvanceFulfillment(order.id, "Packed")}
          >
            <Package size={14} className="mr-1" />
            Pack
          </Button>
        )}

        {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Packed" && (
          <Button
            size="sm"
            className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={() => onAdvanceFulfillment(order.id, "Shipped")}
          >
            <Truck size={14} className="mr-1" />
            Ship
          </Button>
        )}

        {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Shipped" && (
          <Button
            size="sm"
            className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
            onClick={() => onAdvanceFulfillment(order.id, "Delivered")}
          >
            <CircleDot size={14} className="mr-1" />
            Delivered
          </Button>
        )}
      </div>
    </div>
  );
}
