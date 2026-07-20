"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product, ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

function categoryLabel(slug: ProductCategory) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BestSellers({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<"all" | ProductCategory>("all");
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  const filters = useMemo(() => {
    const categories = Array.from(
      new Set(products.map((product) => product.category))
    );
    return [
      { label: "All", value: "all" as const },
      ...categories.map((category) => ({
        label: categoryLabel(category),
        value: category,
      })),
    ];
  }, [products]);

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section
      ref={ref}
      className="py-20 px-5 bg-white"
      aria-labelledby="bestsellers-heading"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-block text-[0.68rem] tracking-[0.28em] uppercase text-gold mb-2 font-inter"
            >
              
            </motion.span>
            <motion.h2
              id="bestsellers-heading"
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-playfair text-charcoal leading-tight"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
            >
              Products
            </motion.h2>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-2 flex-wrap"
            role="tablist"
            aria-label="Filter products by category"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={activeFilter === f.value}
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-4 py-2 text-[0.72rem] tracking-[0.1em] uppercase font-inter border transition-all duration-250",
                  activeFilter === f.value
                    ? "bg-charcoal text-white border-charcoal"
                    : "bg-transparent text-muted border-charcoal/20 hover:bg-charcoal hover:text-white hover:border-charcoal"
                )}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Products grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.05 * i }}
                className="relative"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-block border border-charcoal text-charcoal text-[0.78rem] tracking-luxury uppercase px-10 py-3.5 hover:bg-charcoal hover:text-white transition-all duration-300 font-inter font-medium btn-magnetic"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
