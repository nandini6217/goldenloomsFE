'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { wishlistApi, type ProductFromApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductPrice } from '@/components/product/ProductPrice';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="overflow-hidden flex flex-col">
              <Link href={`/products/${p._id}`} className="flex-1 flex flex-col">
                <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary/40 text-sm">No image</span>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <p className="font-display font-semibold text-primary">{p.name}</p>
                  <div className="mt-1">
                    <ProductPrice
                      price={p.price}
                      discountedPrice={p.discountedPrice}
                      expectedDeliveryTime={p.expectedDeliveryTime}
                      compact
                      showDelivery
                    />
                  </div>
                </CardContent>
              </Link>
              <div className="p-4 pt-0 flex gap-2">
                <Button asChild size="sm" variant="accent" className="flex-1">
                  <Link href={`/products/${p._id}`}>View</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(p._id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
