"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { toast } from "@/components/ui/Toast";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [hovering, setHovering] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle: toggleWishlist, hasItem } = useWishlistStore();
  const wishlisted = hasItem(product.id);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addToCart(product);
    toast.show(`${product.name} added to cart`);
    setTimeout(() => openCart(), 400);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast.show(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      "info"
    );
  };

  const discount = product.originalPrice
    ? getDiscountPercentage(product.originalPrice, product.price)
    : null;

  return (
    <article
      className={cn("product-card group relative", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative overflow-hidden bg-sand aspect-[3/4]">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover product-card-img"
            />
          )}

          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover absolute inset-0 product-card-secondary",
                hovering ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </Link>

        {product.badge && (
          <span
            className={cn(
              "absolute top-3 left-3 z-10 text-[0.6rem] tracking-[0.14em] uppercase px-2.5 py-1 font-inter font-medium",
              product.badge === "Sale"
                ? "bg-charcoal text-white"
                : "bg-gold text-white"
            )}
          >
            {product.badge}
            {product.badge === "Sale" && discount && ` -${discount}%`}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-pressed={wishlisted}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center transition-all duration-300 opacity-100 sm:opacity-0 sm:-translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors duration-200",
              wishlisted ? "fill-gold text-gold" : "text-muted"
            )}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 p-3 transition-all duration-300 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-charcoal/95 hover:bg-gold disabled:bg-muted disabled:cursor-not-allowed text-white text-[0.7rem] tracking-luxury uppercase py-2.5 flex items-center justify-center gap-1.5 font-inter font-medium transition-colors duration-200"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={12} />
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
        </div>

        {product.colors.length > 1 && (
          <div className="absolute bottom-14 left-3 flex gap-1.5 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.hex}
                className="w-4 h-4 rounded-full border border-white/40"
                style={{ background: color.hex }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 pb-1">
        <h3 className="font-playfair text-[0.97rem] font-medium leading-snug mb-1.5">
          <Link
            href={`/product/${product.id}`}
            className="text-charcoal hover:text-gold transition-colors duration-300"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[0.9rem] font-medium text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[0.8rem] text-muted line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none border border-gold/0"
        animate={{
          borderColor: hovering
            ? "rgba(201,162,39,0.3)"
            : "rgba(201,162,39,0)",
        }}
        transition={{ duration: 0.3 }}
      />
    </article>
  );
}
