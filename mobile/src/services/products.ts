import type { ImageSourcePropType } from "react-native";

import type { Product } from "@/types/product";
import { API_URL, request } from "./apiClient";

export type ApiInventoryRow = {
  inventory_id: number;
  product_id: number;
  variant: string;
  quantity: number;
  status: string;
  cost: string | null;
};

export type ApiProduct = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_description: string | null;
  product_price: string;
  product_stock: number;
  variant: string;
  variant_type: string | null;
  category?: string | null;
  category_name?: string | null;
  product_category?: string | null;
  status: string;
  inventory: ApiInventoryRow[];
};

export type CategoryTaxonomy = {
  shirts: string;
  bags: string;
  drinkware: string;
  school: string;
  other: string;
};

export const HOME_TAXONOMY: CategoryTaxonomy = {
  shirts: "Shirts",
  bags: "Accessories",
  drinkware: "Bottles",
  school: "Others",
  other: "Others",
};

export const SHOP_TAXONOMY: CategoryTaxonomy = {
  shirts: "Jersey",
  bags: "Bags",
  drinkware: "Drinkware",
  school: "School Supplies",
  other: "Others",
};

const STORAGE_BASE = API_URL.replace(/\/api\/?$/, "");

export function normalizeImageUrl(
  path?: string | null,
): ImageSourcePropType | null {
  if (!path) return null;

  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("file:")
  ) {
    return { uri: path };
  }

  return { uri: `${STORAGE_BASE}/storage/${path.replace(/^\/+/, "")}` };
}

type CategoryRule = { bucket: keyof CategoryTaxonomy; pattern: RegExp };

const CATEGORY_RULES: CategoryRule[] = [
  { bucket: "shirts", pattern: /(jersey|shirt|tee|top|polo|uniform)/i },
  { bucket: "bags", pattern: /(tote|bag|backpack|sling|pouch)/i },
  { bucket: "drinkware", pattern: /(tumbler|mug|bottle|cup|drinkware)/i },
  { bucket: "school", pattern: /(notebook|pen|paper|pad|planner|pencil)/i },
];

export function deriveCategory(
  name: string,
  taxonomy: CategoryTaxonomy,
): string {
  const match = CATEGORY_RULES.find((rule) => rule.pattern.test(name));

  return match ? taxonomy[match.bucket] : taxonomy.other;
}

function toPriceLabel(value: string): string {
  const amount = parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

  return `₱${amount.toFixed(2)}`;
}

export function mapToProduct(
  row: ApiProduct,
  taxonomy: CategoryTaxonomy,
): Product {
  const variants = Array.from(
    new Set(
      (row.inventory ?? [])
        .map((entry) => entry.variant.trim())
        .filter(Boolean),
    ),
  );
  const variantStocks = Object.fromEntries(
    (row.inventory ?? []).map((entry) => [
      entry.variant.trim(),
      Math.max(0, Number(entry.quantity) || 0),
    ]),
  );

  return {
    id: row.product_id,
    name: row.product_name,
    category:
      row.category ??
      row.category_name ??
      row.product_category ??
      deriveCategory(row.product_name, taxonomy),
    price: toPriceLabel(row.product_price),
    image:
      normalizeImageUrl(row.product_image) ??
      require("../assets/images/umerch-logo.png"),
    description: row.product_description ?? undefined,
    variants: variants.length > 0 ? variants : undefined,
    variantStocks,
    variant: row.variant?.trim() || undefined,
    variantType: row.variant_type?.trim() || undefined,
    hasSize: /size/i.test(row.variant_type ?? ""),
    stock: row.product_stock,
  };
}

export function fetchProducts(): Promise<ApiProduct[]> {
  return request<ApiProduct[]>("/products");
}
