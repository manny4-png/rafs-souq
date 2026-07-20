import type { Metadata } from "next";
import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved Raf's Souq pieces.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
