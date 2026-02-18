'use client';

import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const { user, token, setAuth, logout, isLoggedIn } = useAuthStore();
  return { user, token, setAuth, logout, isLoggedIn };
}
