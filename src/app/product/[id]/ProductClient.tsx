"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronDown } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { toast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");

  const addToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle: toggleWishlist, hasItem } = useWishlistStore();
  const wishlisted = hasItem(product.id);
  const variants = product.variants || [];
  const availableSizes = useMemo(() => {
    if (!variants.length) return product.sizes || [];
    return Array.from(new Set(
      variants
        .filter((variant) => !variant.colorName || variant.colorName === selectedColor.name)
        .map((variant) => variant.size)
        .filter(Boolean)
    ));
  }, [product.sizes, variants, selectedColor.name]);
  const selectedVariant = variants.find(
    (variant) =>
      variant.inStock &&
      (!variant.colorName || variant.colorName === selectedColor.name) &&
      (!variant.size || variant.size === selectedSize)
  );
  const isSizeAvailable = (size: string) =>
    !variants.length ||
    variants.some(
      (variant) =>
        variant.inStock &&
        (!variant.colorName || variant.colorName === selectedColor.name) &&
        (!variant.size || variant.size === size)
    );
  const selectedPrice = product.price + (selectedVariant?.priceAdjustment || 0);

  const handleAddToCart = () => {
    if (variants.length && !selectedVariant) {
      toast.show("Please choose an available colour and size", "info");
      return;
    }
    addToCart(
      { ...product, price: selectedPrice },
      selectedColor,
      selectedSize,
      selectedVariant?.backendId
    );
    toast.show(`${product.name} added to cart`);
    setTimeout(() => openCart(), 400);
  };

  const accordions = [
    {
      id: "details",
      title: "Product Details",
      content: (
        <ul className="space-y-1.5">
          {product.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[0.88rem] text-muted font-inter">
              <span className="text-gold mt-0.5" aria-hidden="true">✓</span> {d}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "shipping",
      title: "Delivery, Returns & Exchanges",
      content: (
        <div className="space-y-3 text-[0.88rem] leading-relaxed text-muted font-inter">
          <p>Delivery is available across Ghana. Delivery timing and fees are confirmed at checkout.</p>
          <div>
            <p className="font-medium text-charcoal">Return or exchange window</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Within Accra: send the item back within 24–48 hours of receiving it.</li>
              <li>Outside Accra: send the item back within 72 hours of receiving it.</li>
              <li>Return and exchange delivery fees are the customer&apos;s responsibility.</li>
            </ul>
          </div>
          <p>Items kept for more than two days, or items that are damaged, worn, dirty or appear used, cannot be returned or exchanged.</p>
        </div>
      ),
    },
    {
      id: "terms",
      title: "Purchase & Refund Policy",
      content: (
        <div className="space-y-3 text-[0.88rem] leading-relaxed text-muted font-inter">
          <p>Please review the product information carefully and contact us with any questions before making payment.</p>
          <p>Pay the complete order total, including any pesewa balance. An incomplete payment may leave the order unvalidated and it may be cancelled.</p>
          <p>If you request a refund before completing your order, a 5% service charge will be deducted from the amount refunded.</p>
          <p className="font-medium text-charcoal">Sale purchases are final and cannot be returned or exchanged.</p>
        </div>
      ),
    },
    {
      id: "faulty",
      title: "Faulty Items",
      content: (
        <div className="space-y-3 text-[0.88rem] leading-relaxed text-muted font-inter">
          <p>If your item arrives faulty, contact us immediately and attach a clear photograph of the problem taken when you receive it.</p>
          <p>Once confirmed, we will arrange an exchange for the faulty item as quickly as possible.</p>
          <Link href="/contact" className="inline-block border-b border-[#a6514b] pb-0.5 text-[#a6514b] transition-colors hover:text-charcoal">
            Contact customer care
          </Link>
        </div>
      ),
    },
    {
      id: "care",
      title: "Care Instructions",
      content: (
        <div className="space-y-2 text-[0.88rem] text-muted font-inter">
          <p>Always refer to the care label inside your garment.</p>
          <p>Most pieces are dry clean or gentle hand wash only.</p>
          <p>Store flat or rolled — never crumpled.</p>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-28 px-5 pb-4 max-w-[1400px] mx-auto">
        <nav className="flex gap-2 text-[0.75rem] font-inter text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-gold transition-colors capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      {/* Main product grid */}
      <div className="max-w-[1400px] mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              {product.images[activeImage] && (
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[activeImage]}
                    alt={`${product.name} - view ${activeImage + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={activeImage === 0}
                  />
                </motion.div>
              )}
              {product.badge && (
                <span className={cn(
                  "absolute top-4 left-4 text-[0.62rem] tracking-[0.14em] uppercase px-3 py-1.5 font-inter font-medium z-10",
                  product.badge === "Sale" ? "bg-charcoal text-white" : "bg-gold text-white"
                )}>
                  {product.badge}
                </span>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative w-20 h-24 overflow-hidden bg-sand border-2 transition-all",
                      activeImage === i ? "border-gold" : "border-transparent"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:pt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="text-[0.68rem] tracking-[0.24em] uppercase text-gold font-inter capitalize">
                {product.category}
              </span>

              <h1 className="font-playfair text-charcoal mt-2 mb-3 leading-tight" style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)" }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-playfair text-2xl font-semibold text-charcoal">
                  {formatPrice(selectedPrice)}
                </span>
                {product.originalPrice && (
                  <span className="text-muted line-through font-inter">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="w-full h-px bg-charcoal/8 mb-6" />

              {/* Description */}
              <p className="font-cormorant text-muted text-[1.05rem] leading-relaxed italic mb-6">
                {product.description}
              </p>

              {/* Colors */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[0.72rem] tracking-[0.16em] uppercase font-inter font-medium text-charcoal">
                    Colour
                  </span>
                  <span className="text-[0.78rem] text-muted font-inter">{selectedColor.name}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      type="button"
                      key={`${color.name}-${color.hex}`}
                      onClick={() => {
                        setSelectedColor(color);
                        const firstSize = variants.find(
                          (variant) => variant.inStock && (!variant.colorName || variant.colorName === color.name)
                        )?.size;
                        if (firstSize) setSelectedSize(firstSize);
                      }}
                      title={color.name}
                      aria-label={`Select colour: ${color.name}`}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor.hex === color.hex ? "border-charcoal scale-110" : "border-transparent hover:border-charcoal/30"
                      )}
                      style={{ background: color.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[0.72rem] tracking-[0.16em] uppercase font-inter font-medium text-charcoal">
                      Size
                    </span>
                    <button type="button" className="text-[0.72rem] text-gold underline underline-offset-2 font-inter">Size Guide</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {availableSizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isSizeAvailable(size)}
                        className={cn(
                          "px-4 py-2 text-[0.78rem] font-inter border transition-all",
                          selectedSize === size
                            ? "bg-charcoal text-white border-charcoal"
                            : "border-charcoal/20 text-muted hover:border-charcoal hover:text-charcoal",
                          !isSizeAvailable(size) && "cursor-not-allowed opacity-40 line-through"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || (variants.length > 0 && !selectedVariant)}
                  className="flex-1 flex items-center justify-center gap-2 bg-charcoal text-white py-4 text-[0.78rem] tracking-luxury uppercase font-inter font-medium hover:bg-gold disabled:bg-muted disabled:cursor-not-allowed transition-all duration-300 btn-magnetic"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingBag size={15} />
                  {product.inStock ? "Add to Cart" : "Sold Out"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product);
                    toast.show(wishlisted ? "Removed from wishlist" : "Saved to wishlist", "info");
                  }}
                  aria-pressed={wishlisted}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={cn(
                    "w-14 border flex items-center justify-center transition-all duration-300",
                    wishlisted
                      ? "bg-gold border-gold text-white"
                      : "border-charcoal/20 text-muted hover:border-charcoal hover:text-charcoal"
                  )}
                >
                  <Heart size={17} className={wishlisted ? "fill-white" : ""} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 py-5 border-t border-b border-charcoal/8 mb-6">
                {[
                  { Icon: Truck, label: "Fast Delivery" },
                  { Icon: RotateCcw, label: "Returns Window", sub: "24–72 hours" },
                  { Icon: Shield, label: "Secure Payment", sub: "256-bit SSL" },
                ].map(({ Icon, label, sub }) => (
                  <div key={label} className="text-center">
                    <Icon size={18} className="text-gold mx-auto mb-1" />
                    <p className="text-[0.72rem] font-medium text-charcoal font-inter">{label}</p>
                    <p className="text-[0.65rem] text-muted font-inter">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <div className="space-y-0">
                {accordions.map((acc) => (
                  <div key={acc.id} className="border-b border-charcoal/8">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                      aria-expanded={openAccordion === acc.id}
                      aria-controls={`${acc.id}-panel`}
                    >
                      <span className="text-[0.82rem] tracking-[0.1em] uppercase font-inter font-medium text-charcoal">
                        {acc.title}
                      </span>
                      <ChevronDown
                        size={15}
                        className={cn("text-muted transition-transform", openAccordion === acc.id ? "rotate-180" : "")}
                      />
                    </button>
                    {openAccordion === acc.id && (
                      <motion.div
                        id={`${acc.id}-panel`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pb-4"
                      >
                        {acc.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <span className="inline-block text-[0.68rem] tracking-[0.28em] uppercase text-gold mb-2 font-inter">
                You May Also Love
              </span>
              <h2 className="font-playfair text-2xl text-charcoal">Related Pieces</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
