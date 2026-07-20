import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductClient } from "./ProductClient";
import { SITE_URL } from "@/lib/data";
import { getProduct, getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function categoryLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};

  const url = `/product/${product.id}`;
  const title = `${product.name} - ${formatPrice(product.price)}`;

  return {
    title,
    description: product.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: product.description,
      url,
      type: "website",
      images: product.images[0]
        ? [
            {
              url: product.images[0],
              width: 1200,
              height: 1600,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const products = await getProducts();
  const related = products.filter(
    (item) => item.category === product.category && item.id !== product.id
  ).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    category: categoryLabel(product.category),
    brand: {
      "@type": "Brand",
      name: "Raf's Souq",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "GHS",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${SITE_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClient product={product} related={related} />
    </>
  );
}
