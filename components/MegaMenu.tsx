'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { productsApi, campaignsApi, type ProductFromApi, type CampaignFromApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    id: 'RESIN',
    name: 'Resin Collection',
    description: 'Elegant handcrafted resin jewelry',
    href: '/products?category=RESIN',
    image: 'https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg',
  },
  {
    id: 'HANDLOOM',
    name: 'Woolen Handloom Collection',
    description: 'Traditional handloom heritage',
    href: '/products?category=HANDLOOM',
    image: 'https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934',
  },
  {
    id: 'OTHERS',
    name: 'Others Collection',
    description: 'More handcrafted picks',
    href: '/products?category=OTHERS',
    image: 'https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg',
  },
] as const;

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignFromApi[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductFromApi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openMenu = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
    if (!loaded) {
      Promise.all([
        campaignsApi.listActive().then(setCampaigns).catch(() => setCampaigns([])),
        productsApi.list({ featured: true }).then((data) => setFeaturedProducts((data as ProductFromApi[]).slice(0, 4))).catch(() => setFeaturedProducts([])),
      ]).finally(() => setLoaded(true));
    }
  }, [loaded]);

  const closeMenu = useCallback((delay = 0) => {
    if (delay > 0) {
      closeTimeoutRef.current = setTimeout(() => setOpen(false), delay);
    } else {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setOpen(false);
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu(0);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeMenu]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleTriggerClick = () => {
    if (open) closeMenu(0);
    else openMenu();
  };

  const handlePanelMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePanelMouseLeave = () => {
    closeMenu(150);
  };

  const handleTriggerBlur = () => {
    if (!panelRef.current?.contains(document.activeElement)) {
      closeMenu(150);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        onBlur={handleTriggerBlur}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="mega-menu-panel"
        id="mega-menu-trigger"
        className={cn(
          'text-sm font-medium text-primary hover:text-accent flex items-center gap-0.5 rounded-md px-1 py-0.5',
          open && 'text-accent'
        )}
      >
        Shop
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="mega-menu-panel"
          role="dialog"
          aria-label="Shop menu"
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
          onBlur={handleTriggerBlur}
          className="absolute left-0 top-full pt-2 z-[100]"
        >
          <div className="bg-white border border-primary/10 rounded-xl shadow-lg overflow-hidden min-w-[320px] max-w-[90vw] w-[720px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
              {/* Column 1: Categories */}
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-primary/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3">Collections</p>
                <ul className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={cat.href}
                        className="group flex gap-3 rounded-lg p-2 -mx-2 hover:bg-primary/5 transition-colors"
                        onClick={() => closeMenu(0)}
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 bg-primary/10">
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-primary group-hover:text-accent">{cat.name}</p>
                          <p className="text-xs text-primary/70">{cat.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-primary/10 space-y-1">
                  <Link
                    href="/products"
                    className="block text-sm font-medium text-primary hover:text-accent py-1"
                    onClick={() => closeMenu(0)}
                  >
                    Shop all
                  </Link>
                  <Link
                    href="/products?featured=true"
                    className="block text-sm font-medium text-primary hover:text-accent py-1"
                    onClick={() => closeMenu(0)}
                  >
                    Featured
                  </Link>
                </div>
              </div>

              {/* Column 2: Campaigns */}
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-primary/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3">Current offers</p>
                {campaigns.length === 0 && !loaded ? (
                  <p className="text-sm text-primary/60">Loading…</p>
                ) : campaigns.length === 0 ? (
                  <p className="text-sm text-primary/60">No active campaigns</p>
                ) : (
                  <ul className="space-y-2">
                    {campaigns.map((c) => (
                      <li key={c._id}>
                        <Link
                          href={`/campaigns/${c.slug}`}
                          className="block text-sm font-medium text-primary hover:text-accent py-1.5 rounded-md -mx-2 px-2 hover:bg-primary/5"
                          onClick={() => closeMenu(0)}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Column 3: Featured products */}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/60 mb-3">Featured</p>
                {featuredProducts.length === 0 && !loaded ? (
                  <p className="text-sm text-primary/60">Loading…</p>
                ) : featuredProducts.length === 0 ? (
                  <Link
                    href="/products?featured=true"
                    className="text-sm font-medium text-accent hover:underline"
                    onClick={() => closeMenu(0)}
                  >
                    View featured
                  </Link>
                ) : (
                  <ul className="space-y-2">
                    {featuredProducts.map((p) => (
                      <li key={p._id}>
                        <Link
                          href={`/products/${p._id}`}
                          className="group flex gap-2 rounded-lg p-2 -mx-2 hover:bg-primary/5 transition-colors"
                          onClick={() => closeMenu(0)}
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-primary/10">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-primary/40 text-xs">—</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary group-hover:text-accent truncate">{p.name}</p>
                            {p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price ? (
                              <p className="text-xs">
                                <span className="text-accent font-semibold">₹{p.discountedPrice}</span>
                                <span className="text-primary/50 line-through ml-1">₹{p.price}</span>
                              </p>
                            ) : (
                              <p className="text-xs text-accent font-medium">₹{p.price}</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
