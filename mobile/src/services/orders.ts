import { File as ExpoFile } from "expo-file-system";
import { Platform, type ImageSourcePropType } from "react-native";
import { API_URL, request } from "./apiClient";
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
  const token = await getToken();
  const body = {
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
  };

  try {
    const result = await request<{ orderId: number }>("/orders", {
      method: "POST",
      token,
      body,
    });
    return result.orderId;
  } catch (err: any) {
    if (err?.status === 404 || err?.status === 405) {
      const fallbackResult = await request<{ orderId: number }>("/orders/place", {
        method: "POST",
        token,
        body,
      });
      return fallbackResult.orderId;
    }
    throw err;
  }
}


export async function fetchOrders(): Promise<ApiOrder[]> {
  const rows = await request<ApiOrder[]>("/orders", {
    token: await getToken(),
  });

  return Array.isArray(rows) ? rows : [];
}

export type UploadReceiptResponse = {
  message: string;
  file_path?: string;
  new_status?: string;
  receipt_form?: string;
};

export type ReceiptUploadSource =
  | string
  | {
      uri?: string;
      base64?: string | null;
      fileName?: string | null;
      mimeType?: string | null;
      name?: string | null;
      type?: string | null;
      file?: any;
    }
  | any;

export async function uploadOrderReceipt(
  orderId: number | string,
  source: ReceiptUploadSource,
  fileName?: string | null,
  mimeType?: string | null,
): Promise<UploadReceiptResponse> {
  const isWeb = Platform.OS === "web";
  const rawUri = typeof source === "string" ? source : source?.uri || "";

  const nameCandidate =
    (typeof source === "object" && (source?.fileName || source?.name)) ||
    fileName ||
    (rawUri ? rawUri.split("/").pop()?.split("?")[0] : "") ||
    `receipt_${orderId}_${Date.now()}.jpg`;

  const rawExt = nameCandidate.split(".").pop()?.toLowerCase() || "jpg";
  const ext = rawExt === "jpeg" ? "jpg" : rawExt;
  const resolvedName = nameCandidate.includes(".")
    ? nameCandidate
    : `${nameCandidate}.${ext === "png" ? "png" : ext === "pdf" ? "pdf" : "jpg"}`;

  const rawType =
    (typeof source === "object" && (source?.mimeType || source?.type)) ||
    mimeType;
  const resolvedType =
    rawType && rawType !== "image/jpg"
      ? rawType
      : ext === "png"
        ? "image/png"
        : ext === "pdf"
          ? "application/pdf"
          : "image/jpeg";

  // 1. Mobile & Universal base64 upload
  // Bypasses React Native's WinterCG fetch FormData bug ("Unsupported FormDataPart implementation")
  let base64Data: string | null =
    typeof source === "object" && source?.base64 ? source.base64 : null;

  if (!base64Data && rawUri && !isWeb) {
    try {
      const expoFile = new ExpoFile(rawUri);
      if (expoFile.exists) {
        base64Data = await expoFile.base64();
      }
    } catch {
      // expo-file-system File fallback
    }

    if (!base64Data) {
      try {
        const response = await fetch(rawUri);
        const blob = await response.blob();
        base64Data = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res?.includes(",") ? res.split(",")[1] : res || null);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        // fallback
      }
    }
  }

  if (base64Data) {
    return request<UploadReceiptResponse>(`/orders/${orderId}/upload-receipt`, {
      method: "POST",
      token: await getToken(),
      body: {
        receipt_base64: base64Data,
        file_ext: ext,
      },
    });
  }

  // 2. Web or native multipart fallback using standard FormData
  const formData = new FormData();
  if (
    typeof source === "object" &&
    source !== null &&
    (typeof (source as any).size === "number" ||
      typeof (source as any).slice === "function") &&
    !("uri" in source)
  ) {
    formData.append("receipt_form", source, resolvedName);
  } else if (typeof source === "object" && source?.file) {
    formData.append("receipt_form", source.file, resolvedName);
  } else if (rawUri) {
    const response = await fetch(rawUri);
    const blob = await response.blob();
    formData.append("receipt_form", blob, resolvedName);
  }

  return request<UploadReceiptResponse>(`/orders/${orderId}/upload-receipt`, {
    method: "POST",
    token: await getToken(),
    body: formData,
  });
}

export type MarkReceivedResponse = {
  message: string;
  order_status?: string;
  order?: {
    order_id: number;
    status: string;
    order_status?: string;
  };
};

export async function markOrderAsReceived(
  orderId: number | string,
): Promise<MarkReceivedResponse> {
  return request<MarkReceivedResponse>(`/orders/${orderId}/receive`, {
    method: "PATCH",
    token: await getToken(),
  });
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
