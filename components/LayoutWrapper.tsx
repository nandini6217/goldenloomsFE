'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

import { BRAND_NAME } from '@/config/constants';

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="container-custom mx-auto flex h-14 min-h-14 flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
        <Link href="/" className="font-display text-lg font-semibold text-primary sm:text-xl shrink-0">
          {BRAND_NAME}
        </Link>
        <div className="h-9 w-16 rounded-lg bg-primary/10 animate-pulse" aria-hidden />
      </div>
    </header>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}
