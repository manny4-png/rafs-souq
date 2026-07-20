"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/types";

export function CollectionsGrid({ collections }: { collections: Collection[] }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const visibleCollections = collections.slice(0, 5);

  return (
    <section
      ref={ref}
      className="py-20 px-5 bg-cream"
      aria-labelledby="collections-heading"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="max-w-lg mb-12">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-[0.68rem] tracking-[0.28em] uppercase text-gold mb-3 font-inter"
          >
            Curated for You
          </motion.span>
          <motion.h2
            id="collections-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-playfair text-charcoal leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}
          >
            Our Catalogue
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted text-[0.93rem] leading-relaxed font-inter"
          >
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First column — tall featured card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:row-span-2"
          >
            <CollectionCard
              collection={visibleCollections[0]!}
              aspectClass="aspect-[3/4] lg:h-full"
            />
          </motion.div>

          {/* Right column — two shorter cards */}
          {visibleCollections.slice(1, 3).map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
            >
              <CollectionCard collection={col} aspectClass="aspect-[3/2]" />
            </motion.div>
          ))}

          {/* Bottom row — two wide cards */}
          {visibleCollections.slice(3, 5).map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 + i * 0.1 }}
            >
              <CollectionCard collection={col} aspectClass="aspect-[3/2]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  aspectClass,
}: {
  collection: Collection;
  aspectClass: string;
}) {
  return (
    <Link
      href={`/shop?category=${collection.category}`}
      className={`group block relative overflow-hidden bg-charcoal ${aspectClass}`}
      aria-label={`Explore ${collection.name} collection`}
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to top, rgba(26,26,26,0.88) 0%, rgba(26,26,26,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Arrow */}
      <div className="absolute top-4 right-4 w-9 h-9 border border-white/25 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:bg-gold group-hover:border-gold transition-all duration-350">
        <ArrowUpRight size={15} />
      </div>

      {/* Text */}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <h3 className="font-playfair text-xl font-semibold leading-tight">
          {collection.name}
        </h3>
      </div>
    </Link>
  );
}
