import type { CartItemData } from "@/components/cart/CartItem";
import { useAuth } from "@/context/AuthContext";
import {
    addToCart,
    fetchCart,
    removeCartItem,
    updateCartQuantity,
    type ApiCartItem,
} from "@/services/cart";
import {
    deriveCategory,
    normalizeImageUrl,
    SHOP_TAXONOMY,
} from "@/services/products";
import type { Product } from "@/types/product";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type CartContextValue = {
  items: CartItemData[];
  selectedItems: CartItemData[];
  selectedCartItemIds: number[];
  toggleItemSelection: (cartItemId: number) => void;
  selectAllItems: () => void;
  placedOrderItems: CartItemData[];
  placedOrders: PlacedOrder[];
  totalCount: number;
  bump: number;
  addItem: (
    product: Product,
    quantity: number,
    variant?: string,
  ) => Promise<void>;
  placeOrder: () => void;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
};

export type PlacedOrder = {
  id: string;
  date: string;
  items: CartItemData[];
};

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_ITEMS: CartItemData[] = [];

const toNumber = (value: string | number) =>
  parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

function toCartItem(row: ApiCartItem): CartItemData {
  const name = row.product?.product_name ?? "Product";

  return {
    id: row.product_id,
    cartItemId: row.cart_item_id,
    name,
    category:
      row.product?.category ??
      row.product?.category_name ??
      row.product?.product_category ??
      deriveCategory(name, SHOP_TAXONOMY),
    price: toNumber(row.price),
    image:
      normalizeImageUrl(row.product?.product_image) ??
      require("../assets/images/umerch-logo.png"),
    quantity: row.quantity,
    variant: row.variant ?? row.product?.variant ?? "",
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [storedItems, setStoredItems] = useState<CartItemData[]>([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<number[]>([]);
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItemData[]>([]);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [bump, setBump] = useState(0);
  const items = status === "authenticated" ? storedItems : EMPTY_ITEMS;

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchCart();
      const nextItems = rows.map(toCartItem);
      setStoredItems(nextItems);
      setSelectedCartItemIds((current) => {
        const availableIds = new Set(
          nextItems.map((item) => item.cartItemId ?? item.id),
        );
        const retainedIds = current.filter((id) => availableIds.has(id));
        return retainedIds.length > 0 || current.length > 0
          ? retainedIds
          : nextItems.map((item) => item.cartItemId ?? item.id);
      });
    } catch {
      setStoredItems((current) => current);
    }
  }, []);

  const toggleItemSelection = useCallback((cartItemId: number) => {
    setSelectedCartItemIds((current) =>
      current.includes(cartItemId)
        ? current.filter((id) => id !== cartItemId)
        : [...current, cartItemId],
    );
  }, []);

  const selectAllItems = useCallback(() => {
    const itemIds = items.map((item) => item.cartItemId ?? item.id);
    setSelectedCartItemIds((current) =>
      itemIds.length > 0 && itemIds.every((id) => current.includes(id))
        ? []
        : itemIds,
    );
  }, [items]);

  useEffect(() => {
    if (status === "authenticated") void refresh();
  }, [status, refresh]);

  const addItem = useCallback(
    async (product: Product, quantity: number, variant = "") => {
      const price = toNumber(product.price);
      await addToCart({ productId: product.id, variant, quantity, price });
      await refresh();
      setBump((current) => current + 1);
    },
    [refresh],
  );

  const placeOrder = useCallback(() => {
    if (items.length === 0) return;
    setPlacedOrderItems(items);
    setPlacedOrders((current) => [
      { id: `${Date.now()}`, date: "Placed just now", items },
      ...current,
    ]);
  }, [items]);

  const removeItem = useCallback(
    async (cartItemId: number) => {
      await removeCartItem(cartItemId);
      await refresh();
    },
    [refresh],
  );

  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      if (quantity < 1) return;
      await updateCartQuantity(cartItemId, quantity);
      await refresh();
    },
    [refresh],
  );

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const selectedItems = useMemo(
    () =>
      items.filter((item) =>
        selectedCartItemIds.includes(item.cartItemId ?? item.id),
      ),
    [items, selectedCartItemIds],
  );

  const value = useMemo(
    () => ({
      items,
      selectedItems,
      selectedCartItemIds,
      toggleItemSelection,
      selectAllItems,
      placedOrderItems,
      placedOrders,
      totalCount,
      bump,
      addItem,
      placeOrder,
      removeItem,
      updateQuantity,
      refresh,
    }),
    [
      items,
      selectedItems,
      selectedCartItemIds,
      toggleItemSelection,
      selectAllItems,
      placedOrderItems,
      placedOrders,
      totalCount,
      bump,
      addItem,
      placeOrder,
      removeItem,
      updateQuantity,
      refresh,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
