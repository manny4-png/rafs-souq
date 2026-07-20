import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/FaqSection";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Turban FAQs",
  description: "Answers to common questions about Raf's Souq turban cap fit, materials, care, delivery, returns, and ordering.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <><header className="border-b border-[#a6514b]/10 bg-cream px-5 pb-14 pt-36 text-center"><h1 className="font-playfair text-4xl text-charcoal sm:text-6xl">Turban FAQs</h1></header><FaqSection fullPage /><Footer /></>;
}
