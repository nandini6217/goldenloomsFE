'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AppliedCoupon } from '@/hooks/useCouponValidation';

type CouponFormProps = {
  couponInput: string;
  onCouponInputChange: (v: string) => void;
  applied: AppliedCoupon | null;
  message: string | null;
  applying: boolean;
  onApply: () => void;
  onRemove: () => void;
};

export function CouponForm({
  couponInput,
  onCouponInputChange,
  applied,
  message,
  applying,
  onApply,
  onRemove,
}: CouponFormProps) {
  return (
    <div className="space-y-2 mb-4">
      {!applied ? (
        <div className="flex gap-2">
          <Input
            placeholder="Coupon code"
            value={couponInput}
            onChange={(e) => onCouponInputChange(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={onApply} disabled={applying}>
            {applying ? 'Apply...' : 'Apply'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-700">Coupon {applied.code} applied (−₹{applied.discount})</span>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
      {message && !applied && <p className="text-sm text-amber-700">{message}</p>}
    </div>
  );
}
