'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi, addressesApi, type Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OrderInvoice } from '@/components/OrderInvoice';
import { formatAddress } from '@/lib/format';
import { useMounted } from '@/hooks/useMounted';
import { useAddresses } from '@/hooks/useAddresses';
import { useCouponValidation } from '@/hooks/useCouponValidation';
import { useRazorpay } from '@/hooks/useRazorpay';
import { AddressPicker } from '@/components/checkout/AddressPicker';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { RazorpayScript } from '@/components/checkout/RazorpayScript';

const checkoutSchema = z
  .object({
    customerName: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Valid email required'),
    address: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  })
  .refine(
    (data) => data.address?.trim() || (data.addressLine1?.trim() && data.city?.trim() && data.state?.trim() && data.pincode?.trim()),
    { message: 'Please enter a complete address or select a saved address.', path: ['address'] }
  );

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();
  const mounted = useMounted();
  const { data: addresses, refetch: refetchAddresses } = useAddresses(isLoggedIn());
  const coupon = useCouponValidation(subtotal());
  const { openRazorpay } = useRazorpay();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [invoiceError, setInvoiceError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddressForLater, setSaveAddressForLater] = useState(false);

  useEffect(() => {
    if (!user || !addresses.length) return;
    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(defaultAddr._id);
  }, [user, addresses]);

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('customerName', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!selectedAddressId || !addresses.length || !user) return;
    const addr = addresses.find((a) => a._id === selectedAddressId);
    if (!addr) return;
    setValue('customerName', addr.name);
    setValue('phone', addr.phone);
    setValue('email', user.email);
    setValue('address', formatAddress(addr));
  }, [selectedAddressId, addresses, user, setValue]);

  useEffect(() => {
    if (!orderId || order) return;
    setInvoiceError(false);
    ordersApi
      .get(orderId)
      .then((o) => {
        setOrder(o);
        setInvoiceError(false);
      })
      .catch(() => setInvoiceError(true));
  }, [orderId, order]);

  if (!mounted) {
    return (
      <div className="container-custom py-10">
        <h1 className="font-display text-2xl font-semibold text-primary mb-6">Checkout</h1>
        <p className="text-primary/70 mb-6">Loading…</p>
      </div>
    );
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="container-custom py-10">
        <h1 className="font-display text-2xl font-semibold text-primary mb-6">Checkout</h1>
        <p className="text-primary/70 mb-6">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="container-custom py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-primary mb-2">Order Placed</h1>
            <p className="text-primary/80 mb-4">Thank you for your order.</p>
            <p className="text-sm text-primary/70 mb-2">Order ID</p>
            <p className="font-mono font-semibold text-accent text-lg mb-6">{orderId}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild>
                <Link href="/orders">View my orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </Card>
          {order ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-primary mb-4">Invoice</h2>
              <OrderInvoice order={order} />
            </div>
          ) : invoiceError ? (
            <Card className="p-6 text-center">
              <p className="text-primary/70 mb-2">Invoice could not be loaded.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/orders">View order in My Orders</Link>
              </Button>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-primary/70">Loading invoice…</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  const handlePayAgain = async () => {
    if (!pendingOrderId) return;
    setSubmitting(true);
    setError(null);
    try {
      const createdOrder = await ordersApi.get(pendingOrderId);
      const { razorpayOrderId, keyId } = await ordersApi.createRazorpayOrder(pendingOrderId);
      const formValues = { customerName: '', phone: '', email: '', address: '' };
      try {
        const inputs = document.querySelectorAll('input[id="customerName"], input[id="phone"], input[id="email"], input[id="address"]');
        inputs.forEach((el, i) => {
          const v = (el as HTMLInputElement).value;
          if (i === 0) formValues.customerName = v;
          else if (i === 1) formValues.phone = v;
          else if (i === 2) formValues.email = v;
          else if (i === 3) formValues.address = v;
        });
      } catch {
        // use order data
      }
      openRazorpay(
        pendingOrderId,
        createdOrder,
        keyId,
        razorpayOrderId,
        formValues.customerName || createdOrder.customerName,
        formValues.email || createdOrder.email,
        formValues.phone || createdOrder.phone,
        () => {
          clearCart();
          setOrderId(pendingOrderId);
          setOrder(createdOrder);
          setPendingOrderId(null);
          setError(null);
          router.replace('/checkout');
        },
        () => setError('Payment failed. You can try again below.')
      );
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Could not open payment. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    setError(null);
    setPendingOrderId(null);
    try {
      const addressStr =
        selectedAddressId && addresses.length
          ? data.address
          : `${data.addressLine1 || ''}${data.addressLine2 ? `, ${data.addressLine2}` : ''}, ${data.city || ''}, ${data.state || ''} - ${data.pincode || ''}`.trim();
      if (!addressStr) {
        setError('Please enter a complete address.');
        setSubmitting(false);
        return;
      }
      const selectedAddr = selectedAddressId && addresses.length ? addresses.find((a) => a._id === selectedAddressId) : null;
      const addressCity = selectedAddr ? selectedAddr.city : data.city;
      const addressState = selectedAddr ? selectedAddr.state : data.state;
      const addressPincode = selectedAddr ? selectedAddr.pincode : data.pincode;
      const { orderId: id } = await ordersApi.create({
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        address: addressStr,
        ...(addressCity && addressState && addressPincode && { addressCity, addressState, addressPincode }),
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        couponCode: coupon.applied ? coupon.applied.code : undefined,
      });
      if (saveAddressForLater && !selectedAddressId && data.addressLine1 && data.city && data.state && data.pincode) {
        try {
          await addressesApi.create({
            name: data.customerName,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || undefined,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          });
          refetchAddresses();
        } catch {
          // ignore
        }
      }
      const createdOrder = await ordersApi.get(id);
      const { razorpayOrderId, keyId } = await ordersApi.createRazorpayOrder(id);
      setPendingOrderId(id);
      if (typeof window !== 'undefined' && window.Razorpay) {
        openRazorpay(
          id,
          createdOrder,
          keyId,
          razorpayOrderId,
          data.customerName,
          data.email,
          data.phone,
          () => {
            clearCart();
            setOrderId(id);
            setOrder(createdOrder);
            setPendingOrderId(null);
            setError(null);
            router.replace('/checkout');
          },
          () => setError('Payment failed. You can try again below.')
        );
      } else {
        setError('Payment script not loaded. Please refresh and try again.');
        setPendingOrderId(null);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (err as { response: { data: { error: string } } }).response.data.error
        : 'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-10">
      <RazorpayScript />
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">Checkout</h1>
      {!isLoggedIn() && (
        <p className="text-primary/70 text-sm mb-4">
          Guest checkout. <Link href={`/register?returnTo=${encodeURIComponent('/checkout')}`} className="text-accent hover:underline">Create an account</Link> to save orders and addresses.
        </p>
      )}
      {pendingOrderId && (
        <Card className="mb-6 p-4 border-amber-200 bg-amber-50">
          <p className="text-primary/90">Payment pending or failed for this order. Use the button below to pay again.</p>
        </Card>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Customer details</h2>
          <div className="space-y-4">
            <AddressPicker
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectedAddressIdChange={setSelectedAddressId}
              register={register}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              userEmail={user?.email}
              isLoggedIn={isLoggedIn()}
              saveAddressForLater={saveAddressForLater}
              onSaveAddressForLaterChange={setSaveAddressForLater}
              formatAddress={formatAddress}
            />
          </div>
        </Card>
        <div>
          <OrderSummary
            items={items}
            subtotal={subtotal()}
            couponInput={coupon.couponInput}
            onCouponInputChange={coupon.setCouponInput}
            appliedCoupon={coupon.applied}
            couponMessage={coupon.message}
            applyingCoupon={coupon.applying}
            onApplyCoupon={coupon.apply}
            onRemoveCoupon={coupon.remove}
            displayTotal={coupon.displayTotal}
            error={error}
            submitting={submitting}
            pendingOrderId={pendingOrderId}
            onPayAgain={handlePayAgain}
          />
        </div>
      </form>
    </div>
  );
}
