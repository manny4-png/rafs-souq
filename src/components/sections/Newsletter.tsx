"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.show("Please enter a valid email address", "info");
      return;
    }
    setSubmitted(true);
    toast.show("Welcome to the Raf's Souq family ✦");
    setEmail("");
  };

  return (
    <section
      ref={ref}
      className="relative py-20 px-5 bg-charcoal overflow-hidden text-center"
      aria-labelledby="newsletter-heading"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(201,162,39,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Subtle horizontal lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-gold/[0.03]"
            style={{ top: `${(i + 1) * 16}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-block text-[0.68rem] tracking-[0.28em] uppercase text-gold mb-4 font-inter"
        >
          Stay in the Know
        </motion.span>

        <motion.h2
          id="newsletter-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-playfair text-white mb-3"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
        >
          Elegance in Your Inbox
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-[0.93rem] font-inter leading-relaxed mb-8 max-w-sm mx-auto"
        >
          Be the first to discover new arrivals, exclusive collections, and
          styling inspiration curated just for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-xl">✦</span>
              </div>
              <p className="font-cormorant text-white text-xl italic">
                Welcome to the family
              </p>
              <p className="text-white/40 text-sm font-inter">
                You&apos;ll hear from us soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex max-w-sm mx-auto"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/30 px-5 py-3.5 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors duration-300"
                required
              />
              <button
                type="submit"
                className="group bg-gold hover:bg-gold-light text-white px-6 py-3.5 text-[0.75rem] tracking-luxury uppercase font-inter font-medium transition-all duration-300 flex items-center gap-2 flex-shrink-0 btn-magnetic"
              >
                Subscribe
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          )}

          <p className="text-white/25 text-[0.7rem] font-inter mt-4">
            No spam. Unsubscribe any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
