import type { ImageSourcePropType } from "react-native";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  hasSize?: boolean;
  image: ImageSourcePropType;
  description?: string;
  variants?: string[];
  variantStocks?: Record<string, number>;
  stock?: number;
  variant?: string;
  variantType?: string;
};
