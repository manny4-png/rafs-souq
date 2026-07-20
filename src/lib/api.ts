import type { Collection, Product, ProductCategory, ProductColor } from "@/types";

const FALLBACK_API_URL = "http://127.0.0.1:8000/api";

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL).replace(/\/$/, "");
}

type BackendVariant = {
  colorName?: string;
  colorHex?: string;
  size?: string;
};

type BackendProduct = {
  id: number | string;
  name: string;
  slug: string;
  category: string;
  description: string;
  details?: string[];
  tags?: string[];
  price: string;
  compareAtPrice?: string | null;
  badge?: Product["badge"] | null;
  inStock: boolean;
  images?: string[];
  variants?: BackendVariant[];
};

type BackendCategory = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
};

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function productColors(variants: BackendVariant[] | undefined): ProductColor[] {
  const colors = uniqueBy(
    (variants || [])
      .filter((variant) => variant.colorName && variant.colorHex)
      .map((variant) => ({
        name: variant.colorName || "",
        hex: variant.colorHex || "",
      })),
    (color) => `${color.name}-${color.hex}`
  );

  return colors.length ? colors : [{ name: "Default", hex: "#C9A227" }];
}

function productSizes(variants: BackendVariant[] | undefined): string[] {
  const sizes = uniqueBy(
    (variants || [])
      .filter((variant) => variant.size)
      .map((variant) => variant.size || ""),
    (size) => size
  );

  return sizes.length ? sizes : ["One Size"];
}

function mapProduct(product: BackendProduct): Product {
  return {
    id: product.slug,
    backendId: String(product.id),
    name: product.name,
    price: Number(product.price),
    originalPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : undefined,
    category: product.category,
    images: product.images?.length
      ? product.images
      : ["/brand/rafs-souq-logo.png"],
    badge: product.badge || undefined,
    colors: productColors(product.variants),
    sizes: productSizes(product.variants),
    rating: 5,
    reviewCount: 0,
    description: product.description,
    details: product.details?.length ? product.details : [product.description],
    inStock: product.inStock,
    tags: product.tags || [],
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  const data = await apiFetch<{ products: BackendProduct[] }>("/products/");
  return data.products.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const data = await apiFetch<{ product: BackendProduct }>(
      `/products/${slug}/`
    );
    return mapProduct(data.product);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return undefined;
    }
    throw error;
  }
}

export async function getCategories(): Promise<Collection[]> {
  const [{ categories }, products] = await Promise.all([
    apiFetch<{ categories: BackendCategory[] }>("/categories/"),
    getProducts(),
  ]);

  return categories.map((category) => {
    const categorySlug = category.slug as ProductCategory;

    return {
      id: String(category.id),
      name: category.name,
      description: category.description || "",
      image: category.image || "/brand/rafs-souq-logo.png",
      itemCount: products.filter((product) => product.category === categorySlug)
        .length,
      category: categorySlug,
      featured: products.some(
        (product) => product.category === categorySlug && product.badge === "Bestseller"
      ),
    };
  });
}
