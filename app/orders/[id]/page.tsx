'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { ordersApi, type Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OrderInvoice } from '@/components/OrderInvoice';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isLoggedIn } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = useCallback(async () => {
    if (!order || !['PLACED', 'CONFIRMED'].includes(order.status)) return;
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await ordersApi.cancel(order._id);
      setOrder(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  }, [order]);

  const handleReorder = () => {
    if (!order) return;
    const withId = order.items.filter((i) => i.productId);
    if (withId.length === 0) return;
    withId.forEach((item) => {
      addItem({
        productId: item.productId!,
        name: item.name,
        price: item.priceAtPurchase,
        qty: item.qty,
      });
    });
    router.push('/cart');
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?returnTo=${encodeURIComponent(`/orders/${id}`)}`);
      return;
    }
    if (!id) return;
    ordersApi
      .get(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn, router]);

  if (!isLoggedIn()) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-10">
        <Card className="p-8 text-center">
          <p className="text-primary/80 mb-4">Order not found.</p>
          <Button asChild>
            <Link href="/orders">Back to My Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container-custom py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Order #{order._id.slice(-8)}
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">Back to My Orders</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order tracking timeline */}
          {!isCancelled && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold text-primary mb-4">Order status</h2>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, i) => {
                  const reached = statusIndex >= i;
                  const isLast = i === STATUS_STEPS.length - 1;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 shrink-0 ${
                            reached
                              ? 'bg-accent border-accent text-white'
                              : 'bg-secondary/30 border-primary/20 text-primary/50'
                          }`}
                        >
                          {reached ? '✓' : i + 1}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
                              reached ? 'bg-accent' : 'bg-primary/10'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`font-medium ${reached ? 'text-primary' : 'text-primary/50'}`}
                        >
                          {step.charAt(0) + step.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(order.trackingId || order.trackingUrl) && (
                <div className="mt-6 pt-4 border-t border-primary/10">
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-medium"
                    >
                      Track shipment {order.trackingId ? `(${order.trackingId})` : ''}
                    </a>
                  ) : order.trackingId ? (
                    <p className="text-sm text-primary/80">
                      Tracking ID: <span className="font-mono">{order.trackingId}</span>
                    </p>
                  ) : null}
                </div>
              )}
            </Card>
          )}

          {isCancelled && (
            <Card className="p-6 border-amber-200 bg-amber-50/50">
              <p className="font-medium text-primary">This order was cancelled.</p>
            </Card>
          )}

          <OrderInvoice order={order} />
        </div>

        <div>
          <Card className="p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Summary</h2>
            <p className="text-sm text-primary/70 mb-1">Status</p>
            <p className="font-medium text-primary mb-4">{order.status}</p>
            <p className="text-sm text-primary/70 mb-1">Total</p>
            <p className="font-semibold text-accent text-lg mb-6">₹{order.totalAmount}</p>
            {!isCancelled && ['PLACED', 'CONFIRMED'].includes(order.status) && (
              <Button
                className="w-full mb-2"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel order'}
              </Button>
            )}
            {!isCancelled && order.items.some((i) => i.productId) && (
              <Button
                className="w-full mb-2"
                size="sm"
                variant="accent"
                onClick={handleReorder}
              >
                Reorder
              </Button>
            )}
            <Button asChild className="w-full" size="sm" variant="outline">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
