'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { eventsApi } from '@/lib/api/events';
import { getCompareIds, removeFromCompare } from '@/lib/compare';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductPrice } from '@/components/product/ProductPrice';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  description?: string;
  images?: string[];
  avgRating?: number;
  reviewCount?: number;
};

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const list = getCompareIds();
    setIds(list);
    if (list.length === 0) {
      setProducts([]);
      return;
    }
    productsApi.list({ ids: list.join(',') }).then((data: Product[]) => {
      const order = list.reduce((acc, id, i) => ({ ...acc, [id]: i }), {} as Record<string, number>);
      setProducts(data.sort((a, b) => (order[a._id] ?? 99) - (order[b._id] ?? 99)));
    }).catch(() => setProducts([]));
  }, []);

  const handleRemove = (productId: string) => {
    removeFromCompare(productId);
    setIds(getCompareIds());
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  if (ids.length < 2 && products.length < 2) {
    return (
      <div className="container-custom py-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare' }]} className="mb-6" />
        <h1 className="font-display text-2xl font-semibold text-primary mb-6">Compare products</h1>
        <Card className="p-8 text-center">
          <p className="text-primary/80 mb-4">Add at least 2 products to compare from the product listing.</p>
          <Link href="/products" className={cn(buttonVariants(), 'inline-flex')}>
            Shop products
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare' }]} className="mb-6" />
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">Compare products</h1>
      <div className="overflow-x-auto lg:max-w-5xl">
        <div className="flex gap-4 md:gap-6 min-w-max pb-4">
          {products.map((p) => (
            <Card key={p._id} className="w-64 shrink-0 overflow-hidden">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleRemove(p._id)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 shadow"
                  aria-label="Remove from compare"
                >
                  <X className="h-4 w-4 text-primary" />
                </button>
                <Link href={`/products/${p._id}`}>
                  <div className="aspect-square bg-secondary/50">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                </Link>
              </div>
              <div className="p-4">
                <Link href={`/products/${p._id}`} className="font-display font-semibold text-primary hover:underline line-clamp-2">
                  {p.name}
                </Link>
                <p className="text-xs text-primary/60 mt-1">{p.category}</p>
                <div className="mt-2">
                  <ProductPrice price={p.price} discountedPrice={p.discountedPrice} showDelivery={false} />
                </div>
                {(p.avgRating != null && p.avgRating > 0) && (
                  <p className="text-sm text-amber-600 mt-1">★ {p.avgRating} ({p.reviewCount ?? 0})</p>
                )}
                {p.description && (
                  <p className="text-xs text-primary/70 mt-2 line-clamp-3">{p.description}</p>
                )}
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link
                    href={`/products/${p._id}`}
                    onClick={() => eventsApi?.track?.({
                      event: 'view_full_details',
                      productId: p._id,
                      productName: p.name,
                      category: p.category,
                      source: 'compare',
                    })}
                  >
                    View details
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
