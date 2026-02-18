export type Order = {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  totalAmount: number;
  discountAmount?: number;
  appliedCouponCode?: string;
  trackingId?: string | null;
  trackingUrl?: string | null;
  items: { productId?: string; name: string; qty: number; priceAtPurchase: number }[];
  createdAt: string;
};
