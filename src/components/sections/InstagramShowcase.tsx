"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram, Heart } from "lucide-react";

const INSTA_POSTS = [
  {
    src: "/instagram/insta1.jpeg",
    likes: "1.2k",
    alt: "Black embellished turban with gold jewelry",
  },
  {
    src: "/instagram/insta2.jpeg",
    likes: "987",
    alt: "Purple pleated satin turban styling",
  },
  {
    src: "/instagram/insta3.png",
    likes: "2k",
    alt: "Brown beaded turban with floral ear accessory",
  },
  {
    src: "/instagram/insta4.png",
    likes: "845",
    alt: "Woman wearing a purple turban and holding colorful wraps",
  },
  {
    src: "/instagram/insta5.jpeg",
    likes: "1k",
    alt: "Pink and purple wrapped turban with jeweled accessory",
  },
  {
    src: "/instagram/turban-red.jpeg",
    likes: "845",
    alt: "Woman wearing a red turban and holding colorful wraps",
  },
  {
    src: "/instagram/turban-multicolour.jpeg",
    likes: "400",
    alt: "Woman wearing a multicoloured turban and holding colorful wraps",
  },
  {
    src: "/instagram/instag.jpeg",
    likes: "400",
    alt: "Woman wearing a multicoloured turban and holding colorful wraps",
  },
  {
    src: "/instagram/instag2.jpeg",
    likes: "400",
    alt: "Woman wearing a multicoloured turban and holding colorful wraps",
  },
];

export function InstagramShowcase() {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  return (
    <section
      ref={ref}
      className="py-16 px-5 bg-cream"
      aria-labelledby="instagram-heading"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.a
            href="https://www.instagram.com/rafssouq/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[0.68rem] tracking-[0.28em] uppercase text-gold mb-3 font-inter hover:text-gold-dark transition-colors"
          >
            <Instagram size={14} />
            @rafssouq
          </motion.a>
          <motion.h2
            id="instagram-heading"
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-playfair text-charcoal"
            style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.4rem)" }}
          >
            Follow Our <em className="text-gold not-italic italic">Journey</em>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
          {INSTA_POSTS.map((post, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/rafssouq"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.04 * i }}
              className="group relative aspect-square overflow-hidden bg-sand"
              aria-label={`Instagram post: ${post.alt}`}
            >
              <Image
                src={post.src}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-600 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/55 transition-all duration-350 flex items-center justify-center gap-3">
                <Heart
                  size={18}
                  className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                />
                <span className="text-white text-[0.78rem] font-inter font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 delay-50 translate-y-1 group-hover:translate-y-0">
                  {post.likes}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
