import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";

type FavoritesContextValue = {
  favorites: Product[];
  totalCount: number;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);

  const isFavorite = useCallback(
    (id: number) => favorites.some((product) => product.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    );
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((current) => current.filter((item) => item.id !== id));
  }, []);

  const totalCount = favorites.length;

  const value = useMemo(
    () => ({ favorites, totalCount, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, totalCount, isFavorite, toggleFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}