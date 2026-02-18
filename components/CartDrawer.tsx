"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQty, removeItem, subtotal, totalItems } =
    useCartStore();

  const close = useCallback(() => setCartOpen(false), [setCartOpen]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (cartOpen) {
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [cartOpen, close]);

  return (
    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={close}
        />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-hover",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          )}
        >
          <div className="flex items-center justify-between border-b border-secondary-dark/20 p-4">
            <h2 className="font-heading text-lg font-semibold text-primary">
              Your Cart ({totalItems()})
            </h2>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="py-8 text-center text-primary/70">
                Your cart is empty.
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-4 rounded-[12px] border border-secondary-dark/20 p-3"
                  >
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-secondary" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-accent">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-600 hover:text-red-700"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t border-secondary-dark/20 p-4">
              <div className="mb-4 flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="text-accent">{formatPrice(subtotal())}</span>
              </div>
              <Link href="/checkout" onClick={close}>
                <Button variant="accent" className="w-full">
                  Checkout
                </Button>
              </Link>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
