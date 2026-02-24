import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type CartStore = {
  items: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      setItems: (items) => set({ items }),
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const qty = item.qty ?? 1;
          const image = typeof item.image === 'string' && item.image.trim() ? item.image : undefined;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: i.qty + qty, ...(image && { image }) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty, image }] };
        });
      },
      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, qty } : i
          ),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'goldenlooms-cart' }
  )
);
