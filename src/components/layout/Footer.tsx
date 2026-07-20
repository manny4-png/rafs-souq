import Link from "next/link";
import { Instagram } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const footerLinks = {
  Shop: [
    { label: "Turbans", href: "/shop?category=turbans" },
    { label: "Shades", href: "/shop?category=shades" },
    { label: "Veils", href: "/shop?category=veils" },
    { label: "Ready to Wear Dresses", href: "/shop?category=ready-to-wear" },
  ],
  Help: [
    { label: "Turban Cap FAQs", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  Company: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#111] text-white/70">
      <div className="max-w-[1400px] mx-auto px-5 pt-16 pb-8">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center mb-3 hover:opacity-80 transition-opacity"
              aria-label="Raf's Souq - Home"
            >
              <BrandLogo tone="light" size="footer" />
            </Link>
            <p className="font-cormorant italic text-white/40 mb-6 text-base leading-relaxed">
              &ldquo;Elegance Woven Into Every Thread&rdquo;
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="https://www.instagram.com/rafssouq/"
                  aria-label={label}
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold hover:text-gold transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-[0.68rem] tracking-[0.2em] uppercase text-white font-semibold mb-5 font-inter">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.87rem] text-white/45 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[0.77rem] text-white/30 font-inter">
            © {new Date().getFullYear()} Raf&apos;s Souq. All rights reserved.
          </p>
          <div className="flex gap-5 font-inter text-[0.72rem] text-white/35">
            <Link href="/terms" className="hover:text-gold">Terms</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
