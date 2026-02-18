import { api } from '../api-client';
import type { CampaignFromApi, CampaignWithProducts } from '@/types';

export type { CampaignFromApi, CampaignWithProducts };

export const campaignsApi = {
  listActive: () => api.get('/campaigns').then((r) => r.data as CampaignFromApi[]),
  getBySlug: (slug: string) => api.get(`/campaigns/${slug}`).then((r) => r.data as CampaignWithProducts),
  listAll: () => api.get('/campaigns/all').then((r) => r.data as CampaignFromApi[]),
  get: (id: string) => api.get(`/campaigns/${id}`).then((r) => r.data as CampaignWithProducts),
  create: (data: {
    slug: string;
    name: string;
    description?: string;
    bannerImage?: string;
    productIds?: string[];
    couponCode?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) => api.post('/campaigns', data).then((r) => r.data as CampaignFromApi),
  update: (
    id: string,
    data: {
      slug: string;
      name: string;
      description?: string;
      bannerImage?: string;
      productIds?: string[];
      couponCode?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    }
  ) => api.put(`/campaigns/${id}`, data).then((r) => r.data as CampaignFromApi),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
};
