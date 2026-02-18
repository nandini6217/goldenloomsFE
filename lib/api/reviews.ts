import { api } from '../api-client';
import type { ReviewFromApi, FeaturedReviewFromApi } from '@/types';

export type { ReviewFromApi, FeaturedReviewFromApi };

export const reviewsApi = {
  getByProduct: (productId: string) =>
    api.get(`/reviews/product/${productId}`).then((r) => r.data as { reviews: ReviewFromApi[]; avgRating: number; reviewCount: number }),
  getFeatured: (params?: { limit?: number }) =>
    api.get('/reviews/featured', { params }).then((r) => r.data as { reviews: FeaturedReviewFromApi[] }),
  create: (productId: string, data: { rating: number; comment?: string }) =>
    api.post(`/reviews/product/${productId}`, data).then((r) => r.data),
  helpful: (reviewId: string, helpful: boolean) =>
    api.post(`/reviews/${reviewId}/helpful`, { helpful }).then((r) => r.data as { helpfulYes: number; helpfulNo: number }),
};
