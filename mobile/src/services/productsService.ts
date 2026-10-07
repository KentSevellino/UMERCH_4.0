import type { Product } from "@/types/product";
import { request } from "./apiClient";
import { mapToProduct, SHOP_TAXONOMY, type ApiProduct } from "./products";

export async function getProducts(): Promise<Product[]> {
  const products = await request<ApiProduct[]>("/products");
  return products.map((product) => mapToProduct(product, SHOP_TAXONOMY));
}

export async function getProduct(id: number | string): Promise<Product> {
  const product = await request<ApiProduct>(`/products/${id}`);
  return mapToProduct(product, SHOP_TAXONOMY);
}

