import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Raf's Souq for questions about turbans, shades, veils, ready to wear dresses, delivery, and styling advice.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
