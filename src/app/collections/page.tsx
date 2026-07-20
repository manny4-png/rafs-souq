import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/api";

export const metadata = {
  title: "Collections",
  description: "Explore Raf's Souq collections: turbans, shades, veils, and ready to wear dresses.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCategories();

  return (
    <>
      <div
        className="relative overflow-hidden pt-36 pb-16 px-5 text-center border-b border-[#a6514b]/10"
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(166,81,75,0.18), transparent 30%), radial-gradient(circle at 12% 110%, rgba(201,162,39,0.15), transparent 32%), linear-gradient(135deg, #f3eee6 0%, #f7e5df 52%, #f3eee6 100%)",
        }}
      >
        <span className="inline-flex items-center gap-3 mb-4 text-[0.62rem] tracking-[0.24em] uppercase font-inter font-semibold text-[#8b5d48]">
          <i className="block w-8 h-px bg-[#8b5d48]" aria-hidden="true" />
          Curated for You
          <i className="block w-8 h-px bg-[#8b5d48]" aria-hidden="true" />
        </span>
        <h1
          className="font-playfair text-charcoal mb-3 font-normal"
          style={{ fontSize: "clamp(2.8rem,5vw,4.8rem)", letterSpacing: "-0.035em" }}
        >
          Our Collections
        </h1>
        <p className="font-cormorant text-[#a6514b] text-xl italic">
          Heritage meets modernity in every piece
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col, i) => (
            <Link
              key={col.id}
              href={`/shop?category=${col.category}`}
              className={`group relative overflow-hidden bg-charcoal ${i === 0 ? "md:col-span-2 aspect-[16/7]" : "aspect-[4/3]"}`}
            >
              <Image
                src={col.image}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.1) 60%, transparent 100%)" }} />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h2 className="font-playfair text-2xl md:text-3xl font-semibold">{col.name}</h2>
                <span className="inline-block mt-4 border-b border-gold text-[0.72rem] tracking-luxury uppercase font-inter text-gold pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
