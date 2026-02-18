import { api } from '../api-client';
import type { Order } from '@/types';

export type { Order };

export const ordersApi = {
  create: (data: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    addressCity?: string;
    addressState?: string;
    addressPincode?: string;
    items: { productId: string; qty: number }[];
    couponCode?: string;
  }) => api.post('/orders', data).then((r) => r.data as { orderId: string }),
  get: (id: string) => api.get(`/orders/${id}`).then((r) => r.data as Order),
  getMyOrders: () => api.get('/orders/me').then((r) => r.data),
  list: () => api.get('/orders').then((r) => r.data),
  updateStatus: (id: string, status: string, opts?: { trackingId?: string; trackingUrl?: string }) =>
    api.put(`/orders/${id}/status`, { status, ...opts }).then((r) => r.data),
  bulkUpdateStatus: (orderIds: string[], status: string) =>
    api.put('/orders/bulk-status', { orderIds, status }).then((r) => r.data),
  createRazorpayOrder: (orderId: string) =>
    api
      .post(`/orders/${orderId}/create-razorpay-order`)
      .then((r) => r.data as { razorpayOrderId: string; keyId: string }),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`).then((r) => r.data),
};
