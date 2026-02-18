'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCustomerToken } from '@/store/auth-store';
import { setAuthToken } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

/** Sets the correct API token: customer token on store, admin token on admin. */
export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      setAuthToken(getAdminToken());
    } else {
      setAuthToken(getCustomerToken());
    }
  }, [isAdmin, pathname]);

  return <>{children}</>;
}
