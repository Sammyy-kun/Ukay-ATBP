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
