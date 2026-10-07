import { getProduct } from "@/services/productsService";
import type { Product } from "@/types/product";
import { useCallback, useEffect, useState } from "react";

export function useProduct(id?: number | string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch (err: any) {
      setError(err?.message || `Failed to load product ${id}`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { product, isLoading, error, refetch: fetchItem };
}
