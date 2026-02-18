'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi, wishlistApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/product/ProductPrice';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { QuickViewModal } from '@/components/QuickViewModal';
import { addToCompare, getCompareIds, removeFromCompare } from '@/lib/compare';

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
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
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
        category: category === 'RESIN' || category === 'HANDLOOM' ? category : undefined,
        sort: sort === 'price_asc' || sort === 'price_desc' ? sort : undefined,
        minPrice: minPrice != null && !Number.isNaN(minPrice) ? minPrice : undefined,
        maxPrice: maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
      })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort, minPrice, maxPrice]);

  const searchUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (category) p.set('category', category);
    if (sort) p.set('sort', sort);
    if (minPriceInput.trim()) p.set('minPrice', minPriceInput.trim());
    if (maxPriceInput.trim()) p.set('maxPrice', maxPriceInput.trim());
    return p.toString() ? `?${p.toString()}` : '';
  }, [searchInput, category, sort, minPriceInput, maxPriceInput]);

  const linkParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (sort) p.set('sort', sort);
    if (minPriceParam) p.set('minPrice', minPriceParam);
    if (maxPriceParam) p.set('maxPrice', maxPriceParam);
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [search, sort, minPriceParam, maxPriceParam]);

  const sortLink = (newSort: string) => {
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    if (search) p.set('search', search);
    if (minPriceParam) p.set('minPrice', minPriceParam);
    if (maxPriceParam) p.set('maxPrice', maxPriceParam);
    p.set('sort', newSort);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="container-custom py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: category ? '/products' : undefined },
          ...(category ? [{ label: category }] : []),
        ]}
        className="mb-6"
      />
      <h1 className="font-display text-3xl font-semibold text-primary mb-8">Shop All</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <form
          className="flex flex-wrap gap-2 flex-1 max-w-2xl items-end"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/products${searchUrl}`;
          }}
        >
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-[120px]"
          />
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              placeholder="Min ₹"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-24"
            />
            <span className="text-primary/50">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Max ₹"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-24"
            />
          </div>
          <Button type="submit">Apply</Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          <Button
            asChild
            variant={!category ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={linkParams ? `/products${linkParams}` : '/products'}>
              All
            </Link>
          </Button>
          <Button
            asChild
            variant={category === 'RESIN' ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={`/products?category=RESIN${linkParams ? linkParams.replace('?', '&') : ''}`}>
              Resin
            </Link>
          </Button>
          <Button
            asChild
            variant={category === 'HANDLOOM' ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={`/products?category=HANDLOOM${linkParams ? linkParams.replace('?', '&') : ''}`}>
              Handloom
            </Link>
          </Button>
          <span className="w-px bg-primary/20 self-stretch hidden sm:block" />
          <Button
            asChild
            variant={sort === 'price_asc' ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={sortLink('price_asc')}>Price ↑</Link>
          </Button>
          <Button
            asChild
            variant={sort === 'price_desc' ? 'default' : 'outline'}
            size="sm"
          >
            <Link href={sortLink('price_desc')}>Price ↓</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-secondary/50 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 bg-primary/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-primary/10 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-primary/70 py-12 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="overflow-hidden transition-shadow hover:shadow-soft-hover h-full relative group">
              <Link href={`/products/${p._id}`} className="block">
                <div className="aspect-square bg-secondary/50 flex items-center justify-center text-primary/40 text-sm relative">
                  {p.stock !== undefined && p.stock <= 0 && (
                    <span className="absolute inset-0 bg-primary/60 flex items-center justify-center z-10 text-white font-semibold text-sm uppercase tracking-wide">
                      Out of stock
                    </span>
                  )}
                  {p.stock !== undefined && p.stock > 0 && p.stock <= 5 && (
                    <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
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
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white/90 shadow text-primary/70 hover:bg-white hover:text-red-500"
                      aria-label={wishlistIds.has(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {wishlistIds.has(p._id) ? (
                        <span className="text-red-500">❤</span>
                      ) : (
                        <span>♡</span>
                      )}
                    </button>
                  )}
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0] as string}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    'No image'
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-display font-semibold text-primary">{p.name}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {p.avgRating != null && p.avgRating > 0 && (
                      <span className="text-amber-600 text-sm">★ {p.avgRating}</span>
                    )}
                    {p.reviewCount != null && p.reviewCount > 0 && (
                      <span className="text-primary/60 text-xs">({p.reviewCount})</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <ProductPrice
                      price={p.price}
                      discountedPrice={p.discountedPrice}
                      expectedDeliveryTime={p.expectedDeliveryTime}
                      compact
                      showDelivery
                    />
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
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
      <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
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
