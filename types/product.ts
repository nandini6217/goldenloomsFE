export type ProductFromApi = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  description?: string;
  images?: string[];
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
};
