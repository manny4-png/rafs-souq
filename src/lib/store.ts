"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductColor } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, color?: ProductColor, size?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  toggle: (product: Product) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, color, size) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          set((s) => ({
            items: [
              ...s.items,
              { product, quantity: 1, selectedColor: color, selectedSize: size },
            ],
          }));
        }
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "rafs-souq-cart" }
  )
);

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((s) => ({ items: [...s.items, product] })),
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== productId) })),
      hasItem: (productId) => get().items.some((i) => i.id === productId),
      toggle: (product) => {
        if (get().hasItem(product.id)) get().removeItem(product.id);
        else get().addItem(product);
      },
    }),
    { name: "rafs-souq-wishlist" }
  )
);
