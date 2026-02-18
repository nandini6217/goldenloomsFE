'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Button } from '@/components/ui/button';
import { setAdminToken } from '@/lib/auth';
import { setAuthToken } from '@/lib/api';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/campaigns', label: 'Campaigns' },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <>{children}</>;
  }

  const logout = () => {
    setAdminToken(null);
    setAuthToken(null);
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-secondary/20">
        <header className="border-b border-primary/10 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <nav className="flex gap-6">
              {nav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'text-sm font-medium',
                    pathname === href ? 'text-primary' : 'text-primary/70 hover:text-primary'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </div>
    </AdminGuard>
  );
}
