"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { cartItemKey, useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } =
    useCartStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCart, isOpen]);

  const total = typeof totalPrice === "function" ? totalPrice() : 0;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-charcoal/50 z-[80]"
            onClick={closeCart}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 right-0 h-screen w-full max-w-[420px] bg-cream z-[90] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/8">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-playfair text-lg font-semibold text-charcoal">
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <span className="text-xs text-muted font-inter">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeCart}
                className="text-muted hover:text-charcoal transition-colors p-1"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <ShoppingBag size={40} className="text-sand" />
                  <div>
                    <p className="font-cormorant text-xl italic text-muted mb-1">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-muted/70 font-inter">
                      Discover our luxury collections
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-2 inline-block bg-charcoal text-white text-xs tracking-luxury uppercase px-8 py-3 hover:bg-gold transition-colors duration-300"
                  >
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <motion.li
                      key={cartItemKey(item)}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 pb-5 border-b border-charcoal/6 last:border-0"
                    >
                      {/* Product image */}
                      <div className="w-20 h-24 bg-sand flex-shrink-0 overflow-hidden">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={80}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-playfair text-sm font-medium text-charcoal leading-tight mb-1">
                          {item.product.name}
                        </p>
                        {item.selectedColor && (
                          <p className="text-xs text-muted font-inter">
                            {item.selectedColor.name}
                          </p>
                        )}
                        {item.selectedSize && (
                          <p className="text-xs text-muted font-inter">
                            {item.selectedSize}
                          </p>
                        )}
                        <p className="text-sm font-medium text-charcoal mt-1">
                          {formatPrice(item.product.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(cartItemKey(item), item.quantity - 1)
                              }
                              aria-label={`Decrease quantity for ${item.product.name}`}
                              className="w-7 h-7 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-200"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(cartItemKey(item), item.quantity + 1)
                              }
                              aria-label={`Increase quantity for ${item.product.name}`}
                              className="w-7 h-7 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-all duration-200"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(cartItemKey(item))}
                            aria-label={`Remove ${item.product.name} from cart`}
                            className="text-muted/50 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-charcoal/8">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs tracking-luxury uppercase text-muted">
                    Total
                  </span>
                  <span className="font-playfair text-xl font-semibold text-charcoal">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-muted/70 font-inter mb-4 text-center">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-charcoal text-white text-center text-xs tracking-luxury uppercase py-4 hover:bg-gold transition-colors duration-300 font-inter font-medium"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs text-muted underline underline-offset-2 mt-3 hover:text-gold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
