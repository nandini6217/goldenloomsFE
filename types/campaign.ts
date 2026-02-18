import type { ProductFromApi } from './product';

export type CampaignFromApi = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  bannerImage?: string | null;
  productIds: string[];
  couponCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignWithProducts = CampaignFromApi & {
  products: (ProductFromApi & { avgRating?: number; reviewCount?: number })[];
};
