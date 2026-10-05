import { request } from "./api";
import { getToken } from "./token-storage";

export type ApiCartProduct = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_description: string | null;
};

export type ApiCartItem = {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  variant: string | null;
  quantity: number;
  price: string;
  product?: ApiCartProduct | null;
};

export type AddToCartInput = {
  productId: number;
  variant: string;
  quantity: number;
  price: number;
};

export async function fetchCart(): Promise<ApiCartItem[]> {
  const rows = await request<ApiCartItem[]>("/cart", {
    token: await getToken(),
  });

  return Array.isArray(rows) ? rows : [];
}

export async function addToCart(input: AddToCartInput): Promise<void> {
  await request("/cart/add", {
    method: "POST",
    token: await getToken(),
    body: {
      product_id: input.productId,
      variant: input.variant,
      quantity: input.quantity,
      price: input.price,
    },
  });
}

export async function updateCartQuantity(
  cartItemId: number,
  quantity: number
): Promise<void> {
  await request(`/cart/${cartItemId}`, {
    method: "PUT",
    token: await getToken(),
    body: { quantity },
  });
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  await request(`/cart/${cartItemId}`, {
    method: "DELETE",
    token: await getToken(),
  });
}
