"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Footer } from "@/components/layout/Footer";
import type { Collection, Product, ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

const SORTS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export function ShopClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Collection[];
}) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") as ProductCategory | null;
  const categoryOptions = useMemo(
    () => [
      { label: "All Products", value: "all" as const },
      ...categories.map((category) => ({
        label: category.name,
        value: category.category,
      })),
    ],
    [categories]
  );
  const categoryValues = useMemo(
    () => new Set(categoryOptions.map((option) => option.value)),
    [categoryOptions]
  );
  const initialCategory =
    urlCategory && categoryValues.has(urlCategory) ? urlCategory : "all";

  const [category, setCategory] = useState<"all" | ProductCategory>(
    initialCategory
  );
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (selectedBadges.length > 0) {
      list = list.filter((p) => p.badge && selectedBadges.includes(p.badge));
    }
    switch (sort) {
      case "price-asc": return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "newest": return list.reverse();
      default: return list;
    }
  }, [category, sort, search, priceRange, selectedBadges, products]);

  const activeSort = SORTS.find((s) => s.value === sort)?.label ?? "Featured";

  return (
    <>
      {/* Page header */}
      <div
        className="relative overflow-hidden pt-36 pb-16 px-5 text-center border-b border-[#a6514b]/10"
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(166,81,75,0.18), transparent 30%), radial-gradient(circle at 12% 110%, rgba(201,162,39,0.15), transparent 32%), linear-gradient(135deg, #f3eee6 0%, #f7e5df 52%, #f3eee6 100%)",
        }}
      >
        <span className="inline-flex items-center gap-3 mb-4 text-[0.62rem] tracking-[0.24em] uppercase font-inter font-semibold text-[#8b5d48]">
          <i className="block w-8 h-px bg-[#8b5d48]" aria-hidden="true" />
          Raf&apos;s Souq
          <i className="block w-8 h-px bg-[#8b5d48]" aria-hidden="true" />
        </span>
        <h1 className="font-playfair text-charcoal mb-3 font-normal" style={{ fontSize: "clamp(2.8rem,5vw,4.8rem)", letterSpacing: "-0.035em" }}>
          Products
        </h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-10">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <input
              type="search"
              placeholder="Search turbans, shades, veils..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-charcoal/15 bg-white px-4 py-2.5 text-[0.85rem] font-inter outline-none focus:border-gold transition-colors pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 border px-4 py-2.5 text-[0.72rem] tracking-luxury uppercase font-inter transition-all",
                filtersOpen
                  ? "bg-charcoal text-white border-charcoal"
                  : "border-charcoal/20 text-muted hover:border-charcoal hover:text-charcoal"
              )}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 border border-charcoal/20 text-muted hover:border-charcoal hover:text-charcoal px-4 py-2.5 text-[0.72rem] tracking-luxury uppercase font-inter transition-all"
              >
                {activeSort}
                <ChevronDown size={13} className={sortOpen ? "rotate-180" : ""} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-cream border border-charcoal/10 shadow-lg z-30 py-1"
                  >
                    {SORTS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSort(s.value); setSortOpen(false); }}
                        className={cn(
                          "block w-full text-left px-4 py-2.5 text-[0.82rem] font-inter transition-colors",
                          sort === s.value
                            ? "text-gold bg-gold/5"
                            : "text-muted hover:text-charcoal hover:bg-sand/20"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-[0.78rem] text-muted font-inter hidden sm:block">
              {filtered.length} items
            </span>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="border border-charcoal/10 bg-white p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Category */}
                <div>
                  <h3 className="text-[0.68rem] tracking-[0.2em] uppercase font-inter font-semibold text-charcoal mb-3">
                    Category
                  </h3>
                  <div className="space-y-2">
                    {categoryOptions.map((c) => (
                      <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={c.value}
                          checked={category === c.value}
                          onChange={() => setCategory(c.value)}
                          className="accent-gold"
                        />
                        <span className={cn(
                          "text-[0.83rem] font-inter transition-colors",
                          category === c.value ? "text-gold" : "text-muted group-hover:text-charcoal"
                        )}>
                          {c.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h3 className="text-[0.68rem] tracking-[0.2em] uppercase font-inter font-semibold text-charcoal mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    {[[0, 400], [400, 700], [700, 1000], [1000, 1500]].map(([min, max]) => (
                      <label key={`${min}-${max}`} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange[0] === min && priceRange[1] === max}
                          onChange={() => setPriceRange([min, max])}
                          className="accent-gold"
                        />
                        <span className="text-[0.83rem] font-inter text-muted group-hover:text-charcoal transition-colors">
                          GH₵{min} - GH₵{max === 1500 ? "1500+" : max}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h3 className="text-[0.68rem] tracking-[0.2em] uppercase font-inter font-semibold text-charcoal mb-3">
                    Featured
                  </h3>
                  <div className="space-y-2">
                    {["Bestseller", "New", "Sale", "Exclusive"].map((badge) => (
                      <label key={badge} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedBadges.includes(badge)}
                          onChange={() =>
                            setSelectedBadges((current) =>
                              current.includes(badge)
                                ? current.filter((item) => item !== badge)
                                : [...current, badge]
                            )
                          }
                          className="accent-gold"
                        />
                        <span className="text-[0.83rem] font-inter text-muted group-hover:text-charcoal transition-colors">
                          {badge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCategory("all");
                      setPriceRange([0, 1500]);
                      setSearch("");
                      setSelectedBadges([]);
                    }}
                    className="text-[0.78rem] text-muted underline underline-offset-2 hover:text-charcoal transition-colors font-inter"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8" role="tablist">
          {categoryOptions.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={category === c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                "px-4 py-2 text-[0.72rem] tracking-[0.1em] uppercase font-inter border transition-all duration-250",
                category === c.value
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-transparent text-muted border-charcoal/15 hover:border-charcoal/40 hover:text-charcoal"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <p className="font-cormorant text-2xl italic text-muted mb-2">
                No products found
              </p>
              <p className="text-sm text-muted/60 font-inter">
                Try adjusting your filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${category}-${sort}-${search}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <Footer />
    </>
  );
}
