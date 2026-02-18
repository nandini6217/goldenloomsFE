import { api } from '../api-client';
import type { ProductFromApi } from '@/types';

export const wishlistApi = {
  get: () => api.get('/wishlist').then((r) => r.data as { productIds: string[]; products: ProductFromApi[] }),
  add: (productId: string) => api.post('/wishlist', { productId }).then((r) => r.data),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};
