import { useEffect, useState } from "react";

import {
  fetchProducts,
  mapToProduct,
  type ApiProduct,
  type CategoryTaxonomy,
} from "@/services/products";
import type { Product } from "@/types/product";

export function useProducts(
  fallback: Product[],
  taxonomy: CategoryTaxonomy
): Product[] {
  const [products, setProducts] = useState<Product[]>(fallback);

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((rows: ApiProduct[]) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;

        setProducts(rows.map((row) => mapToProduct(row, taxonomy)));
      })
      .catch(() => setProducts(fallback));

    return () => {
      cancelled = true;
    };
  }, [fallback, taxonomy]);

  return products;
}
