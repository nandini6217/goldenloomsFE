'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, LogOut, Menu, X, Heart, GitCompare } from 'lucide-react';
import { getCompareIds } from '@/lib/compare';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { setAuthToken } from '@/lib/api';
import { MegaMenu } from '@/components/MegaMenu';
import { MobileShopAccordion } from '@/components/MobileShopAccordion';
import { BRAND_NAME } from '@/config/constants';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const items = useCartStore((s) => s.items);
  const count = mounted ? items.reduce((c, i) => c + i.qty, 0) : 0;
  const { user, isLoggedIn, logout } = useAuthStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    setCompareCount(getCompareIds().length);
    const onStorage = () => setCompareCount(getCompareIds().length);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [mounted]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div className="container-custom mx-auto flex h-14 min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-primary sm:text-xl shrink-0"
          onClick={closeMobileMenu}
        >
          {BRAND_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex md:gap-6">
          <MegaMenu />
          <Link href="/compare" className="flex items-center gap-1 text-primary hover:text-accent" title="Compare">
            <GitCompare className="h-5 w-5" />
            {compareCount > 0 && (
              <span className="text-xs font-medium text-primary/80">({compareCount})</span>
            )}
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1 text-primary hover:text-accent">
            {mounted ? <ShoppingBag className="h-5 w-5" /> : <span className="inline-block h-5 w-5 shrink-0" aria-hidden />}
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
                {count}
              </span>
            )}
          </Link>
          {mounted && isLoggedIn() && (
            <Link href="/wishlist" className="flex items-center gap-1 text-primary hover:text-accent" title="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          )}
          {/* Auth UI only after mount to avoid hydration mismatch (auth comes from persisted store) */}
          {!mounted ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="accent">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          ) : isLoggedIn() ? (
            <>
              <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent">
                <User className="h-4 w-4" />
                My Orders
              </Link>
              <Link href="/account" className="text-sm text-primary/70 hover:text-accent hidden sm:inline">
                {user?.name}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { setAuthToken(null); logout(); }} className="text-primary/70">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="accent">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/login">Admin</Link>
          </Button>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-2 text-primary hover:bg-primary/5 hover:text-accent"
            aria-label="Cart"
            onClick={closeMobileMenu}
          >
            {mounted ? <ShoppingBag className="h-5 w-5" /> : <span className="inline-block h-5 w-5 shrink-0" aria-hidden />}
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 p-0 text-primary"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-t border-primary/10 bg-white md:hidden">
          <nav className="container-custom mx-auto flex flex-col gap-0 px-4 py-3 sm:px-6">
            <MobileShopAccordion onLinkClick={closeMobileMenu} />
            <MobileNavLink href="/cart" onClick={closeMobileMenu} className="flex items-center gap-2">
              {mounted ? <ShoppingBag className="h-4 w-4 shrink-0" /> : <span className="inline-block h-4 w-4 shrink-0" aria-hidden />}
              Cart
              {count > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
                  {count}
                </span>
              )}
            </MobileNavLink>
            {mounted && isLoggedIn() && (
              <MobileNavLink href="/orders" onClick={closeMobileMenu}>
                <User className="h-4 w-4" />
                My Orders
              </MobileNavLink>
            )}
            {mounted && isLoggedIn() && (
              <MobileNavLink href="/wishlist" onClick={closeMobileMenu}>
                <Heart className="h-4 w-4" />
                Wishlist
              </MobileNavLink>
            )}
            {mounted && isLoggedIn() && (
              <div className="border-t border-primary/10 px-3 py-2 text-sm text-primary/70">
                {user?.name}
              </div>
            )}
            {!mounted ? (
              <>
                <MobileNavLink href="/login" onClick={closeMobileMenu}>
                  Log in
                </MobileNavLink>
                <MobileNavLink href="/register" onClick={closeMobileMenu}>
                  Sign up
                </MobileNavLink>
              </>
            ) : isLoggedIn() ? (
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-primary/5"
                onClick={() => { setAuthToken(null); logout(); closeMobileMenu(); }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={closeMobileMenu}>
                  Log in
                </MobileNavLink>
                <MobileNavLink href="/register" onClick={closeMobileMenu}>
                  Sign up
                </MobileNavLink>
              </>
            )}
            <MobileNavLink href="/admin/login" onClick={closeMobileMenu} className="border-t border-primary/10">
              Admin
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
  className = '',
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 ${className}`}
    >
      {children}
    </Link>
  );
}
