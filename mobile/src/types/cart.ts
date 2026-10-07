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
