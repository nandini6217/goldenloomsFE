'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { productsApi, wishlistApi } from '@/lib/api';
import { eventsApi } from '@/lib/api/events';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlist } from '@/hooks/useWishlist';
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
  category?: string;
};

type QuickViewModalProps = {
  productId: string | null;
  onClose: () => void;
};

export function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const hasToken = !!useAuthStore((s) => s.token);
  const { productIds: wishlistIds, refetch: refetchWishlist } = useWishlist(hasToken);
  const zoomTrackedRef = useRef(false);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      zoomTrackedRef.current = false;
      return;
    }
    setLoading(true);
    zoomTrackedRef.current = false;
    productsApi
      .get(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!product || zoomTrackedRef.current) return;
    zoomTrackedRef.current = true;
    eventsApi?.track?.({
      event: 'product_zoom',
      productId: product._id,
      productName: product.name,
      category: product.category,
      source: 'quick_view',
    });
  }, [product]);

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
        className="relative z-10 w-full max-w-lg md:max-w-2xl rounded-[12px] bg-white shadow-lg border border-primary/10 overflow-hidden"
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
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <Button
                  variant="accent"
                  size="sm"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addItem({
                      productId: product._id,
                      name: product.name,
                      price: effectivePrice,
                      image: product.images?.[0],
                    });
                    eventsApi?.track?.({
                      event: 'add_to_cart',
                      productId: product._id,
                      productName: product.name,
                      qty: 1,
                      source: 'quick_view',
                    });
                    onClose();
                  }}
                >
                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </Button>
                {hasToken && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const inList = wishlistIds.has(product._id);
                        if (inList) await wishlistApi.remove(product._id);
                        else {
                          await wishlistApi.add(product._id);
                          eventsApi?.track?.({
                            event: 'add_to_wishlist',
                            productId: product._id,
                            productName: product.name,
                            category: product.category,
                            source: 'quick_view',
                          });
                        }
                        refetchWishlist();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="p-2 rounded-full border border-primary/20 hover:bg-primary/5 text-primary/70 hover:text-red-500"
                    aria-label={wishlistIds.has(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {wishlistIds.has(product._id) ? '❤' : '♡'}
                  </button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/products/${product._id}`}
                    onClick={() => {
                      eventsApi?.track?.({
                        event: 'view_full_details',
                        productId: product._id,
                        productName: product.name,
                        category: product.category,
                        source: 'quick_view',
                      });
                      onClose();
                    }}
                  >
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
