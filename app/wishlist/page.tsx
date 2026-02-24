'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { wishlistApi, type ProductFromApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?returnTo=${encodeURIComponent('/wishlist')}`);
      return;
    }
    wishlistApi
      .get()
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  const remove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isLoggedIn()) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">Wishlist</h1>

      {loading ? (
        <p className="text-primary/70">Loading...</p>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center max-w-md">
          <p className="text-primary/80 mb-4">Your wishlist is empty.</p>
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => {
            const hasDiscount =
              p.discountedPrice != null &&
              p.discountedPrice > 0 &&
              p.discountedPrice < p.price;
            const discountPct = hasDiscount
              ? Math.round((1 - (p.discountedPrice ?? 0) / p.price) * 100)
              : 0;
            return (
              <Card
                key={p._id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
              >
                <Link href={`/products/${p._id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
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
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    remove(p._id);
                  }}
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4 text-primary" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
