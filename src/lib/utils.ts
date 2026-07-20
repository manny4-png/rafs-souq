import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function getDiscountPercentage(
  original: number,
  sale: number
): number {
  return Math.round(((original - sale) / original) * 100);
}

export function truncate(str: string, length = 100): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}
