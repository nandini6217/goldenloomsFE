'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/auth';
import { setAuthToken } from '@/lib/api';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setAuthToken(token);
    setOk(true);
  }, [router]);

  if (ok === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary/70">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
