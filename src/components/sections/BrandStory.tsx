"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export function BrandStory() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#251f1b] px-5 py-20 lg:py-28"
      aria-labelledby="brand-story-heading"
    >
      <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#a6514b]/10 blur-3xl" aria-hidden="true" />
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-14 lg:gap-24 items-center">
        {/* Left — Quote */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <span className="flex items-center gap-3 text-[0.68rem] tracking-[0.28em] uppercase text-[#d5a680] mb-6 font-inter">
            <i className="block h-px w-9 bg-[#d5a680]" aria-hidden="true" />
            Our Philosophy
          </span>
          <blockquote
            id="brand-story-heading"
            className="font-cormorant text-[#f3eee6] leading-[1.35]"
            style={{
              fontSize: "clamp(1.8rem, 3.1vw, 2.75rem)",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            &ldquo;Empowering women with timeless modest fashion
            that blends{" "}
            <span className="text-[#d5a680] not-italic font-medium">tradition</span>,
            elegance, and modern sophistication.&rdquo;
          </blockquote>

          <div className="mt-9 flex items-center gap-4">
            <div className="w-12 h-px bg-[#a6514b]" aria-hidden="true" />
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/45 font-inter">Raf&apos;s Souq</p>
          </div>
        </motion.div>

        {/* Right — Editorial portrait */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[610px] lg:mx-0"
        >
          <div className="absolute -right-4 -top-4 h-full w-full rounded-t-[45%] border border-[#d5a680]/40 sm:-right-6 sm:-top-6" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[45%] bg-[#49352d] shadow-[0_35px_80px_rgba(0,0,0,0.35)]">
            <Image
              src="/hero/turban-red.jpeg"
              alt="Woman wearing Raf's Souq red metallic turban"
              fill
              sizes="(max-width: 1024px) 90vw, 46vw"
              className="object-cover object-top transition-transform duration-1000 hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#251f1b]/55 via-transparent to-transparent" aria-hidden="true" />
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}
