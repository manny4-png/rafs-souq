import { Hero } from "@/components/sections/Hero";
import { CollectionsGrid } from "@/components/sections/CollectionsGrid";
import { BestSellers } from "@/components/sections/BestSellers";
import { BrandStory } from "@/components/sections/BrandStory";
import { InstagramShowcase } from "@/components/sections/InstagramShowcase";
import { Newsletter } from "@/components/sections/Newsletter";
import { FaqSection } from "@/components/sections/FaqSection";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, collections] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <Hero />
      <CollectionsGrid collections={collections} />
      <BestSellers products={products} />
      <BrandStory />
      <InstagramShowcase />
      <FaqSection />
      <Newsletter />
      <Footer />
    </>
  );
}
