export type ItemCategory = 
  | 'Tops' 
  | 'Bottoms' 
  | 'Dresses' 
  | 'Outerwear' 
  | 'Bags' 
  | 'Shoes' 
  | 'Accessories' 
  | 'Other';

export type ItemSize = 
  | 'XS' 
  | 'S' 
  | 'M' 
  | 'L' 
  | 'XL' 
  | 'XXL' 
  | 'Free Size';

export type ItemCondition = 
  | 'Like New' 
  | 'Good' 
  | 'Fair' 
  | 'With Flaws';

export type ItemStatus = 'Available' | 'Reserved' | 'Sold';

export type PaymentMethod = 'GCash' | 'Cash on Delivery' | 'In-Store Pickup';

export interface Item {
  id: string;
  photos: string[];
  category: ItemCategory;
  size: ItemSize;
  condition: ItemCondition;
  price: number;
  status: ItemStatus;
  SKU: string;
  date_added: string;
  date_sold?: string;
  sold_price?: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface ReservationOrder {
  id: string;
  itemId: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}
