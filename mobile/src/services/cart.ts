import { request } from "./apiClient";
import { getToken } from "./tokenStorage";

export type ApiCartProduct = {
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_description: string | null;
  category?: string | null;
  category_name?: string | null;
  product_category?: string | null;
  variant?: string | null;
  variant_type?: string | null;
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
  const token = await getToken();
  const body = {
    product_id: input.productId,
    variant: input.variant,
    quantity: input.quantity,
    price: input.price,
  };

  try {
    await request("/cart", {
      method: "POST",
      token,
      body,
    });
  } catch (err: any) {
    if (err?.status === 404 || err?.status === 405) {
      await request("/cart/add", {
        method: "POST",
        token,
        body,
      });
      return;
    }
    throw err;
  }
}


export async function updateCartQuantity(
  cartItemId: number,
  quantity: number,
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
