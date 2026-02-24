import { api } from '../api-client';
import type { ProductFromApi } from '@/types';

export type { ProductFromApi };

export const productsApi = {
  list: (params?: {
    search?: string;
    category?: string;
    subcategory?: string;
    sort?: string;
    featured?: boolean;
    ids?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => api.get('/products', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post('/products', data).then((r) => r.data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/products/${id}`),
};
