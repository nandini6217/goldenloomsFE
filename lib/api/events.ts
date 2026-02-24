import { api } from '../api-client';

export type TrackEventPayload =
  | { event: 'product_view'; productId: string; productName?: string; category?: string; source?: string }
  | { event: 'add_to_cart'; productId: string; productName?: string; category?: string; qty: number; source?: string }
  | { event: 'add_to_wishlist'; productId: string; productName?: string; category?: string; source?: string }
  | { event: 'product_zoom'; productId: string; productName?: string; category?: string; source?: string }
  | { event: 'view_full_details'; productId: string; productName?: string; category?: string; source?: string };

export const eventsApi = {
  track: (payload: TrackEventPayload) =>
    api.post('/events', payload).then(() => {}).catch(() => {}),
};
