import { api } from '../api-client';
import type { AddressFromApi } from '@/types';

export type { AddressFromApi };

export const addressesApi = {
  list: () => api.get('/addresses').then((r) => r.data as AddressFromApi[]),
  create: (data: {
    label?: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) => api.post('/addresses', data).then((r) => r.data as AddressFromApi),
  update: (
    id: string,
    data: Partial<{
      label: string;
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
    }>
  ) => api.put(`/addresses/${id}`, data).then((r) => r.data as AddressFromApi),
  setDefault: (id: string) => api.patch(`/addresses/${id}/default`).then((r) => r.data as AddressFromApi),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};
