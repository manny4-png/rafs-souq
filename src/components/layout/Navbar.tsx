"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const solidNav = scrolled || pathname !== "/";
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!searchOpen && !mobileOpen) return;
    if (searchOpen) searchInputRef.current?.focus();
    if (mobileOpen) mobileCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, searchOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          solidNav
            ? "bg-cream/[0.97] backdrop-blur-md border-b border-gold/10 shadow-sm py-3"
            : "bg-transparent py-5"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] mx-auto px-5 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "inline-flex items-center transition-opacity duration-300 hover:opacity-75"
            )}
            aria-label="Raf's Souq - Home"
          >
            <BrandLogo tone="dark" size="nav" />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-8 list-none" ref={dropdownRef}>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative">
                {link.children ? (
                  <button
                    className={cn(
                      "flex items-center gap-1 text-[0.72rem] tracking-luxury uppercase font-bold transition-colors duration-300",
                      solidNav ? "text-muted hover:text-gold" : "text-charcoal/70 hover:text-[#a6514b]"
                    )}
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    aria-expanded={activeDropdown === link.label}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform duration-300",
                        activeDropdown === link.label ? "rotate-180" : ""
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[0.72rem] tracking-luxury uppercase font-bold transition-colors duration-300",
                      solidNav ? "text-muted hover:text-gold" : "text-charcoal/70 hover:text-[#a6514b]"
                    )}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown */}
                {link.children && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 w-52 bg-cream border border-gold/10 shadow-xl py-2"
                        onMouseEnter={() => setActiveDropdown(link.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-[0.78rem] text-muted hover:text-gold hover:bg-sand/20 transition-colors duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn(
                "p-2 transition-colors duration-300",
                solidNav ? "text-muted hover:text-gold" : "text-charcoal/70 hover:text-[#a6514b]"
              )}
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className={cn(
                "p-2 relative transition-colors duration-300",
                solidNav ? "text-muted hover:text-gold" : "text-charcoal/70 hover:text-[#a6514b]"
              )}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[0.6rem] rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleCart}
              aria-label={`Open cart (${totalItems} items)`}
              className={cn(
                "p-2 relative transition-colors duration-300",
                solidNav ? "text-muted hover:text-gold" : "text-charcoal/70 hover:text-[#a6514b]"
              )}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[0.6rem] rounded-full flex items-center justify-center font-semibold"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={cn(
                "lg:hidden p-2 transition-colors duration-300",
                solidNav ? "text-charcoal" : "text-charcoal/80"
              )}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/95 flex items-start justify-center pt-32 px-5"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-white/20 pb-4">
                <Search size={20} className="text-gold mr-4" />
                <input
                  type="search"
                  ref={searchInputRef}
                  placeholder="Search turbans, shades, veils..."
                  autoFocus
                  className="flex-1 bg-transparent text-white text-xl placeholder:text-white/30 outline-none font-cormorant"
                  aria-label="Search products"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-white/30 text-sm mt-4 font-inter">
                Try &quot;signature turban&quot;, &quot;oversized shades&quot;, or &quot;chiffon veil&quot;
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[70] bg-cream flex flex-col"
            aria-modal="true"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex justify-between items-center p-6 border-b border-charcoal/5">
              <Link
                href="/"
                className="inline-flex items-center"
                onClick={() => setMobileOpen(false)}
                aria-label="Raf's Souq - Home"
              >
                <BrandLogo tone="dark" size="nav" />
              </Link>
              <button
                ref={mobileCloseRef}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-muted hover:text-charcoal"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    className="block font-playfair text-2xl font-bold text-charcoal hover:text-gold py-3 border-b border-charcoal/5 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="p-6 border-t border-charcoal/5">
              <p className="font-cormorant text-muted italic text-sm">
                &ldquo;Elegance Woven Into Every Thread&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
