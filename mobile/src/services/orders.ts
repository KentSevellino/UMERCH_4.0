import type { ImageSourcePropType } from "react-native";
import { request } from "./apiClient";
import { normalizeImageUrl } from "./products";
import { getToken } from "./tokenStorage";

export type OrderCartItem = {
  cartItemId?: number;
  productId: number;
  variant: string;
  quantity: number;
  price: number;
};

export type PlaceOrderInput = {
  cartItems: OrderCartItem[];
  paymentMethod?: "cashier" | "salary_deduction";
  fulfillmentMethod: string;
  campus?: string | null;
};

export type ApiOrderItem = {
  quantity: number;
  price: string | number;
  variant: string;
  subtotal: string | number;
  product: {
    product_id: number;
    product_name: string;
    product_image: string | null;
    product_description: string | null;
    category?: string | null;
    category_name?: string | null;
    product_category?: string | null;
  } | null;
};

export type ApiOrder = {
  order_id: number;
  order_status: string;
  order_total: string | number;
  fulfillment_method: string;
  campus: string | null;
  receipt_form: string | null;
  created_at: string;
  order_items: ApiOrderItem[];
};

export type OrderCardData = {
  id: string;
  date: string;
  status: "To Pay" | "To Receive" | "Completed" | "Canceled";
  productName: string;
  category?: string;
  variant?: string;
  quantity: number;
  price: number;
  image: ImageSourcePropType;
};

export async function placeOrder(input: PlaceOrderInput): Promise<number> {
  const result = await request<{ orderId: number }>("/orders/place", {
    method: "POST",
    token: await getToken(),
    body: {
      payment_method: input.paymentMethod ?? "cashier",
      fulfillment_method: input.fulfillmentMethod,
      campus: input.campus ?? null,
      cart_items: input.cartItems.map((item) => ({
        cart_item_id: item.cartItemId ?? null,
        product_id: item.productId,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });

  return result.orderId;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const rows = await request<ApiOrder[]>("/orders", {
    token: await getToken(),
  });

  return Array.isArray(rows) ? rows : [];
}

const toNumber = (value: string | number) =>
  parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

export function toOrderCardData(order: ApiOrder): OrderCardData {
  const items = order.order_items ?? [];
  const first = items[0];
  const quantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const name = first?.product?.product_name ?? "Order";
  const category =
    first?.product?.category ??
    first?.product?.category_name ??
    first?.product?.product_category ??
    undefined;

  const status = (() => {
    switch ((order.order_status ?? "").toLowerCase()) {
      case "completed":
        return "Completed";
      case "cancelled":
      case "canceled":
        return "Canceled";
      case "processing":
      case "out-of-delivery":
      case "ready-for-pickup":
        return "To Receive";
      default:
        return "To Pay";
    }
  })();

  return {
    id: String(order.order_id),
    date: order.created_at
      ? new Date(order.created_at).toLocaleDateString("en-PH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
    status,
    productName: items.length > 1 ? `${name} +${items.length - 1} more` : name,
    category,
    variant: first?.variant ?? undefined,
    quantity: quantity || 1,
    price: toNumber(order.order_total),
    image:
      normalizeImageUrl(first?.product?.product_image) ??
      require("../assets/images/umerch-logo.png"),
  };
}
