import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItemData } from "@/components/navigation/cart/CartItem";
import type { Product } from "@/types/product";

type CartContextValue = {
  items: CartItemData[];
  totalCount: number;
  bump: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const toNumber = (value: string) =>
  parseFloat(value.replace(/[^\d.]/g, "")) || 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [bump, setBump] = useState(0);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: toNumber(product.price),
          image: product.image,
          quantity,
        },
      ];
    });

    setBump((current) => current + 1);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, totalCount, bump, addItem, removeItem, updateQuantity }),
    [items, totalCount, bump, addItem, removeItem, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}