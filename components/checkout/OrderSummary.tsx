'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CouponForm } from './CouponForm';
import type { AppliedCoupon } from '@/hooks/useCouponValidation';
import type { CartItem } from '@/store/cart-store';

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  couponInput: string;
  onCouponInputChange: (v: string) => void;
  appliedCoupon: AppliedCoupon | null;
  couponMessage: string | null;
  applyingCoupon: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  displayTotal: number;
  error: string | null;
  submitting: boolean;
  pendingOrderId: string | null;
  onPayAgain: () => void;
  submitLabel?: string;
};

export function OrderSummary({
  items,
  subtotal,
  couponInput,
  onCouponInputChange,
  appliedCoupon,
  couponMessage,
  applyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  displayTotal,
  error,
  submitting,
  pendingOrderId,
  onPayAgain,
  submitLabel = 'Place order',
}: OrderSummaryProps) {
  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-primary mb-4">Order summary</h2>
      <ul className="space-y-2 text-sm text-primary/80 mb-4">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between">
            <span>{i.name} × {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </li>
        ))}
      </ul>
      <div className="divider-gold my-4" />
      <CouponForm
        couponInput={couponInput}
        onCouponInputChange={onCouponInputChange}
        applied={appliedCoupon}
        message={couponMessage}
        applying={applyingCoupon}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
      />
      <p className="flex justify-between font-medium text-primary mb-2">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </p>
      {appliedCoupon && (
        <p className="flex justify-between text-sm text-green-700 mb-2">
          <span>Discount</span>
          <span>−₹{appliedCoupon.discount}</span>
        </p>
      )}
      <p className="flex justify-between font-medium text-primary mb-6">
        <span>Total</span>
        <span>₹{displayTotal}</span>
      </p>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {pendingOrderId ? (
        <Button type="button" className="w-full" size="lg" variant="accent" disabled={submitting} onClick={onPayAgain}>
          {submitting ? 'Opening…' : 'Pay again'}
        </Button>
      ) : (
        <Button type="submit" className="w-full" size="lg" variant="accent" disabled={submitting}>
          {submitting ? 'Placing order...' : submitLabel}
        </Button>
      )}
    </Card>
  );
}
