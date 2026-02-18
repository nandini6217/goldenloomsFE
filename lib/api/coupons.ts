import { api } from '../api-client';
import type { CouponFromApi } from '@/types';

export type { CouponFromApi };

export const couponsApi = {
  validate: (code: string, total: number) =>
    api.post('/coupons/validate', { code, total }).then((r) => r.data as { valid: boolean; message: string; discount: number; finalTotal: number }),
  list: () => api.get('/coupons').then((r) => r.data as CouponFromApi[]),
  get: (id: string) => api.get(`/coupons/${id}`).then((r) => r.data as CouponFromApi),
  create: (data: {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrder?: number;
    validFrom?: string;
    validTo?: string;
    usageLimit?: number;
  }) => api.post('/coupons', data).then((r) => r.data as CouponFromApi),
  update: (
    id: string,
    data: {
      code: string;
      type: 'PERCENTAGE' | 'FIXED';
      value: number;
      minOrder?: number;
      validFrom?: string;
      validTo?: string;
      usageLimit?: number;
    }
  ) => api.put(`/coupons/${id}`, data).then((r) => r.data as CouponFromApi),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};
