export type ProductCategory = "dream_catcher" | "tie_dye" | "diy_kit";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  dream_catcher: "Dream Catchers",
  tie_dye: "Tie-Dye",
  diy_kit: "DIY Kits",
};

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  price_cents: number;
  images: string[];
  // Made-to-order items don't track stock at all (track_stock: false) —
  // always shown as available. Stocked items track_stock: true and go
  // "Sold out" once stock_qty hits 0.
  track_stock: boolean;
  stock_qty: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  price_cents: number;
  image: string | null;
  quantity: number;
}

export type PaymentProvider = "stripe" | "square";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal_cents: number;
  total_cents: number;
  payment_provider: PaymentProvider;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  square_order_id: string | null;
  created_at: string;
}
