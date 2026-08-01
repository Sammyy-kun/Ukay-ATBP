export type ItemStatus = "available" | "reserved" | "sold";

export type Category = "Dress" | "Top" | "Pants" | "Jacket";
export type Size = "XS" | "S" | "M" | "L" | "XL";
export type Condition = "Like new" | "Good" | "Fair";
export type PaymentMethod = "GCash" | "Cash on pickup" | "Cash on delivery";

export interface ThriftItem {
  id: string; // SKU, e.g. "UK-0148"
  title: string;
  category: Category;
  size: Size;
  condition: Condition;
  price: number; // in PHP
  lengthInches?: number; // Chest/Length measurement in inches
  widthInches?: number; // Waist/Width measurement in inches
  status: ItemStatus;
  notes: string;
  photos: string[]; // photo URLs or base64 data URLs
  listedAt: string; // ISO date
  soldAt?: string;
  soldPrice?: number;
  paymentMethod?: PaymentMethod;
}

export interface DashboardStats {
  liveListings: number;
  soldThisWeek: number;
  reserved: number;
  revenue7d: number;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  showStorefront: boolean;
}

// ── Orders module ──────────────────────────────────────────────────────────
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";
export type FulfillmentStatus = "Pending" | "Packed" | "Shipped" | "Delivered";
export type OrderSource = "Facebook" | "TikTok" | "In-Person" | "Other";

export interface Buyer {
  id: string;
  userId: string;
  facebookName: string;
  messengerUrl?: string;
  phone?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  itemId: string;
  buyerId?: string;
  salePrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  refundedAt?: string;
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  source: OrderSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithDetails extends Order {
  buyer?: Buyer;
  itemTitle?: string;
  itemPhoto?: string;
}

// ── Expenses module ─────────────────────────────────────────────────────────
export type ExpenseCategory =
  | "Shipping"
  | "Transportation"
  | "Packaging"
  | "Supplies"
  | "Platform Fees"
  | "Other";

export interface Expense {
  id: string;
  userId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
