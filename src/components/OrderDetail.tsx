"use client";

import { OrderWithDetails } from "@/lib/types";
import { PaymentBadge } from "@/components/PaymentBadge";
import { FulfillmentBadge } from "@/components/FulfillmentBadge";
import { Button } from "@/components/ui/button";
import {
  X,
  CheckCircle,
  Package,
  Truck,
  CircleDot,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailProps {
  order: OrderWithDetails;
  onClose: () => void;
  onMarkPaid: (orderId: string) => void;
  onMarkRefunded: (orderId: string) => void;
  onAdvanceFulfillment: (orderId: string, nextStatus: string) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderDetail({
  order,
  onClose,
  onMarkPaid,
  onMarkRefunded,
  onAdvanceFulfillment,
}: OrderDetailProps) {
  const buyer = order.buyer;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-900">Order Detail</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Item info */}
          <div className="flex items-start gap-4">
            {order.itemPhoto && (
              <img
                src={order.itemPhoto}
                alt={order.itemTitle || "Item"}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {order.itemTitle || order.itemId}
              </p>
              <p className="text-xs text-neutral-500">SKU: {order.itemId}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                ₱{order.salePrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sale info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Sale
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-neutral-500">Source</span>
              <span className="text-neutral-900">{order.source}</span>
              <span className="text-neutral-500">Created</span>
              <span className="text-neutral-900">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Buyer info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Buyer
            </h4>
            {buyer ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-neutral-500">Facebook</span>
                <span className="text-neutral-900">{buyer.facebookName}</span>
                {buyer.messengerUrl && (
                  <>
                    <span className="text-neutral-500">Messenger</span>
                    <a
                      href={buyer.messengerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-700 inline-flex items-center gap-1"
                    >
                      {buyer.messengerUrl.replace("https://", "")}
                      <ExternalLink size={12} />
                    </a>
                  </>
                )}
                {buyer.phone && (
                  <>
                    <span className="text-neutral-500">Phone</span>
                    <span className="text-neutral-900">{buyer.phone}</span>
                  </>
                )}
                {buyer.notes && (
                  <>
                    <span className="text-neutral-500">Notes</span>
                    <span className="text-neutral-900">{buyer.notes}</span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No buyer assigned</p>
            )}
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Payment
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-neutral-500">Status</span>
              <PaymentBadge status={order.paymentStatus} />
              <span className="text-neutral-500">Method</span>
              <span className="text-neutral-900">{order.paymentMethod || "—"}</span>
              <span className="text-neutral-500">Reference</span>
              <span className="text-neutral-900">{order.paymentReference || "—"}</span>
              <span className="text-neutral-500">Paid at</span>
              <span className="text-neutral-900">{formatDate(order.paidAt)}</span>
            </div>
            <div className="mt-2 flex gap-2">
              {order.paymentStatus === "Unpaid" && (
                <>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
                    onClick={() => onMarkPaid(order.id)}
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Mark as Paid
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
            </div>
          </div>

          {/* Fulfillment */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Fulfillment
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-neutral-500">Status</span>
              <FulfillmentBadge status={order.fulfillmentStatus} />
              <span className="text-neutral-500">Tracking #</span>
              <span className="text-neutral-900">{order.trackingNumber || "—"}</span>
              <span className="text-neutral-500">Shipped at</span>
              <span className="text-neutral-900">{formatDate(order.shippedAt)}</span>
              <span className="text-neutral-500">Delivered at</span>
              <span className="text-neutral-900">{formatDate(order.deliveredAt)}</span>
            </div>
            <div className="mt-2 flex gap-2">
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

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Notes
              </h4>
              <p className="text-sm text-neutral-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
