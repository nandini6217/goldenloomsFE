import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type AuthStore = {
  token: string | null;
  user: CustomerUser | null;
  setAuth: (token: string, user: CustomerUser) => void;
  setUser: (user: CustomerUser) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

const CUSTOMER_TOKEN_KEY = 'goldenlooms_customer_token';
const CUSTOMER_USER_KEY = 'goldenlooms_customer_user';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'goldenlooms_auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().token;
}

export function getCustomerUser(): CustomerUser | null {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().user;
}
