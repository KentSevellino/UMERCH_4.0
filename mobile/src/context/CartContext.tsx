<<<<<<< HEAD
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItemData } from "@/components/navigation/cart/CartItem";
import { useAuth } from "@/context/AuthContext";
import {
  addToCart,
  fetchCart,
  removeCartItem,
  updateCartQuantity,
  type ApiCartItem,
} from "@/services/cart";
import { normalizeImageUrl, SHOP_TAXONOMY, deriveCategory } from "@/services/products";
=======
import type { CartItemData } from "@/components/cart/CartItem";
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
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
<<<<<<< HEAD
  addItem: (product: Product, quantity: number, variant: string) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
=======
  addItem: (product: Product, quantity: number) => void;
  placeOrder: () => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
};

export type PlacedOrder = {
  id: string;
  date: string;
  items: CartItemData[];
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_ITEMS: CartItemData[] = [];

const toNumber = (value: string) =>
  parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

function toCartItem(row: ApiCartItem): CartItemData {
  const name = row.product?.product_name ?? "Product";

  return {
    id: row.product_id,
    cartItemId: row.cart_item_id,
    name,
    category: deriveCategory(name, SHOP_TAXONOMY),
    price: toNumber(row.price),
    image:
      normalizeImageUrl(row.product?.product_image) ??
      require("../assets/images/umerch-logo.png"),
    quantity: row.quantity,
    variant: row.variant ?? "",
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
<<<<<<< HEAD
  const { status } = useAuth();

  const [storedItems, setStoredItems] = useState<CartItemData[]>([]);
=======
  const [items, setItems] = useState<CartItemData[]>([]);
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItemData[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
  const [bump, setBump] = useState(0);

  const items = status === "authenticated" ? storedItems : EMPTY_ITEMS;

<<<<<<< HEAD
  const refresh = useCallback(
    () =>
      fetchCart()
        .then((rows) => {
          setStoredItems(rows.map(toCartItem));
        })
        .catch(() => setStoredItems((current) => current)),
    []
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    void refresh();
  }, [status, refresh]);

  const addItem = useCallback(
    async (product: Product, quantity: number, variant: string) => {
      const price = toNumber(product.price);

      setStoredItems((current) => {
        const existing = current.find(
          (item) => item.id === product.id && item.variant === variant
=======
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
        );

        if (existing) {
          return current.map((item) =>
            item === existing ? { ...item, quantity: item.quantity + quantity } : item
          );
        }

        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            price,
            image: product.image,
            quantity,
            variant,
          },
        ];
      });

      try {
        await addToCart({
          productId: product.id,
          variant,
          quantity,
          price,
        });

        await refresh();
        setBump((current) => current + 1);
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh]
  );

<<<<<<< HEAD
  const removeItem = useCallback(
    async (cartItemId: number) => {
      setStoredItems((current) => current.filter((item) => item.cartItemId !== cartItemId));

      try {
        await removeCartItem(cartItemId);
        await refresh();
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      if (quantity < 1) return;

      setStoredItems((current) =>
        current.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )
      );

      try {
        await updateCartQuantity(cartItemId, quantity);
        await refresh();
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh]
  );
=======
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
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
<<<<<<< HEAD
    () => ({ items, totalCount, bump, addItem, removeItem, updateQuantity, refresh }),
    [items, totalCount, bump, addItem, removeItem, updateQuantity, refresh]
=======
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
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
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
