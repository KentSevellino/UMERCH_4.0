import type { ImageSourcePropType } from "react-native";

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
