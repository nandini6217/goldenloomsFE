'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi, wishlistApi } from '@/lib/api';
import { eventsApi } from '@/lib/api/events';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { QuickViewModal } from '@/components/QuickViewModal';
import { addToCompare, getCompareIds, removeFromCompare } from '@/lib/compare';
import { ProductFiltersDrawer } from '@/components/products/ProductFiltersDrawer';

const SUBCATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'HOME_DECOR', label: 'Home Decor' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'SPIRITUAL', label: 'Spiritual' },
  { value: 'GIFTS', label: 'Gifts' },
  { value: 'OTHERS', label: 'Others' },
];

const PRICE_PRESETS = [
  { id: 'under_500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500_1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { id: '1000_2000', label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { id: '2000_5000', label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { id: 'above_5000', label: 'Above ₹5,000', min: 5000, max: undefined },
];

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  isFeatured?: boolean;
  images?: string[];
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCompareIds(new Set(getCompareIds()));
  }, []);
  const refreshCompare = () => {
    if (typeof window !== 'undefined') setCompareIds(new Set(getCompareIds()));
  };

  useEffect(() => {
    if (isLoggedIn()) {
      wishlistApi.get().then((data) => setWishlistIds(new Set(data.productIds))).catch(() => {});
    }
  }, [isLoggedIn]);

  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({
        search: search || undefined,
        category: category === 'RESIN' || category === 'HANDLOOM' || category === 'OTHERS' ? category : undefined,
        subcategory: subcategory || undefined,
        sort: sort === 'price_asc' || sort === 'price_desc' || sort === 'newest' ? sort : undefined,
        minPrice: minPrice != null && !Number.isNaN(minPrice) ? minPrice : undefined,
        maxPrice: maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
      })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, subcategory, sort, minPrice, maxPrice]);

  function buildParams(overrides: Record<string, string | null> = {}) {
    const p = new URLSearchParams();
    const current: Record<string, string> = {
      search: search || '',
      category: category || '',
      subcategory: subcategory || '',
      sort: sort || '',
      minPrice: minPriceParam || '',
      maxPrice: maxPriceParam || '',
    };
    const merged = { ...current, ...overrides } as Record<string, string | null>;
    Object.entries(merged).forEach(([k, v]) => {
      if (v != null && v !== '') p.set(k, v);
    });
    return p.toString() ? `?${p.toString()}` : '';
  }

  const searchUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (category) p.set('category', category);
    if (subcategory) p.set('subcategory', subcategory);
    if (sort) p.set('sort', sort);
    if (minPriceInput.trim()) p.set('minPrice', minPriceInput.trim());
    if (maxPriceInput.trim()) p.set('maxPrice', maxPriceInput.trim());
    return p.toString() ? `?${p.toString()}` : '';
  }, [searchInput, category, subcategory, sort, minPriceInput, maxPriceInput]);

  const linkParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (subcategory) p.set('subcategory', subcategory);
    if (sort) p.set('sort', sort);
    if (minPriceParam) p.set('minPrice', minPriceParam);
    if (maxPriceParam) p.set('maxPrice', maxPriceParam);
    return p.toString() ? `?${p.toString()}` : '';
  }, [search, subcategory, sort, minPriceParam, maxPriceParam]);

  const sortLink = (newSort: string) => `/products${buildParams({ sort: newSort || null })}`;

  const urlWithoutCategory = () => `/products${buildParams({ category: null, subcategory: null })}`;
  const urlWithoutSubcategory = () => `/products${buildParams({ subcategory: null })}`;
  const urlWithoutPrice = () => `/products${buildParams({ minPrice: null, maxPrice: null })}`;
  const clearAllUrl = () => (search ? `/products?search=${encodeURIComponent(search)}` : '/products');

  const appliedFiltersCount = [category, subcategory, minPriceParam, maxPriceParam].filter(Boolean).length;

  const activePricePresetId = useMemo(() => {
    if (minPriceParam === '' && maxPriceParam === '') return null;
    const match = PRICE_PRESETS.find(
      (preset) =>
        String(preset.min) === minPriceParam &&
        (preset.max == null ? maxPriceParam === '' : String(preset.max) === maxPriceParam)
    );
    return match?.id ?? 'custom';
  }, [minPriceParam, maxPriceParam]);

  const subcategoryLabel = SUBCATEGORY_OPTIONS.find((o) => o.value === subcategory)?.label ?? subcategory;

  return (
    <div className="container-custom py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: category || subcategory ? '/products' : undefined },
          ...(category ? [{ label: category }] : []),
        ]}
        className="mb-6"
      />
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-primary mb-4">Shop All</h1>

      {/* Top bar: result count (left) | Sort dropdown + Filters button mobile (right) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-primary/70">
          {loading ? '…' : products.length === 0 ? 'No results' : `${products.length} result${products.length !== 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort-select">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => router.push(sortLink(e.target.value))}
            className="h-9 rounded-full border border-neutral-200 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold uppercase tracking-wider text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 appearance-none bg-[length:12px_12px] bg-[right_0.5rem_center] bg-no-repeat"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230F4C5C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value || 'relevance'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFiltersDrawerOpen(true)}
            className="md:hidden h-9 rounded-full px-3.5 text-xs font-semibold uppercase tracking-wider"
          >
            Filters
            {appliedFiltersCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center">
                {appliedFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Applied filters row: chips + Clear all */}
      {(category || subcategory || minPriceParam || maxPriceParam) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {category && (
            <Link
              href={urlWithoutCategory()}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {category === 'RESIN' ? 'Resin' : category === 'HANDLOOM' ? 'Handloom' : 'Others'}
              <span aria-hidden>×</span>
            </Link>
          )}
          {subcategory && (
            <Link
              href={urlWithoutSubcategory()}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {subcategoryLabel}
              <span aria-hidden>×</span>
            </Link>
          )}
          {(minPriceParam || maxPriceParam) && (
            <Link
              href={urlWithoutPrice()}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {minPriceParam && maxPriceParam
                ? `₹${minPriceParam} – ₹${maxPriceParam}`
                : minPriceParam
                  ? `From ₹${minPriceParam}`
                  : `Up to ₹${maxPriceParam}`}
              <span aria-hidden>×</span>
            </Link>
          )}
          <Link
            href={clearAllUrl()}
            className="text-xs font-semibold text-primary/70 hover:text-primary underline"
          >
            Clear all
          </Link>
        </div>
      )}

      {/* Mobile: search only - sticky below header when scrolling */}
      <div className="md:hidden sticky top-14 z-30 py-3 bg-white border-b border-primary/10 mb-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/products${searchUrl}`);
          }}
        >
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 h-9 rounded-xl text-sm"
          />
          <Button type="submit" size="sm" className="h-9 rounded-full px-3.5 text-xs font-semibold uppercase">
            Search
          </Button>
        </form>
      </div>

      {/* Desktop: search + filter strip */}
      <div className="hidden md:block mb-6 md:max-w-5xl">
        <form
          className="flex flex-wrap gap-2 items-end mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/products${searchUrl}`);
          }}
        >
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-[160px] h-9 rounded-xl text-sm"
          />
          <Button type="submit" size="sm" className="h-9 rounded-full px-3.5 text-xs font-semibold uppercase tracking-wider">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider mr-1">Category</span>
          <Link
            href={linkParams ? `/products${linkParams}` : '/products'}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${!category ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
          >
            All
          </Link>
          <Link
            href={`/products?category=RESIN${linkParams ? linkParams.replace('?', '&') : ''}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${category === 'RESIN' ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
          >
            Resin
          </Link>
          <Link
            href={`/products?category=HANDLOOM${linkParams ? linkParams.replace('?', '&') : ''}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${category === 'HANDLOOM' ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
          >
            Handloom
          </Link>
          <Link
            href={`/products?category=OTHERS${linkParams ? linkParams.replace('?', '&') : ''}`}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${category === 'OTHERS' ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
          >
            Others
          </Link>
          {(category === 'RESIN' || category === 'HANDLOOM' || category === 'OTHERS') && (
            <>
              <span className="w-px h-5 bg-neutral-200 mx-1" aria-hidden />
              <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider mr-1">Type</span>
              {SUBCATEGORY_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={`/products?category=${category}&subcategory=${opt.value}${search ? `&search=${encodeURIComponent(search)}` : ''}${sort ? `&sort=${sort}` : ''}${minPriceParam ? `&minPrice=${minPriceParam}` : ''}${maxPriceParam ? `&maxPrice=${maxPriceParam}` : ''}`}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${subcategory === opt.value ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
                >
                  {opt.label}
                </Link>
              ))}
            </>
          )}
          <span className="w-px h-5 bg-neutral-200 mx-1" aria-hidden />
          <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider mr-1">Price</span>
          {PRICE_PRESETS.map((preset) => {
            const isActive =
              activePricePresetId === preset.id ||
              (String(preset.min) === minPriceParam &&
                (preset.max == null ? maxPriceParam === '' : String(preset.max) === maxPriceParam));
            const href = `/products${buildParams({
              minPrice: String(preset.min),
              maxPrice: preset.max != null ? String(preset.max) : null,
            })}`;
            return (
              <Link
                key={preset.id}
                href={href}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${isActive ? 'border-primary bg-primary text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'}`}
              >
                {preset.label}
              </Link>
            );
          })}
          <span className="text-xs text-primary/50 ml-1">or</span>
          <form
            className="inline-flex gap-1.5 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              const p = new URLSearchParams();
              if (category) p.set('category', category);
              if (subcategory) p.set('subcategory', subcategory);
              if (search) p.set('search', search);
              if (sort) p.set('sort', sort);
              if (minPriceInput.trim()) p.set('minPrice', minPriceInput.trim());
              if (maxPriceInput.trim()) p.set('maxPrice', maxPriceInput.trim());
              router.push(`/products?${p.toString()}`);
            }}
          >
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-20 h-9 rounded-lg text-sm"
            />
            <span className="text-primary/50">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-20 h-9 rounded-lg text-sm"
            />
            <Button type="submit" size="sm" className="h-9 rounded-full px-3 text-xs">
              Go
            </Button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
              <div className="p-3">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-primary/70 py-12 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map((p) => {
            const hasDiscount =
              p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price;
            const discountPct = hasDiscount
              ? Math.round((1 - (p.discountedPrice ?? 0) / p.price) * 100)
              : 0;
            return (
              <div
                key={p._id}
                className="group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
              >
                <Link href={`/products/${p._id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
                    {p.stock !== undefined && p.stock <= 0 && (
                      <span className="absolute inset-0 z-10 flex items-center justify-center bg-primary/60 text-sm font-semibold uppercase tracking-wide text-white">
                        Out of stock
                      </span>
                    )}
                    {p.stock !== undefined && p.stock > 0 && p.stock <= 5 && (
                      <span className="absolute right-2 top-2 z-10 rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                        Low stock ({p.stock})
                      </span>
                    )}
                    {isLoggedIn() && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const inList = wishlistIds.has(p._id);
                            if (inList) {
                              await wishlistApi.remove(p._id);
                              setWishlistIds((s) => {
                                const next = new Set(s);
                                next.delete(p._id);
                                return next;
                              });
                            } else {
                              await wishlistApi.add(p._id);
                              setWishlistIds((s) => new Set(s).add(p._id));
                              eventsApi?.track?.({
                                event: 'add_to_wishlist',
                                productId: p._id,
                                productName: p.name,
                                category: p.category,
                                source: 'products_list',
                              });
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="absolute left-2 top-2 z-20 rounded-full bg-white/90 p-1.5 shadow text-primary/70 hover:bg-white hover:text-red-500"
                        aria-label={wishlistIds.has(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {wishlistIds.has(p._id) ? (
                          <span className="text-red-500">❤</span>
                        ) : (
                          <span>♡</span>
                        )}
                      </button>
                    )}
                    {hasDiscount && discountPct > 0 && (
                      <span className="absolute right-2 top-2 z-10 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-white">
                        {discountPct}% OFF
                      </span>
                    )}
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0] as string}
                        alt={p.name}
                        className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-primary">{p.name}</p>
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
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewId(p._id);
                        }}
                        className="text-sm text-accent hover:underline"
                      >
                        Quick view
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (compareIds.has(p._id)) {
                            removeFromCompare(p._id);
                          } else {
                            addToCompare(p._id);
                          }
                          refreshCompare();
                        }}
                        className="text-sm text-primary/70 hover:underline"
                      >
                        {compareIds.has(p._id) ? 'In compare' : 'Add to compare'}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
      <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />

      <ProductFiltersDrawer
        open={filtersDrawerOpen}
        onOpenChange={setFiltersDrawerOpen}
        current={{ category, subcategory, minPrice: minPriceParam, maxPrice: maxPriceParam, search: searchInput }}
        onApply={(params) => {
          const p = new URLSearchParams();
          if (params.search?.trim()) p.set('search', params.search.trim());
          if (params.category) p.set('category', params.category);
          if (params.subcategory) p.set('subcategory', params.subcategory);
          if (params.minPrice) p.set('minPrice', params.minPrice);
          if (params.maxPrice) p.set('maxPrice', params.maxPrice);
          if (sort) p.set('sort', sort);
          router.push(`/products?${p.toString()}`);
          setFiltersDrawerOpen(false);
          setSearchInput(params.search ?? '');
          setMinPriceInput(params.minPrice ?? '');
          setMaxPriceInput(params.maxPrice ?? '');
        }}
        subcategoryOptions={SUBCATEGORY_OPTIONS}
        pricePresets={PRICE_PRESETS}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-custom px-4 py-8"><p className="text-primary/70">Loading…</p></div>}>
      <ProductsContent />
    </Suspense>
  );
}
