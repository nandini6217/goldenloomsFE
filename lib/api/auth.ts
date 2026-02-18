const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
import { api } from '../api-client';

export { setAuthToken } from '../api-client';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  customerLogin: (email: string, password: string) =>
    api.post('/auth/customer/login', { email, password }).then((r) => r.data),
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data: { name: string; phone?: string }) =>
    api.patch('/auth/profile', data).then((r) => r.data as { name: string; email: string; phone: string }),
  getGoogleAuthUrl: (returnTo = '/') =>
    `${API_URL}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`,
};
