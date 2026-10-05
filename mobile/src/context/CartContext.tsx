import type { CartItemData } from "@/components/cart/CartItem";
import type { Product } from "@/types/product";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type CartContextValue = {
  items: CartItemData[];
  placedOrderItems: CartItemData[];
  placedOrders: PlacedOrder[];
  totalCount: number;
  bump: number;
  addItem: (product: Product, quantity: number) => void;
  placeOrder: () => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
};

export type PlacedOrder = {
  id: string;
  date: string;
  items: CartItemData[];
};

const CartContext = createContext<CartContextValue | null>(null);

const toNumber = (value: string) =>
  parseFloat(value.replace(/[^\d.]/g, "")) || 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItemData[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [bump, setBump] = useState(0);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
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

  const placeOrder = useCallback(() => {
    if (items.length === 0) {
      return;
    }

    setPlacedOrderItems(items);
    setPlacedOrders((current) => [
      {
        id: `${Date.now()}`,
        date: "Placed just now",
        items,
      },
      ...current,
    ]);
    setItems([]);
  }, [items]);

  const removeItem = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      placedOrderItems,
      placedOrders,
      totalCount,
      bump,
      addItem,
      placeOrder,
      removeItem,
      updateQuantity,
    }),
    [
      items,
      placedOrderItems,
      placedOrders,
      totalCount,
      bump,
      addItem,
      placeOrder,
      removeItem,
      updateQuantity,
    ],
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
