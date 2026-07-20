export interface Product {
  id: string;
  backendId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  images: string[];
  badge?: "New" | "Sale" | "Bestseller" | "Exclusive" | "Limited";
  colors: ProductColor[];
  sizes?: string[];
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  description: string;
  details: string[];
  inStock: boolean;
  tags: string[];
}

export type ProductCategory = string;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  backendId: string;
  colorName: string;
  colorHex: string;
  size: string;
  priceAdjustment: number;
  stockQuantity: number;
  inStock: boolean;
}

export interface CartItem {
  key?: string;
  product: Product;
  quantity: number;
  selectedColor?: ProductColor;
  selectedSize?: string;
  selectedVariantId?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
  category: ProductCategory;
  featured?: boolean;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}
