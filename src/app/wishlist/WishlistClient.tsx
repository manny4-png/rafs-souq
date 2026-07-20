"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { ProductCard } from "@/components/ui/ProductCard";
import { Footer } from "@/components/layout/Footer";

export function WishlistClient() {
  const { items } = useWishlistStore();

  return (
    <>
      <div
        className="pt-36 pb-14 px-5 text-center"
        style={{ background: "linear-gradient(to bottom, #1a1510 0%, #2d2218 60%, #F8F4EE 100%)" }}
      >
        <span className="inline-block text-[0.68rem] tracking-[0.3em] uppercase text-gold mb-3 font-inter">Saved Pieces</span>
        <h1 className="font-playfair text-white mb-2" style={{ fontSize: "clamp(2.2rem,4.5vw,3.8rem)" }}>
          Your Wishlist
        </h1>
        <p className="font-cormorant text-white/50 text-xl italic">
          {items.length} {items.length === 1 ? "piece" : "pieces"} saved
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-16">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={40} className="text-sand mx-auto mb-4" />
            <p className="font-cormorant text-2xl italic text-muted mb-2">Your wishlist is empty</p>
            <p className="text-sm text-muted/60 font-inter mb-8">Save pieces you love and find them here</p>
            <Link href="/shop" className="inline-block bg-charcoal text-white text-xs tracking-luxury uppercase px-10 py-4 hover:bg-gold transition-colors">
              Explore Collection
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {items.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </>
  );
}
