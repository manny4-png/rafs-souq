import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "./ShopClient";
import { getCategories, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Shop Turbans, Shades, Veils and Ready to Wear Dresses",
  description:
    "Browse Raf's Souq turbans, shades, veils, and ready to wear dresses priced in Ghana cedis.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Raf's Souq",
    description:
      "Browse signature turbans, shades, veils, and ready to wear dresses.",
    url: "/shop",
  },
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 px-5 text-center text-muted font-inter">
          Loading products...
        </div>
      }
    >
      <ShopClient products={products} categories={categories} />
    </Suspense>
  );
}
