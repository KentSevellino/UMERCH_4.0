import type { Product } from "@/types/product";
import type { ImageSourcePropType } from "react-native";
import { request } from "./apiClient";

type ApiProduct = {
  product_id: number;
  product_name: string;
  product_image?: string | null;
  image_url?: string | null;
  product_description?: string | null;
  product_price: number | string;
  product_stock?: number;
  variant?: string | null;
  variant_type?: string | null;
  status?: string;
};

const fallbackImage: ImageSourcePropType = require("../assets/images/product-image/new-arrival.png");

function formatPrice(price: number | string) {
  const amount = Number(price);
  return Number.isFinite(amount) ? `₱${amount.toFixed(2)}` : `₱${price}`;
}

function mapProduct(product: ApiProduct): Product {
  const image: ImageSourcePropType = product.image_url
    ? { uri: product.image_url }
    : fallbackImage;

  return {
    id: product.product_id,
    name: product.product_name,
    category: product.variant_type || product.variant || "Other",
    price: formatPrice(product.product_price),
    image,
    description: product.product_description ?? undefined,
    stock: product.product_stock ?? 0,
    variant: product.variant ?? undefined,
    variantType: product.variant_type ?? undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  const products = await request<ApiProduct[]>("/products");
  return products.map(mapProduct);
}
