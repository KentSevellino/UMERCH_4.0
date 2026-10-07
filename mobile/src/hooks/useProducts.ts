import { getProducts } from "@/services/productsService";
import type { Product } from "@/types/product";
import { useCallback, useEffect, useState } from "react";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProducts();
      setProducts(result);
      setError(null);
    } catch (requestError: any) {
      setError(requestError?.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { products, isLoading, error, refetch: fetchItems };
}

