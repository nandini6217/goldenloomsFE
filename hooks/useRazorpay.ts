'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types';
import { BRAND_NAME } from '@/config/constants';

export function useRazorpay() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  const openRazorpay = useCallback(
    (
      orderId: string,
      createdOrder: Order,
      keyId: string,
      razorpayOrderId: string,
      name: string,
      email: string,
      contact: string,
      onSuccess: () => void,
      onPaymentFailed?: () => void
    ) => {
      if (typeof window === 'undefined' || !window.Razorpay) return;
      const amountPaise = Math.round(createdOrder.totalAmount * 100);
      const rzp = new window.Razorpay({
        key: keyId,
        amount: amountPaise,
        currency: 'INR',
        order_id: razorpayOrderId,
        name: BRAND_NAME,
        prefill: { name, email, contact },
        handler: () => {
          onSuccess();
          router.replace('/checkout');
        },
      });
      rzp.on('payment.failed', () => onPaymentFailed?.());
      rzp.open();
    },
    [router]
  );

  return { openRazorpay, loaded, setLoaded };
}
