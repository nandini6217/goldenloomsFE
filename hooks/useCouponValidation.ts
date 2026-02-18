'use client';

import { useState, useCallback } from 'react';
import { couponsApi } from '@/lib/api';

export type AppliedCoupon = { code: string; discount: number; finalTotal: number };

export function useCouponValidation(subtotal: number) {
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const apply = useCallback(async () => {
    const code = couponInput.trim();
    if (!code) return;
    setApplying(true);
    setMessage(null);
    try {
      const res = await couponsApi.validate(code, subtotal);
      if (res.valid) {
        setApplied({ code, discount: res.discount, finalTotal: res.finalTotal });
        setMessage(res.message || 'Coupon applied');
      } else {
        setApplied(null);
        setMessage(res.message || 'Invalid coupon');
      }
    } catch {
      setApplied(null);
      setMessage('Could not validate coupon');
    } finally {
      setApplying(false);
    }
  }, [couponInput, subtotal]);

  const remove = useCallback(() => {
    setCouponInput('');
    setApplied(null);
    setMessage(null);
  }, []);

  const displayTotal = applied ? applied.finalTotal : subtotal;

  return {
    couponInput,
    setCouponInput,
    applied,
    message,
    applying,
    apply,
    remove,
    displayTotal,
  };
}
