declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name: string;
      prefill?: { name?: string; email?: string; contact?: string };
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string }) => void;
    }) => { open: () => void; on: (event: string, handler: () => void) => void };
  }
}

export {};
