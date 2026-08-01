"use client";

import { useState, useEffect } from "react";
import { Buyer, OrderWithDetails } from "@/lib/types";
import { fetchOrdersWithDetails, updateBuyer } from "@/lib/orders";
import { PaymentBadge } from "@/components/PaymentBadge";
import { FulfillmentBadge } from "@/components/FulfillmentBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Phone,
  ExternalLink,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface BuyerDetailProps {
  buyer: Buyer;
  userId: string;
  onBack: () => void;
}

export function BuyerDetail({ buyer, userId, onBack }: BuyerDetailProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(buyer.phone || "");
  const [messenger, setMessenger] = useState(buyer.messengerUrl || "");
  const [notes, setNotes] = useState(buyer.notes || "");

  useEffect(() => {
    fetchOrdersWithDetails(userId).then((allOrders) => {
      setOrders(allOrders.filter((o) => o.buyerId === buyer.id));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer.id]);

  async function handleSave() {
    await updateBuyer(buyer.id, {
      phone: phone.trim() || undefined,
      messengerUrl: messenger.trim() || undefined,
      notes: notes.trim(),
    });
    setEditing(false);
    toast.success("Buyer updated", { description: "Profile saved successfully." });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white shrink-0">
            {buyer.facebookName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">
              {buyer.facebookName}
            </h3>
            <p className="text-xs text-neutral-400">
              Added {new Date(buyer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={handleSave}
            >
              <Save size={14} className="mr-1" />
              Save
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {editing ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917-123-4567"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Messenger URL</label>
                <Input
                  value={messenger}
                  onChange={(e) => setMessenger(e.target.value)}
                  placeholder="https://m.me/username"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Notes</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Repeat buyer, prefers L size..."
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {buyer.phone && (
                <>
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Phone size={12} /> Phone
                  </span>
                  <span className="text-neutral-900">{buyer.phone}</span>
                </>
              )}
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
              {buyer.notes && (
                <>
                  <span className="text-neutral-500">Notes</span>
                  <span className="text-neutral-900">{buyer.notes}</span>
                </>
              )}
              {!buyer.phone && !buyer.messengerUrl && !buyer.notes && (
                <p className="col-span-2 text-neutral-400 italic">No additional info</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">
          Order History ({orders.length})
        </h4>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4">No orders for this buyer yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {o.itemTitle || o.itemId}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PaymentBadge status={o.paymentStatus} />
                  <FulfillmentBadge status={o.fulfillmentStatus} />
                  <span className="text-sm font-semibold tabular-nums text-neutral-900">
                    ₱{o.salePrice.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
