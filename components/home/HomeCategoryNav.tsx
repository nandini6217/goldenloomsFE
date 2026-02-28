'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export const LEVEL1 = [
  { id: 'all', label: 'All', mobileLabel: 'All' },
  { id: 'resin', label: 'Resin', mobileLabel: 'Men', apiCategory: 'RESIN' as const },
  { id: 'woollen', label: 'Handloom', mobileLabel: 'Women', apiCategory: 'HANDLOOM' as const },
  { id: 'others', label: 'Others', mobileLabel: 'Other', apiCategory: 'OTHERS' as const },
] as const;

type Level1Id = (typeof LEVEL1)[number]['id'];

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  images?: string[];
};

export function useHomeCategoryParams() {
  const searchParams = useSearchParams();
  const primary = (searchParams.get('primary') as Level1Id) || 'all';
  return { primary };
}

export function setHomeCategoryParams(router: ReturnType<typeof useRouter>, primary: Level1Id) {
  const p = new URLSearchParams();
  if (primary !== 'all') p.set('primary', primary);
  router.push(p.toString() ? `/?${p.toString()}` : '/');
}

/** Shared chip styles for Level 1 category row (used in Header on mobile and here on desktop). */
export const HOME_CATEGORY_CHIP_STYLES = {
  base: 'home-category-nav-chip shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  active: 'border-primary bg-primary text-white shadow-sm',
  inactive: 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
} as const;

/** Tab-style styles for mobile Level 1 category row: text labels + underline for active. */
export const HOME_CATEGORY_TAB_STYLES = {
  container: 'flex justify-center gap-10 sm:gap-12 overflow-x-auto overflow-y-hidden px-1 scrollbar-hide',
  tab: 'shrink-0 px-1 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 pb-2 -mb-px',
  active: 'text-primary border-b-2 border-primary',
  inactive: 'text-neutral-600 hover:text-primary/80 border-b-2 border-transparent',
} as const;

/** Search bar + Level 1 category chips. Place above hero. */
export function HomeCategoryNav() {
  const router = useRouter();
  const { primary } = useHomeCategoryParams();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    const categoryParam =
      primary === 'resin' ? 'RESIN' : primary === 'woollen' ? 'HANDLOOM' : primary === 'others' ? 'OTHERS' : undefined;
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (categoryParam) params.set('category', categoryParam);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const { base: chipBase, active: chipActive, inactive: chipInactive } = HOME_CATEGORY_CHIP_STYLES;

  return (
    <div className="home-category-nav max-w-[1440px] mx-auto px-2 space-y-2 md:space-y-3 py-2 md:py-3">
      {/* Search bar: hidden; use header search instead */}
      <form
        onSubmit={handleSearch}
        className="home-category-nav-search hidden flex w-full items-center gap-2 rounded-xl bg-neutral-100 px-3.5 py-2 md:rounded-2xl md:px-4 md:py-2.5"
      >
        <Search className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-neutral-500" aria-hidden />
        <input
          type="search"
          placeholder="Search for products, resin, woollen..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="home-category-nav-input min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-neutral-500"
          aria-label="Search products"
        />
      </form>

      {/* Level 1: compact pill filters (desktop only; on mobile shown in Header below search) */}
      <div
        className="home-category-nav-level1 -mx-1 hidden justify-center gap-1.5 overflow-x-auto overflow-y-hidden pb-0.5 pt-0.5 md:mx-0 md:flex md:flex-wrap md:justify-start md:gap-2 scrollbar-hide"
        aria-label="Filter by category"
      >
        {LEVEL1.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setHomeCategoryParams(router, item.id)}
            className={`${chipBase} ${primary === item.id ? chipActive : chipInactive}`}
            aria-pressed={primary === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Product grid with section heading. Place below hero. */
export function HomeDashboardProducts() {
  const { primary } = useHomeCategoryParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryParam =
    primary === 'resin' ? 'RESIN' : primary === 'woollen' ? 'HANDLOOM' : primary === 'others' ? 'OTHERS' : undefined;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi
      .list({ category: categoryParam })
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="home-category-nav-dashboard container-custom md:px-4 space-y-6 py-8 md:py-12 lg:py-16">
      {/* Myntra-style section heading: bold uppercase + CTA */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-primary sm:text-2xl md:text-2xl lg:text-3xl">
          Picks for you
        </h2>
        <Link
          href="/wishlist"
          className="home-category-nav-cta inline-flex items-center gap-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-accent/90"
        >
          Wishlist now
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-neutral-200">
              <div className="aspect-[3/4] bg-neutral-100" />
              <CardContent className="p-3">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-neutral-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          No products match this selection. Try another category.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <HomeProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Single product card: Myntra-style (image, name, strikethrough price, discount %, heart) */
function HomeProductCard({ product: p }: { product: Product }) {
  const hasDiscount =
    p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price;
  const discountPct = hasDiscount
    ? Math.round((1 - (p.discountedPrice ?? 0) / p.price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${p._id}`}
      className="home-category-nav-card group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
        {p.images?.[0] ? (
          <img
            src={p.images[0] as string}
            alt={p.name}
            className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
        {hasDiscount && discountPct > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-white">
            {discountPct}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 font-medium text-primary text-sm">{p.name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-primary">
            ₹{(hasDiscount ? p.discountedPrice : p.price)?.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-500 line-through">
              ₹{p.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
