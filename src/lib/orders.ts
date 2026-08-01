import { Buyer, Order, OrderWithDetails } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// ── Buyer row mappers ──────────────────────────────────────────────────────

export function buyerFromRow(row: Record<string, unknown>): Buyer {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    facebookName: row.facebook_name as string,
    messengerUrl: (row.messenger_url as string) || undefined,
    phone: (row.phone as string) || undefined,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function buyerToRow(buyer: Partial<Buyer>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (buyer.userId !== undefined) row.user_id = buyer.userId;
  if (buyer.facebookName !== undefined) row.facebook_name = buyer.facebookName;
  if (buyer.messengerUrl !== undefined) row.messenger_url = buyer.messengerUrl;
  if (buyer.phone !== undefined) row.phone = buyer.phone;
  if (buyer.notes !== undefined) row.notes = buyer.notes;
  row.updated_at = new Date().toISOString();
  return row;
}

// ── Order row mappers ──────────────────────────────────────────────────────

export function orderFromRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    itemId: row.item_id as string,
    buyerId: (row.buyer_id as string) || undefined,
    salePrice: Number(row.sale_price),
    paymentStatus: row.payment_status as Order["paymentStatus"],
    paymentMethod: (row.payment_method as string) || undefined,
    paymentReference: (row.payment_reference as string) || undefined,
    paidAt: (row.paid_at as string) || undefined,
    refundedAt: (row.refunded_at as string) || undefined,
    fulfillmentStatus: row.fulfillment_status as Order["fulfillmentStatus"],
    shippedAt: (row.shipped_at as string) || undefined,
    deliveredAt: (row.delivered_at as string) || undefined,
    trackingNumber: (row.tracking_number as string) || undefined,
    source: (row.source as Order["source"]) || "Facebook",
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function orderToRow(order: Partial<Order>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (order.userId !== undefined) row.user_id = order.userId;
  if (order.itemId !== undefined) row.item_id = order.itemId;
  if (order.buyerId !== undefined) row.buyer_id = order.buyerId;
  if (order.salePrice !== undefined) row.sale_price = order.salePrice;
  if (order.paymentStatus !== undefined) row.payment_status = order.paymentStatus;
  if (order.paymentMethod !== undefined) row.payment_method = order.paymentMethod;
  if (order.paymentReference !== undefined) row.payment_reference = order.paymentReference;
  if (order.paidAt !== undefined) row.paid_at = order.paidAt;
  if (order.refundedAt !== undefined) row.refunded_at = order.refundedAt;
  if (order.fulfillmentStatus !== undefined) row.fulfillment_status = order.fulfillmentStatus;
  if (order.shippedAt !== undefined) row.shipped_at = order.shippedAt;
  if (order.deliveredAt !== undefined) row.delivered_at = order.deliveredAt;
  if (order.trackingNumber !== undefined) row.tracking_number = order.trackingNumber;
  if (order.source !== undefined) row.source = order.source;
  if (order.notes !== undefined) row.notes = order.notes;
  row.updated_at = new Date().toISOString();
  return row;
}

// ── Supabase helpers ───────────────────────────────────────────────────────

export async function fetchOrdersWithDetails(userId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, buyers(*), items(title, photos)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => {
    const order = orderFromRow(row);
    const buyerRow = row.buyers as Record<string, unknown> | null;
    const itemRow = row.items as Record<string, unknown> | null;
    return {
      ...order,
      buyer: buyerRow ? buyerFromRow(buyerRow) : undefined,
      itemTitle: (itemRow?.title as string) || undefined,
      itemPhoto: Array.isArray(itemRow?.photos) && (itemRow.photos as string[]).length > 0
        ? (itemRow.photos as string[])[0]
        : undefined,
    };
  });
}

export async function fetchBuyers(userId: string): Promise<Buyer[]> {
  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .eq("user_id", userId)
    .order("facebook_name", { ascending: true });

  if (error || !data) return [];
  return data.map(buyerFromRow);
}

export async function createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .insert(orderToRow(order))
    .select()
    .single();

  if (error || !data) return null;
  return orderFromRow(data);
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update(orderToRow(patch))
    .eq("id", id);

  if (error) console.error("Error updating order:", error);
}

export async function createBuyer(buyer: Omit<Buyer, "id" | "createdAt" | "updatedAt">): Promise<Buyer | null> {
  const { data, error } = await supabase
    .from("buyers")
    .insert(buyerToRow(buyer))
    .select()
    .single();

  if (error || !data) return null;
  return buyerFromRow(data);
}

export async function updateBuyer(id: string, patch: Partial<Buyer>): Promise<void> {
  const { error } = await supabase
    .from("buyers")
    .update(buyerToRow(patch))
    .eq("id", id);

  if (error) console.error("Error updating buyer:", error);
}

export async function deleteBuyer(id: string): Promise<void> {
  const { error } = await supabase.from("buyers").delete().eq("id", id);
  if (error) console.error("Error deleting buyer:", error);
}
