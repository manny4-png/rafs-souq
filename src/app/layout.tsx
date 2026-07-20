import type { Metadata, Viewport } from "next";
import { serializeJsonLd } from "@/lib/json-ld";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SITE_URL } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Raf's Souq - Signature Turbans, Shades, Veils and Dresses",
    template: "%s | Raf's Souq",
  },
  description:
    "Shop Raf's Souq for signature turbans, polished shades, soft veils, and ready to wear modest dresses priced in Ghana cedis.",
  keywords: [
    "turbans Ghana",
    "Ghana modest fashion",
    "veils",
    "ready to wear dresses",
    "shades",
    "modest fashion",
  ],
  authors: [{ name: "Raf's Souq" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Raf's Souq - Signature Turbans, Shades, Veils and Dresses",
    description:
      "Shop signature turbans, polished shades, soft veils, and ready to wear modest dresses.",
    url: SITE_URL,
    siteName: "Raf's Souq",
    type: "website",
    locale: "en_GH",
    images: [
      {
        url: "/brand/rafs-souq-logo.png",
        width: 1177,
        height: 803,
        alt: "Raf's Souq brand logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raf's Souq",
    description: "Signature turbans, shades, veils, and ready to wear dresses.",
    images: ["/brand/rafs-souq-logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F8F4EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Raf's Souq",
    url: SITE_URL,
    sameAs: ["https://instagram.com/rafssouq"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Raf's Souq",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en-GH">
      <body className="bg-cream text-charcoal antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <Navbar />
        <main>{children}</main>
        <CartDrawer />
        <WhatsAppButton />
        <Toast />
      </body>
    </html>
  );
}
