'use client';

import Script from 'next/script';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export function RazorpayScript({ onLoad }: { onLoad?: () => void }) {
  return (
    <Script
      src={RAZORPAY_SCRIPT}
      strategy="afterInteractive"
      onLoad={() => onLoad?.()}
    />
  );
}
