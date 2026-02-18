export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Golden Looms';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';

export const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CHATBOT_PRODUCT_TYPES = [
  'Resin jewelry',
  'Woolen handloom',
  'Custom resin + handloom',
  'Bulk / wholesale',
  'Other',
] as const;
