import type { MetadataRoute } from "next";
import { COLLECTIONS, PRODUCTS, SITE_URL } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/collections",
    "/contact",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/shop" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/product/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map((collection) => ({
    url: `${SITE_URL}/shop?category=${collection.category}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
