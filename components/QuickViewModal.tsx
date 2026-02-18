'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/product/ProductPrice';
import { X } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  description?: string;
  images?: string[];
  stock?: number;
};

type QuickViewModalProps = {
  productId: string | null;
  onClose: () => void;
};

export function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }
    setLoading(true);
    productsApi
      .get(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const effectivePrice =
    product?.discountedPrice != null &&
    product.discountedPrice > 0 &&
    product.discountedPrice < (product?.price ?? 0)
      ? product.discountedPrice
      : product?.price ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="relative z-10 w-full max-w-lg rounded-[12px] bg-white shadow-lg border border-primary/10 overflow-hidden"
        role="dialog"
        aria-modal
        aria-label="Quick view"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-primary/10 hover:bg-primary/20 z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-primary" />
        </button>
        {loading ? (
          <div className="p-8 flex items-center justify-center min-h-[200px]">
            <p className="text-primary/70">Loading...</p>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
            <div className="aspect-square bg-secondary/50 rounded-[12px] overflow-hidden">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-2">{product.name}</h2>
              <ProductPrice
                price={product.price}
                discountedPrice={product.discountedPrice}
                showDelivery={false}
              />
              {product.description && (
                <p className="text-sm text-primary/70 mt-2 line-clamp-3">{product.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addItem({
                      productId: product._id,
                      name: product.name,
                      price: effectivePrice,
                    });
                    onClose();
                  }}
                >
                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${product._id}`} onClick={onClose}>
                    View full details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-primary/70">Product not found.</div>
        )}
      </div>
    </div>
  );
}
