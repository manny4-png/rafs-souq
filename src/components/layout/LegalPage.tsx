import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return <><header className="border-b border-[#a6514b]/10 bg-cream px-5 pb-14 pt-36 text-center"><p className="mb-3 font-inter text-[0.68rem] uppercase tracking-[0.28em] text-gold">{eyebrow}</p><h1 className="font-playfair text-4xl text-charcoal sm:text-6xl">{title}</h1><p className="mt-4 font-inter text-xs text-muted">Last updated: {updated}</p></header><main className="mx-auto max-w-[900px] px-5 py-16"><div className="space-y-10 font-inter text-sm leading-7 text-muted [&_a]:text-[#a6514b] [&_a]:underline [&_h2]:mb-3 [&_h2]:font-playfair [&_h2]:text-2xl [&_h2]:text-charcoal [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:space-y-2">{children}</div></main><Footer /></>;
}
