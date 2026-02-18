'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-custom px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl font-semibold text-primary mb-6">Your Cart</h1>
        <p className="text-primary/70 mb-6">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-semibold text-primary mb-6 sm:mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-[12px] bg-secondary/50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-primary truncate">{item.name}</p>
                    <p className="text-sm text-accent">₹{item.price}</p>
                    <p className="mt-1 text-sm font-medium text-primary sm:hidden">
                      Total: ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-3 sm:border-0 sm:pt-0 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item.productId, parseInt(e.target.value, 10) || 1)}
                      className="w-14 text-center sm:w-16"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 hover:text-red-700 shrink-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="hidden font-medium text-primary text-right sm:block sm:min-w-[5rem]">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Summary</h2>
            <div className="divider-gold my-4" />
            <p className="flex justify-between text-primary mb-4">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal()}</span>
            </p>
            <Button asChild className="w-full" size="lg" variant="accent">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
