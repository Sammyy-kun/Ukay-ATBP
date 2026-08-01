"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { OrderWithDetails } from "@/lib/types";
import { fetchOrdersWithDetails, updateOrder } from "@/lib/orders";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingBag, Users, Eye, EyeOff, Shirt, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentBadge } from "@/components/PaymentBadge";
import { FulfillmentBadge } from "@/components/FulfillmentBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersViewProps {
  userId: string;
  onViewBuyers: () => void;
}

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

export function OrdersView({ userId, onViewBuyers }: OrdersViewProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadOrders() {
    setLoading(true);
    const data = await fetchOrdersWithDetails(userId);
    setOrders(data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.buyer?.facebookName?.toLowerCase().includes(search.toLowerCase()) ||
        o.itemTitle?.toLowerCase().includes(search.toLowerCase()) ||
        o.itemId.toLowerCase().includes(search.toLowerCase());
      const matchesPayment =
        paymentFilter === "all" || o.paymentStatus === paymentFilter;
      const matchesFulfillment =
        fulfillmentFilter === "all" || o.fulfillmentStatus === fulfillmentFilter;
      return matchesSearch && matchesPayment && matchesFulfillment;
    });
  }, [orders, search, paymentFilter, fulfillmentFilter]);

  async function handleMarkPaid(orderId: string) {
    await updateOrder(orderId, {
      paymentStatus: "Paid",
      paidAt: new Date().toISOString(),
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus: "Paid", paidAt: new Date().toISOString() }
          : o
      )
    );
    toast.success("Payment recorded", { description: "Order marked as paid." });
  }

  async function handleMarkRefunded(orderId: string) {
    await updateOrder(orderId, {
      paymentStatus: "Refunded",
      refundedAt: new Date().toISOString(),
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus: "Refunded", refundedAt: new Date().toISOString() }
          : o
      )
    );
    toast.success("Refund recorded", { description: "Order marked as refunded." });
  }

  async function handleAdvanceFulfillment(orderId: string, nextStatus: string) {
    const patch: Record<string, unknown> = { fulfillmentStatus: nextStatus };
    if (nextStatus === "Shipped") patch.shippedAt = new Date().toISOString();
    if (nextStatus === "Delivered") patch.deliveredAt = new Date().toISOString();
    await updateOrder(orderId, patch as any);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              fulfillmentStatus: nextStatus as any,
              ...(nextStatus === "Shipped" ? { shippedAt: new Date().toISOString() } : {}),
              ...(nextStatus === "Delivered" ? { deliveredAt: new Date().toISOString() } : {}),
            }
          : o
      )
    );
    const labels: Record<string, string> = {
      Packed: "Item packed",
      Shipped: "Item shipped",
      Delivered: "Item delivered",
    };
    toast.success(labels[nextStatus] || "Status updated", {
      description: `Fulfillment status updated to ${nextStatus}.`,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Orders</h2>
          <p className="text-sm text-neutral-500">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewBuyers}
          className="gap-1.5"
        >
          <Users size={14} />
          Buyers
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by buyer or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Packed">Packed</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag size={40} className="mb-3 text-neutral-200" />
          <p className="text-sm font-medium text-neutral-500">
            {orders.length === 0
              ? "No orders yet. Orders will appear here when you mark items as sold."
              : "No orders match your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const isExpanded = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <TableRow
                      className={isExpanded ? "bg-neutral-50" : ""}
                    >
                      <TableCell>
                        <div
                          className={`h-9 w-9 overflow-hidden rounded-md bg-neutral-100 flex items-center justify-center ${order.itemPhoto ? "cursor-pointer hover:ring-2 hover:ring-neutral-300 transition-shadow" : ""}`}
                          onClick={() => order.itemPhoto && setLightboxSrc(order.itemPhoto)}
                        >
                          {order.itemPhoto ? (
                            <img
                              src={order.itemPhoto}
                              alt={order.itemTitle || "Item"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Shirt size={14} className="text-neutral-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.buyer?.facebookName || "—"}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {order.itemTitle || order.itemId}
                      </TableCell>
                      <TableCell className="tabular-nums font-semibold">
                        ₱{order.salePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <FulfillmentBadge status={order.fulfillmentStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {order.paymentMethod || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-400 whitespace-nowrap">
                        {timeAgo(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.paymentStatus === "Unpaid" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleMarkPaid(order.id)}
                            >
                              Pay
                            </Button>
                          )}
                          {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleAdvanceFulfillment(order.id, "Packed")}
                            >
                              Pack
                            </Button>
                          )}
                          {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Packed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleAdvanceFulfillment(order.id, "Shipped")}
                            >
                              Ship
                            </Button>
                          )}
                          {order.paymentStatus === "Paid" && order.fulfillmentStatus === "Shipped" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleAdvanceFulfillment(order.id, "Delivered")}
                            >
                              Deliver
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          >
                            {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Inline detail row */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-0">
                          <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-5">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                              {/* Sale info */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                  Sale
                                </h4>
                                <div className="grid grid-cols-2 gap-1.5 text-sm">
                                  <span className="text-neutral-500">Source</span>
                                  <span className="text-neutral-900">{order.source}</span>
                                  <span className="text-neutral-500">Created</span>
                                  <span className="text-neutral-900">{formatDate(order.createdAt)}</span>
                                  <span className="text-neutral-500">SKU</span>
                                  <span className="text-neutral-900 font-mono text-xs">{order.itemId}</span>
                                </div>
                              </div>

                              {/* Buyer info */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                  Buyer
                                </h4>
                                {order.buyer ? (
                                  <div className="grid grid-cols-2 gap-1.5 text-sm">
                                    <span className="text-neutral-500">Name</span>
                                    <span className="text-neutral-900">{order.buyer.facebookName}</span>
                                    {order.buyer.phone && (
                                      <>
                                        <span className="text-neutral-500">Phone</span>
                                        <span className="text-neutral-900">{order.buyer.phone}</span>
                                      </>
                                    )}
                                    {order.buyer.messengerUrl && (
                                      <>
                                        <span className="text-neutral-500">Messenger</span>
                                        <a
                                          href={order.buyer.messengerUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-700 text-xs truncate"
                                        >
                                          {order.buyer.messengerUrl.replace("https://", "")}
                                        </a>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-neutral-400 italic">No buyer assigned</p>
                                )}
                              </div>

                              {/* Payment & Fulfillment */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                  Payment & Fulfillment
                                </h4>
                                <div className="grid grid-cols-2 gap-1.5 text-sm">
                                  <span className="text-neutral-500">Payment</span>
                                  <PaymentBadge status={order.paymentStatus} />
                                  <span className="text-neutral-500">Fulfillment</span>
                                  <FulfillmentBadge status={order.fulfillmentStatus} />
                                  <span className="text-neutral-500">Paid at</span>
                                  <span className="text-neutral-900">{formatDate(order.paidAt)}</span>
                                  <span className="text-neutral-500">Shipped at</span>
                                  <span className="text-neutral-900">{formatDate(order.shippedAt)}</span>
                                  <span className="text-neutral-500">Delivered at</span>
                                  <span className="text-neutral-900">{formatDate(order.deliveredAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Photo lightbox */}
      {lightboxSrc && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => setLightboxSrc(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxSrc}
              alt="Item photo"
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </>
      )}
    </div>
  );
}
