'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAuthToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const returnTo = searchParams.get('returnTo') || '/';
    const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/';

    if (!token) {
      setStatus('error');
      setMessage('Missing token. Please try signing in again.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setAuthToken(token);
        const me = await authApi.me();
        if (cancelled) return;
        if (me.role === 'customer' && me.userId) {
          setAuth(token, {
            id: me.userId,
            name: me.name ?? '',
            email: me.email ?? '',
            phone: me.phone ?? '',
          });
        }
        setStatus('done');
        router.replace(safeReturnTo);
        router.refresh();
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage('Could not complete sign-in. Please try again.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setAuth, router]);

  if (status === 'error') {
    return (
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <a href="/login" className="text-accent font-medium hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="container-custom py-16 max-w-md mx-auto text-center">
      <p className="text-primary/80">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-16 max-w-md mx-auto text-center">
        <p className="text-primary/80">Completing sign-in…</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
